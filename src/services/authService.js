import prisma from "../database/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


export const registerService = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new Error("Preencha todos os campos");
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      throw new Error("Usuário já existe");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const loginService = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Senha inválida");
    }

    // gerar token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return ({
      user: userWithoutPassword,
      token
    });
};