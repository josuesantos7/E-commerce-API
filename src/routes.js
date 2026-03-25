import { Router } from "express";

const routes = Router();

routes.get("/", (req, res) => {
  return res.json({ message: "API de comércio rodando 🔥" });
});

export default routes;