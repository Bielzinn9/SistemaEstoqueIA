import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use(routes);

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;