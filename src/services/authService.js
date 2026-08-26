import prisma from "../database/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppError } from "../errors/AppError.js";


export const registerService = async ({name, email, password}) => {

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      throw new AppError("Usuário já existe", 409);
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

export const loginService = async ({email, password}) => {

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError("Usuário ou senha inválidos", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Usuário ou senha inválidos", 401);
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