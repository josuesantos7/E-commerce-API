import prisma from "../database/prismaClient.js";

// criar novo produto.
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await prisma.product.create({
      data: { name, description, price, stock }
    });

    return res.status(201).json(product);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
};

// listar todos os produtos.
export const getProducts = async (req, res) => {
  const products = await prisma.product.findMany();
  return res.json(products);
};

// atualizar produto.
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: { name, description, price, stock }
  });

  return res.json(product);
};

// deletar produto.
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id }
  });

  return res.json({ message: "Produto deletado" });
};