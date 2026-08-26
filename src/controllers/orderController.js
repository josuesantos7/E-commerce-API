import { createOrderService, getOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orderService.js";


export const createOrder = async (req, res, next) => {
  try {

    const userId = req.userId;
    
    const order = await createOrderService(userId);

    return res.status(201).json({
      order,
      message: "Pedido criado com sucesso",
      order
    });

  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.userId;

    const orders = await getOrdersService(userId);

    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {

    const { id } = req.params;
    const userId = req.userId;
    
    const order = await getOrderByIdService(id, userId);

    return res.json(order);
  } catch (error) {
    next(error);
  }
}; 

export const updateOrderStatus = async (req, res, next) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const order = await updateOrderStatusService(id, status);

    return res.json(order);
  } catch (error) {
    next(error);
  }
};