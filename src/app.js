import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos."
  }
});
app.use(limiter);

app.use(express.json());
app.use(routes);
app.use(errorMiddleware);



export default app;