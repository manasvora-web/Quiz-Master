const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const sharp   = require("sharp");

/* ===============================
   UPLOAD PATH
   File is at: backend/src/middlewares/uploadQuestionImage.js
   Uploads go to: backend/uploads/questions/
   So we go up TWO levels: ../../uploads/questions
================================ */
const uploadPath = path.join(__dirname, "../../uploads/questions");

// Create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}


/* ===============================
   TEMP STORAGE — multer saves
   original first, then sharp
   compresses and replaces it
================================ */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9);
    // Always save as .webp after compression
    cb(null, uniqueName + ".webp");
  }
});


/* ===============================
   FILE FILTER — only images
================================ */
const fileFilter = (req, file, cb) => {

  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, GIF allowed"), false);
  }
};


/* ===============================
   MULTER INSTANCE
================================ */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max upload
});


/* ===============================
   COMPRESSION MIDDLEWARE
   Runs AFTER multer saves the file
   Uses sharp to:
   - Resize max 800px wide
   - Convert to WebP
   - Quality 75% (great balance)
   - Strip metadata (smaller file)
================================ */
const compressImage = async (req, res, next) => {

  // No file uploaded — skip
  if (!req.file) return next();

  const filePath = req.file.path;

  try {

    // Read original file into buffer
    const inputBuffer = fs.readFileSync(filePath);

    // Compress with sharp
    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width:  800,       // max width 800px
        height: 800,       // max height 800px
        fit:    "inside",  // keep aspect ratio, never crop
        withoutEnlargement: true // don't upscale small images
      })
      .webp({ quality: 75 }) // convert to WebP, 75% quality
      .toBuffer();

    // Overwrite original file with compressed version
    fs.writeFileSync(filePath, compressedBuffer);

    // Log compression result
    const originalSize   = inputBuffer.length;
    const compressedSize = compressedBuffer.length;
    const saving         = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

    console.log(
      `[IMAGE COMPRESS] ${req.file.filename} | ` +
      `Original: ${(originalSize / 1024).toFixed(1)}KB → ` +
      `Compressed: ${(compressedSize / 1024).toFixed(1)}KB | ` +
      `Saved: ${saving}%`
    );

    next();

  } catch (err) {

    console.error("[IMAGE COMPRESS ERROR]", err.message);

    // Delete bad file if compression failed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(400).json({
      message: "Image processing failed. Please upload a valid image."
    });
  }
};


/* ===============================
   EXPORT — combined middleware
   Usage in routes:
   upload.single("question_image"),
   compressImage
================================ */
module.exports = { upload, compressImage };