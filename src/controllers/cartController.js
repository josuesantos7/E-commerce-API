import { addToCartService, getCartService, removeFromCartService } from "../services/cartService.js";


export const addToCart = async (req, res) => {
  try {
    const item = await addToCartService(req, res);

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao adicionar ao carrinho" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await getCartService(req, res);

    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar carrinho" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    await removeFromCartService(req, res);
    return res.json({ message: "Item removido" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover item do carrinho" });
  }
};