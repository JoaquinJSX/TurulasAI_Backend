import express from "express";
import { 
  getMessagesByChat, 
  sendMessage, 
  deleteMessage 
} from "../controllers/messagesController.js";

const router = express.Router();

router.get("/messages/chat/:id", getMessagesByChat); // Obtener todos los mensajes de un chat
router.post("/messages", sendMessage);             // Enviar un mensaje (user → assistant)
router.delete("/messages/:id", deleteMessage);      // Eliminar un mensaje por UUID

export default router;
