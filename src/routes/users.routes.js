import express from "express";
import { getUsers, getUserById, createUser, deleteUser } from "../controllers/usersController.js";

const router = express.Router();

router.get("/users", getUsers);          // Obtener todos
router.get("/users/:id", getUserById);    // Obtener uno por UUID
router.post("/users", createUser);       // Crear
router.delete("/users/:id", deleteUser);  // Eliminar

export default router;
