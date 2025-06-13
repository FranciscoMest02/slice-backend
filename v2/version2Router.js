import { Router } from "express";
import { usersRouterV2 } from "./routes/users.js";

export const v2Router = Router()

v2Router.use('/user', usersRouterV2);
// v2Router.use('/friends', friendsRouter);
// v2Router.use('/images', imagesRouter);