export const validate = (schema, target = "body") => {
  return (req, res, next) => {

    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues.map(
          issue => issue.message
        )
      });

    }

    req.validated = req.validated || {};
    req.validated[target] = result.data;

    next();
  };
};