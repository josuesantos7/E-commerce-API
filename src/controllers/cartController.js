import { addToCartService, getCartService, removeFromCartService } from "../services/cartService.js";


export const addToCart = async (req, res, next) => {
  try {
    const item = await addToCartService(req, res);

    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getCartService(req, res);

    return res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    await removeFromCartService(req, res);
    return res.json({ message: "Item removido" });
  } catch (error) {
    next(error);
  }
};