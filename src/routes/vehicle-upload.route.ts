import { Request, Response } from 'express';
import express from 'express';
import { upload } from '../middlewares/upload';
import VehicleService from '../services/VehicleService';
import { Vehicle, VehicleImage } from '../models';
import { getUserIdOrThrow } from '../utils/auth';
import { AuthenticatedRequest } from '../types/auth';
import { VehicleInput } from '../types/vehicle';
import { HttpError } from 'http-errors';
import cloudinary from '../config/cloudinary';
import { extractPublicIdFromUrl } from '../utils/cloudinary';

const router = express.Router();

router.post(
  '/upload-vehicle-with-images',
  upload.array('images'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const typedReq = req as AuthenticatedRequest;
      const userId = getUserIdOrThrow(typedReq, () => res.status(401).send('Unauthorized'));

      console.log('RAW model_id:', req.body.model_id);

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

      const parsedModelId = Number(model_id);
      if (isNaN(parsedModelId)) {
        res.status(400).json({ message: 'Invalid model_id' });
      }

      const parsedMakeId = make_id ? Number(make_id) : undefined;
      if (make_id && isNaN(parsedMakeId!)) {
        res.status(400).json({ message: 'Invalid make_id' });
      }

      const vehicleInput: VehicleInput = {
        model_id: parsedModelId,
        make_id: parsedMakeId,
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

router.put(
  '/upload-vehicle-with-images/:id',
  upload.array('images'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const vehicleId = req.params.id;

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

      let parsedDeletedImageIds: string[] = [];

      const raw = req.body.deletedImageIds;

      if (Array.isArray(raw)) {
        parsedDeletedImageIds = raw;
      } else if (typeof raw === 'string') {
        try {
          parsedDeletedImageIds = JSON.parse(raw);
        } catch (err) {
          console.error('❌ Failed to parse deletedImageIds string:', err);
        }
      } else {
        console.warn('⚠️ deletedImageIds was not provided or not valid');
      }

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

      const vehicle = await VehicleService.updateVehicle(vehicleId, vehicleInput);

      const idsToDelete = parsedDeletedImageIds;

      if (idsToDelete.length) {
        const images = await VehicleImage.findAll({ where: { id: idsToDelete } });

        for (const img of images) {
          const publicId = extractPublicIdFromUrl(img.image_url);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }

        await VehicleImage.destroy({ where: { id: idsToDelete } });
      }

      const files = req.files as Express.Multer.File[];
      if (files?.length) {
        await VehicleImage.bulkCreate(
          files.map((file) => ({
            vehicle_id: vehicle.id,
            image_url: file.path,
          }))
        );
      }

      const updatedVehicle = await Vehicle.findByPk(vehicle.id, {
        include: [
          {
            model: VehicleImage,
            as: 'images', 
          },
        ],
      });

      res.status(200).json(updatedVehicle);
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode || 400).json({ message: err.message });
        return;
      }

      console.error('Error in PUT /upload-vehicle-with-images/:id:', err);
      res.status(500).json({ message: 'Something went wrong.' });
    }
  }
);

export default router;
