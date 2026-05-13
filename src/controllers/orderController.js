import prisma from "../database/prismaClient.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    // buscar itens do carrinho
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        error: "Carrinho vazio"
      });
    }

    // calcular total
    let total = 0;

    for (const item of cartItems) {

      // validar estoque
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          error: `Estoque insuficiente para ${item.product.name}`
        });
      }

      total += item.product.price * item.quantity;
    }

    // criar pedido
    const order = await prisma.order.create({
      data: {
        userId,
        total
      }
    });

    // criar itens do pedido
    for (const item of cartItems) {

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }
      });

      // atualizar estoque
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: item.product.stock - item.quantity
        }
      });
    }

    // limpar carrinho
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return res.status(201).json({
      message: "Pedido criado com sucesso",
      order
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Erro ao criar pedido"
    });
  }
};