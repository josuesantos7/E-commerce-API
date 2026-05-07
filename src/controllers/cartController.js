import prisma from "../database/prismaClient.js";

// adicionar item ao carrinho.
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    // verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // verifica se já existe no carrinho
    const itemExists = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    if (itemExists) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: itemExists.id },
        data: {
          quantity: itemExists.quantity + quantity
        }
      });

      return res.json(updatedItem);
    }

    const item = await prisma.cartItem.create({
      data: { userId, productId, quantity }
    });

    return res.status(201).json(item);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao adicionar ao carrinho" });
  }
};

// listar itens do carrinho
export const getCart = async (req, res) => {
  const userId = req.userId;

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  return res.json(cart);
};

// remover item do carrinho
export const removeFromCart = async (req, res) => {
  const { id } = req.params;

  await prisma.cartItem.delete({
    where: { id }
  });

  return res.json({ message: "Item removido" });
};