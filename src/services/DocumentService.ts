import { Document } from '../models/Document.model';
import cloudinary from '../config/cloudinary';
import { Transaction } from 'sequelize';
import type { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

interface UploadDocumentOptions {
  customerId?: string;
  vehicleId?: string;
  category?: string; 
}

const DocumentService = {
  async uploadDocument(
    file: Express.Multer.File,
    {
      customerId,
      vehicleId,
      category = 'other',
    }: UploadDocumentOptions,
    transaction?: Transaction
  ) {
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
      type: 'upload',
      folder: `customers/${customerId ?? 'general'}`,
      use_filename: true,
      unique_filename: false,
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result as UploadApiResponse);
    }
  );
  streamifier.createReadStream(file.buffer).pipe(uploadStream);
});


    return Document.create(
      {
        name: file.originalname,
        category,
        customerId,
        vehicleId,
        fileUrl: uploadResult.secure_url,
        mimeType: file.mimetype,
        size: file.size,
      },
      { transaction }
    );
  },

  async getDocumentsByCustomer(customerId: string) {
    return Document.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
    });
  },

  async getDocumentsByVehicle(vehicleId: string) {
    return Document.findAll({
      where: { vehicleId },
      order: [['createdAt', 'DESC']],
    });
  },

  async deleteDocument(documentId: string) {
    const doc = await Document.findByPk(documentId);
    if (!doc) throw new Error('Document not found');
    await doc.destroy();
    return { message: 'Document deleted successfully' };
  },
};

export default DocumentService;