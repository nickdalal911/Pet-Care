import path from "path";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";

import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Uploads folder path
const uploadsDir = path.join(__dirname, "..", "uploads");

// Create folder if not exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Upload middleware
const upload = multer({ storage });

// Collect files helper
const collectFiles = (req) => {
  if (req.file) return [req.file];

  if (req.files) {
    if (Array.isArray(req.files)) return req.files;
    return Object.values(req.files).flat();
  }

  return [];
};

// Normalize single image
const normalizeImageFile = async (file) => {
  if (!file?.path) return;

  const inputPath = file.path;
  const tempPath = `${inputPath}.normalized`;

  await sharp(inputPath).rotate().toFile(tempPath);
  await fs.promises.rename(tempPath, inputPath);
};

// Normalize middleware
const normalizeUploadedImages = async (req, _res, next) => {
  const files = collectFiles(req);

  if (!files.length) return next();

  try {
    await Promise.all(files.map(normalizeImageFile));
    next();
  } catch (error) {
    const wrapped = new Error("Failed to process uploaded image.");
    wrapped.status = 400;
    wrapped.cause = error;
    next(wrapped);
  }
};

// ✅ Named exports (correct for your import style)
export { upload, normalizeUploadedImages };