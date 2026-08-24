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
import { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} from "./controllers/orderController.js";
import { validate } from "./middlewares/validate.js";
import { createProductSchema } from "./schemas/productSchema.js";
import { registerSchema, loginSchema } from "./schemas/authSchema.js";
import { addToCartSchema } from "./schemas/cartSchema.js";
import { updateOrderStatusSchema } from "./schemas/orderSchema.js";
import { getProductsSchema } from "./schemas/getProductsSchema.js";


const routes = Router();

// Rotas de Usuários
routes.post("/auth/create-user", validate(registerSchema), register);
routes.post("/auth/login", validate(loginSchema), login);
/*
routes.get("/profile", authMiddleware, (req, res) => {
  return res.json({
    message: "Acesso autorizado!",
    userId: req.userId
  });
});
*/

// Rotas de Produtos
routes.post("/products", authMiddleware,adminMiddleware,validate(createProductSchema), createProduct);
routes.get("/products", validate(getProductsSchema, "query"), getProducts);
routes.put("/products/:id", authMiddleware, adminMiddleware, updateProduct);
routes.delete("/products/:id", authMiddleware, adminMiddleware, deleteProduct);

// Rotas de Carrinho
routes.post("/cart", authMiddleware, validate(addToCartSchema), addToCart);
routes.get("/cart", authMiddleware, getCart);
routes.delete("/cart/:id", authMiddleware, removeFromCart);

// Rotas de Pedidos
routes.post("/orders", authMiddleware, createOrder);
routes.get("/orders", authMiddleware, getOrders);
routes.get("/orders/:id", authMiddleware, getOrderById);
routes.put(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);



export default routes;