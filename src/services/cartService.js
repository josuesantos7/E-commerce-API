import prisma from "../database/prismaClient.js";

export const addToCartService = async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    // verificar se produto existe
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new AppError("Produto não encontrado", 404);
    }

    if (quantity <= 0 ) {
        throw new AppError("Quantidade inválida", 400);
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
    return item;
};

export const getCartService = async (req, res) => {
    const userId = req.userId;

    const cart = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
    });
    return cart;
};

export const removeFromCartService = async (req, res) => {
    const { id } = req.params;

    await prisma.cartItem.delete({
        where: { id }
    }); 
};