// backend/controllers/deviceDataController.ts
import { Request, Response } from "express";
import DeviceData from "../models/DeviceData";

export const saveDeviceData = async (req: Request, res: Response) => {
  try {
    const { deviceId, temperature, humidity, timestamp } = req.body;

    await DeviceData.create({
      deviceId,
      temperature,
      humidity,
      timestamp: timestamp || new Date(),
    });

    res.status(200).json({ message: "Data berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menyimpan data", detail: error });
  }
};
