import { Router } from "express";
import authRouter from "./router/auth-router";
import errorHandler from "./middleware/error-handler";
import friendRouter from "./router/friend-router";
const v1Router = Router()

v1Router.use("/auth", authRouter)
v1Router.use("/friends", friendRouter)
v1Router.use(errorHandler)

export default v1Router
