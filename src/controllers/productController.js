import { createProductService, getProductsService, updateProductService, deleteProductService } from "../services/productService.js";

// criar novo produto.
export const createProduct = async (req, res) => {
  try {
    const product = await createProductService(req.body);
    
    return res.status(201).json(product);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
};

// listar todos os produtos.
export const getProducts = async (req, res) => {
  const products = await getProductsService();
  return res.status(200).json(products);
};

// atualizar produto.
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await updateProductService(id, req.body);
    return res.json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
};

// deletar produto.
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteProductService(id);

    return res.json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao deletar produto" });
  }
};