export const errorMiddleware = (
  error,
  req,
  res,
  next
) => {

  console.error(error);
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    error: error.message || "Erro interno do servidor"
  });

};