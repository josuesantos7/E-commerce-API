import prisma from "../database/prismaClient.js";
import { AppError } from "../errors/AppError.js";

export const createOrderService = async (userId) => {
    
    // buscar itens do carrinho
    const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new AppError("Carrinho vazio", 404);
    }

    for (const item of cartItems) {

      // validar estoque
      if (item.quantity > item.product.stock) {
        throw new AppError(`Estoque insuficiente para ${item.product.name}`, 422);
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

export const getOrdersService = async (userId) => {

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

export const getOrderByIdService = async (orderId, userId) => {
    
    const order = await prisma.order.findFirst({
      where: 
        { 
          id: orderId,
          userId
        },
        
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    return order;
};

export const updateOrderStatusService = async (id, status) => {

    if (!id || !status) {
      throw new AppError("ID do pedido ou status não encontrados", 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return order;
};