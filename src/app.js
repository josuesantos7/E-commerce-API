import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(routes);
app.use(errorMiddleware);

export default app;