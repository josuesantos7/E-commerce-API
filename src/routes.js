import { Router } from "express";
import prisma from "./database/prismaClient.js";


const routes = Router();

routes.get("/", (req, res) => {
  return res.json({ message: "API de comércio rodando 🔥" });
});

routes.get("/create-user", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: "Teste1",
      email: "teste1@email.com",
      password: "123456"
    }
  });

  return res.json(user);
});

export default routes;