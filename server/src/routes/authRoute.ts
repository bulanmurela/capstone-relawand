import express, { Request, Response } from "express";
import { checkAuth, login, logout } from "../controllers/authController";

// Pastikan app utama pakai cookie-parser
// app.use(cookieParser()) → tambahkan di server/index.ts atau app.ts

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/check', checkAuth);

export default router;