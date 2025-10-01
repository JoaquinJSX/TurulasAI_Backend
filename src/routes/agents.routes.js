import express from "express";
import { 
  getAgents, 
  getAgentById, 
  createAgent, 
  updateAgent, 
  deleteAgent 
} from "../controllers/agentsController.js";

const router = express.Router();

router.get("/agents", getAgents);        // Obtener todos
router.get("/agents/:id", getAgentById);  // Obtener uno
router.post("/agents", createAgent);     // Crear
router.put("/agents/:id", updateAgent);   // Actualizar
router.delete("/agents/:id", deleteAgent);// Eliminar

export default router;
