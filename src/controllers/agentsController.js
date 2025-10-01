import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

// Obtener todos los agentes
export const getAgents = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM agents ORDER BY category");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener agentes" });
  }
};

// Obtener un agente por UUID
export const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM agents WHERE id=$1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Agente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener agente" });
  }
};

// Crear agente
export const createAgent = async (req, res) => {
  try {
    const { category, system_prompt, model } = req.body;
    const id = uuidv4();
    const now = new Date();
    await pool.query(
      "INSERT INTO agents (id, category, system_prompt, model, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, category, system_prompt, model, now, now]
    );
    res.json({ id, category, system_prompt, model });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear agente" });
  }
};

// Actualizar agente
export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, system_prompt, model } = req.body;
    const now = new Date();
    const result = await pool.query(
      "UPDATE agents SET category=$1, system_prompt=$2, model=$3, updated_at=$4 WHERE id=$5 RETURNING *",
      [category, system_prompt, model, now, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Agente no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar agente" });
  }
};

// Eliminar agente
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM agents WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Agente no encontrado" });
    res.json({ message: "Agente eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar agente" });
  }
};
