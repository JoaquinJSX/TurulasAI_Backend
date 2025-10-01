import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import usersRoutes from "./routes/users.routes.js";
import agentsRoutes from "./routes/agents.routes.js";
import chatsRoutes from "./routes/chats.routes.js";
import messagesRoutes from "./routes/messages.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Frontend estático
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use(usersRoutes);
app.use(agentsRoutes);
app.use(chatsRoutes);
app.use(messagesRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅ TurulasAI server running on http://localhost:${PORT}`));
