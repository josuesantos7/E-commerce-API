import { registerService, loginService } from "../services/AuthService.js";


export const register = async (req, res) => {
  try {
    const userWithoutPassword = await registerService(req, res);

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const loginResult = await loginService(req, res);

    return res.json(loginResult);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
};