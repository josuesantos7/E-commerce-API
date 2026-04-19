import { Router } from "express";
import prisma from "./database/prismaClient.js";
import { register, login } from "./controllers/authController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";


const routes = Router();

routes.get("/", (req, res) => {
  return res.json({ message: "API de comércio rodando 🔥" });
});

routes.get("/all-usuarios", async (req, res) => {
  const users = await prisma.user.findMany();
  return res.json(users);
});

routes.post("/auth/create-user", register);
routes.post("/auth/login", login);
routes.get("/profile", authMiddleware, (req, res) => {
  return res.json({
    message: "Acesso autorizado!",
    userId: req.userId
  });
});

export default routes;