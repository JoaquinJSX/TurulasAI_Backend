import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configurable
const HISTORY_LIMIT = 50;

export const getMessagesByChat = async (req, res) => {
  try {
    const { id } = req.params; // GET /api/messages/:id

    const { rows } = await pool.query(
      `SELECT id, chat_id, role, content, created_at
       FROM messages
       WHERE chat_id=$1
       ORDER BY created_at ASC, id ASC
       LIMIT $2`,
      [id, HISTORY_LIMIT]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chat_id, content } = req.body;
    const userMsgId = uuidv4();

    // 1) Guarda el mensaje del usuario (Postgres asigna created_at con DEFAULT now())
    await pool.query(
      `INSERT INTO messages (id, chat_id, role, content)
       VALUES ($1, $2, 'user', $3)`,
      [userMsgId, chat_id, content]
    );

    // 2) Info del chat y del agente
    const chatQ = await pool.query(`SELECT * FROM chats WHERE id=$1`, [chat_id]);
    if (chatQ.rowCount === 0) {
      return res.status(404).json({ error: "Chat no encontrado" });
    }

    const agentQ = await pool.query(
      `SELECT * FROM agents WHERE id=$1`,
      [chatQ.rows[0].agent_id]
    );
    if (agentQ.rowCount === 0) {
      return res.status(404).json({ error: "Agente no encontrado" });
    }

    const { system_prompt, model } = agentQ.rows[0];

    // 3) Trae los últimos N mensajes (últimos DESC → luego ASC para cronológico)
    const historyQ = await pool.query(
      `SELECT role, content
       FROM (
         SELECT role, content, created_at, id
         FROM messages
         WHERE chat_id=$1
         ORDER BY created_at DESC, id DESC
         LIMIT $2
       ) sub
       ORDER BY created_at ASC, id ASC`,
      [chat_id, HISTORY_LIMIT]
    );

    // 4) Construye el contexto
    const context = [
      { role: "system", content: system_prompt },
      ...historyQ.rows.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 5) Llama al modelo
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: context,
      // temperature: 0.7,
      // max_tokens: 600,
    });

    const agentReply = completion.choices?.[0]?.message?.content ?? "";

    // 6) Guarda la respuesta del agente
    const assistantMsgId = uuidv4();
    await pool.query(
      `INSERT INTO messages (id, chat_id, role, content)
       VALUES ($1, $2, 'assistant', $3)`,
      [assistantMsgId, chat_id, agentReply]
    );

    // 7) Actualiza timestamp del chat
    await pool.query(`UPDATE chats SET updated_at=now() WHERE id=$1`, [
      chat_id,
    ]);

    res.json({ reply: agentReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await pool.query(
      `DELETE FROM messages WHERE id=$1 RETURNING id`,
      [id]
    );
    if (del.rowCount === 0) {
      return res.status(404).json({ error: "Mensaje no encontrado" });
    }
    res.json({ message: "Mensaje eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar mensaje" });
  }
};
