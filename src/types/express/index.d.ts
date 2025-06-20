import multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      upload?: multer.Multer;
    }
  }
}

export {};