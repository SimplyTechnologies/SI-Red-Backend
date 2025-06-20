export const DocumentCategory = {
  CONTRACT: 'contract',
  INSURANCE: 'insurance',
  VEHICLE_REGISTRATION: 'vehicle_registration',
  IDENTIFICATION: 'identification',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
} as const;

export type DocumentCategory = typeof DocumentCategory[keyof typeof DocumentCategory];

export interface DocumentAttributes {
  id: string;
  name: string;
  category: DocumentCategory;
  customerId?: string;
  vehicleId?: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type DocumentCreationAttributes = Omit<
  DocumentAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
