import express from "express";
import connectDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import connectRedis from "./DB/connection.redis.js";

const app = express();
const port = 3000;


const bootstrap = async () => {

    app.use(cors({
        origin: "*"
    }));

    app.use(express.json());

    await connectDB();

    await connectRedis();

    app.get("/", (req, res, next) => res.status(200).json({ message: "Welcome on Sra7a App....😍" }));

    app.use("/users", userRouter);

    app.use("{/*demo}", (req, res, next) => {
        throw new Error(`Url: ${req.originalUrl} with method: ${req.method} not found`, { cause: 404 })
    })

    app.use((err, req, res, next) => {
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack });
    });

    app.listen(port, () => console.log(`Server running on port ${port}!`));
}

export default bootstrap;