import { Request, Response } from 'express';
import express from 'express';
import { upload } from '../middlewares/upload';
import VehicleService from '../services/VehicleService';
import { VehicleImage } from '../models';
import { getUserIdOrThrow } from '../utils/auth';
import { AuthenticatedRequest } from '../types/auth';
import { VehicleInput } from '../types/vehicle';
import { HttpError } from 'http-errors';

const router = express.Router();

router.post(
  '/upload-vehicle-with-images',
  upload.array('images'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const typedReq = req as AuthenticatedRequest;
      const userId = getUserIdOrThrow(typedReq, () => res.status(401).send('Unauthorized'));

      const {
        model_id,
        make_id,
        vin,
        year,
        street,
        city,
        state,
        country,
        zipcode,
        status,
        location,
        customer_id,
        assignedDate,
      } = req.body;

      const vehicleInput: VehicleInput = {
        model_id: Number(model_id),
        make_id: make_id ? Number(make_id) : undefined,
        vin,
        year,
        street,
        city,
        state,
        country,
        zipcode,
        status,
        location,
        customer_id,
        assignedDate: assignedDate ? new Date(assignedDate) : null,
      };

      const vehicle = await VehicleService.createVehicle(vehicleInput, userId);

      const files = req.files as Express.Multer.File[];
      if (files?.length) {
        await VehicleImage.bulkCreate(
          files.map((file) => ({
            vehicle_id: vehicle.id,
            image_url: file.path,
          }))
        );
      }

      res.status(201).json({ vehicle, images: files?.map((f) => f.path) });
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode || 400).json({ message: err.message });
      }

      res.status(500).json({ message: 'Something went wrong.' });
    }
  }
);

export default router;
