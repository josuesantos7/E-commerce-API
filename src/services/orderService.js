import prisma from "../database/prismaClient.js";

export const createOrderService = async (req, res) => {
    
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

    for (const item of cartItems) {

      // validar estoque
      if (item.quantity > item.product.stock) {
          return new Error(`Estoque insuficiente para ${item.product.name}`);
      }
    }

    // Criar pedido
  const order = await prisma.$transaction(async (tx) => {
    let total = 0;

    for (const item of cartItems) {
      total += item.product.price * item.quantity;
    }

    const createdOrder = await tx.order.create({
      data: {
        userId,
        total
      }
    });

    //cria item do pedido
    for (const item of cartItems) {

      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }
      });

      await tx.product.update({
        where: {
          id: item.productId
        },
        data: {
          stock: item.product.stock - item.quantity
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { userId }
    });

    return createdOrder;
  });
  return order;
};

export const getOrdersService = async (req, res) => {
    const userId = req.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    return orders;
}; 

export const getOrderByIdService = async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: "Pedido não encontrado"
      });
    }

    return order;
};

export const updateOrderStatusService = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return order;
};