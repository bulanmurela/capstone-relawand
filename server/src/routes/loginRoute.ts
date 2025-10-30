// src/routes/loginRoute.ts
import express from "express";
import { checkAuth, login, logout } from "../controllers/authController";

const loginRoute = express.Router();

// Login endpoint: POST /login
loginRoute.post('/', login);

// Logout endpoint: POST /login/logout
loginRoute.post('/logout', logout);

// Check auth endpoint: GET /login/check
loginRoute.get('/check', checkAuth);

export default loginRoute;