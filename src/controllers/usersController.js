import pool from "../db.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, email, password FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Obtener un usuario por UUID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id=$1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, password]
    );
    res.status(201).json({ message: "Usuario creado correctamente", user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
