import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não informado" });
    }

    // formato: Bearer token
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userRole = decoded.role;

    return next();

  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};