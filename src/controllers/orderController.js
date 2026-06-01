import { createOrderService, getOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orderService.js";


export const createOrder = async (req, res) => {
  try {
    
    const order = await createOrderService(req, res);

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

export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await getOrdersService(req, res);

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao buscar pedidos"
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOrderByIdService(req, res);

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao buscar pedido"
    });
  }
}; 

export const updateOrderStatus = async (req, res) => {
  try {
    // const { id } = req.params;
    // const { status } = req.body;
    const order = await updateOrderStatusService(req, res);

    return res.json(order);

  } catch (error) {
    return res.status(500).json({
      error: "Erro ao atualizar status"
    });
  }
};