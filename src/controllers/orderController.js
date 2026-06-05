import { createOrderService, getOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orderService.js";


export const createOrder = async (req, res, next) => {
  try {
    
    const order = await createOrderService(req, res);

    return res.status(201).json({
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

    const orders = await getOrdersService(req, res);

    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await getOrderByIdService(req, res);

    return res.json(order);
  } catch (error) {
    next(error);
  }
}; 

export const updateOrderStatus = async (req, res, next) => {
  try {

    const order = await updateOrderStatusService(req, res);

    return res.json(order);
  } catch (error) {
    next(error);
  }
};