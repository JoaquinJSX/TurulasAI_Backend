import pool from "../db.js";

// Obtener todos los chats
export const getChats = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM chats ORDER BY updated_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener chats" });
  }
};

// Obtener un chat por UUID
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM chats WHERE id=$1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Chat no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener chat" });
  }
};

// Obtener todos los chats de un usuario
export const getChatsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM chats WHERE user_id=$1 ORDER BY updated_at DESC",
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener chats del usuario" });
  }
};

// Crear un chat
// Crear un chat
export const createChat = async (req, res) => {
  try {
    const { user_id, agent_id, category } = req.body;
    if (!user_id || !agent_id || !category) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const now = new Date();
    const result = await pool.query(
      `INSERT INTO chats (user_id, agent_id, category, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [user_id, agent_id, category, now, now]
    );

    const id = result.rows[0].id;
    return res.status(201).json({ id, user_id, agent_id, category, created_at: now });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al crear chat" });
  }
};


// Actualizar un chat (ej. cambiar agente o categoría)
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id, category } = req.body;
    const now = new Date();
    const result = await pool.query(
      "UPDATE chats SET agent_id=$1, category=$2, updated_at=$3 WHERE id=$4 RETURNING *",
      [agent_id, category, now, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Chat no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar chat" });
  }
};

// Eliminar un chat
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM chats WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Chat no encontrado" });
    res.json({ message: "Chat eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar chat" });
  }
};
