import { Router } from "express";
import userRoutes from "./user.route";
import notificationRoutes from "./notification.route";
import chatRoutes from "./chat.route";
import { expressjwt } from "express-jwt";
import dotenv from "dotenv";

dotenv.config();
const router:Router = Router();
const publicRoute:Array<string> = [
    'auth/register',
    'auth/login',
    'auth/refresh-token',
    'auth/logout'
];
router.use(expressjwt({
    secret: process.env.ACCESS_TOKEN_SECRET as string,
    algorithms: ['HS256']
}).unless({
    path: publicRoute
}))
router.use("/users",userRoutes);
router.use("/notifications",notificationRoutes);
router.use("/chats",chatRoutes);
export default router;