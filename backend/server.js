import app from "./app.js";
import iaRoutes from "./src/routes/iaRoutes.js";

const PORT = process.env.PORT || 3000;

app.use("/ia", iaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});