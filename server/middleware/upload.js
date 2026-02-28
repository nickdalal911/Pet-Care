const path = require("path");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const collectFiles = (req) => {
  if (req.file) {
    return [req.file];
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      return req.files;
    }
    return Object.values(req.files).flat();
  }
  return [];
};

const normalizeImageFile = async (file) => {
  if (!file?.path) {
    return;
  }

  const inputPath = file.path;
  const tempPath = `${inputPath}.normalized`;

  await sharp(inputPath).rotate().toFile(tempPath);
  await fs.promises.rename(tempPath, inputPath);
};

const normalizeUploadedImages = async (req, _res, next) => {
  const files = collectFiles(req);
  if (!files.length) {
    return next();
  }

  try {
    await Promise.all(files.map(normalizeImageFile));
    return next();
  } catch (error) {
    const wrapped = new Error("Failed to process uploaded image.");
    wrapped.status = 400;
    wrapped.cause = error;
    return next(wrapped);
  }
};

module.exports = {
  upload,
  normalizeUploadedImages,
};
