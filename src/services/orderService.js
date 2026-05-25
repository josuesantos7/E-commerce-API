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

    // return res.status(201).json({
    // message: "Pedido criado com sucesso",
    // order
    // });
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