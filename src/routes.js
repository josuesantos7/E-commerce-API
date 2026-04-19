import { Router } from "express";
import prisma from "./database/prismaClient.js";
import { register, login } from "./controllers/authController.js";
// import { login } from "./controllers/authController.js";


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

export default routes;