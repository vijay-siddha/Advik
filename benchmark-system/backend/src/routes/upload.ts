import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

const router = Router();

// Configure storage
const storage = process.env.AWS_BUCKET_NAME 
  ? multerS3({
      s3: new S3Client({ region: process.env.AWS_REGION }),
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, `benchmarks/${uniqueName}`);
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf', 'application/json'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload single file
router.post('/image', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = process.env.AWS_BUCKET_NAME 
    ? (req.file as any).location 
    : `/uploads/${req.file.filename}`;
    
  res.json({ 
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Upload multiple files
router.post('/batch', authenticate, upload.array('files', 10), (req, res) => {
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files.map(file => ({
    url: process.env.AWS_BUCKET_NAME 
      ? (file as any).location 
      : `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
  }));
    
  res.json({ files });
});

export { router as uploadRouter };