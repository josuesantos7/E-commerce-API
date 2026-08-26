import { registerService, loginService } from "../services/authService.js";


export const register = async (req, res, next) => {
  try {
    const userWithoutPassword = await registerService(req.body);

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const loginResult = await loginService(req.body);

    return res.json(loginResult);

  } catch (error) {
    next(error);
  }
};