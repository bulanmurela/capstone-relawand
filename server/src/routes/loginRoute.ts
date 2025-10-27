import express, { Request, Response } from "express";
import { checkAuth, login, logout} from "../controllers/authController";
import router from "./realtime";

// Pastikan app utama pakai cookie-parser
// app.use(cookieParser()) → tambahkan di server/index.ts atau app.ts

const loginRoute = express.Router();

loginRoute.post('/', login);
loginRoute.post('/logout', logout);
loginRoute.get('/check', checkAuth);

export default loginRoute;