import express from "express";
import { 
  getChats, 
  getChatById, 
  getChatsByUser, 
  createChat, 
  updateChat, 
  deleteChat 
} from "../controllers/chatsCotrollers.js";

const router = express.Router();

router.get('/chats', getChats);             // Obtener todos los chats
router.get('/chats/:id', getChatById);       // Obtener un chat por UUID
router.get('/chats/user/:id', getChatsByUser); // Obtener chats de un usuario
router.post('/chats', createChat);          // Crear chat
router.put('/chats/:id', updateChat);        // Actualizar chat
router.delete('/chats/:id', deleteChat);     // Eliminar chat

export default router;
