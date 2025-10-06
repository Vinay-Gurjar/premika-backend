import fileUpload from 'express-fileupload';

export const initializeFileUpload = (socket, next) => {
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }
  });
  next();
};