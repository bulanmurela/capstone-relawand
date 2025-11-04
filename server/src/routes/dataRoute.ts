// backend/routes/dataRoutes.ts
import express from "express";
import { saveDeviceData } from "../controllers/deviceDataController"; 

const router = express.Router();

// endpoint untuk hardware kirim data
router.post("/send-data", saveDeviceData);

export default router;
