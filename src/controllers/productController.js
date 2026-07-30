import { createProductService, getProductsService, updateProductService, deleteProductService } from "../services/productService.js";

// criar novo produto.
export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);
    
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// listar todos os produtos.
export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    const products = await getProductsService(
      page,
      limit,
      search
    );
    
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// atualizar produto.
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await updateProductService(id, req.body);
    return res.json(product);
  } catch (error) {
    next(error);
  }
};

// deletar produto.
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteProductService(id);

    return res.json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    next(error);
  }
};