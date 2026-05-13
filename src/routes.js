import { Router } from "express";
import prisma from "./database/prismaClient.js";
import { register, login } from "./controllers/authController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from "./controllers/productController.js";
import { adminMiddleware } from "./middlewares/adminMiddleware.js";
import {
  addToCart,
  getCart,
  removeFromCart
} from "./controllers/cartController.js";
import { createOrder } from "./controllers/orderController.js";


const routes = Router();

// Rotas de Usuários
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

// Rotas de Produtos
routes.post("/products", authMiddleware,adminMiddleware, createProduct);
routes.get("/products", getProducts);
routes.put("/products/:id", authMiddleware, adminMiddleware, updateProduct);
routes.delete("/products/:id", authMiddleware, adminMiddleware, deleteProduct);

// Rotas de Carrinho
routes.post("/cart", authMiddleware, addToCart);
routes.get("/cart", authMiddleware, getCart);
routes.delete("/cart/:id", authMiddleware, removeFromCart);

// Rotas de Pedidos
routes.post("/orders", authMiddleware, createOrder);



export default routes;