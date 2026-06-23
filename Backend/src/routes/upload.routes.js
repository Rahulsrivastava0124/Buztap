const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

// Use memory storage — we stream the buffer directly to R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("menu:manage"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      if (
        !R2_ACCOUNT_ID ||
        !R2_BUCKET_NAME ||
        !R2_ACCESS_KEY_ID ||
        !R2_SECRET_ACCESS_KEY
      ) {
        return res
          .status(500)
          .json({ error: "R2 storage is not configured on the server" });
      }

      const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
      const key = `menu/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      const publicBase = (R2_PUBLIC_URL || "").replace(/\/$/, "");
      const url = `${publicBase}/${key}`;

      res.json({ url });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
