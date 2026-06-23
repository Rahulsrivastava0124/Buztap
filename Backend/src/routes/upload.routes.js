const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

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

function getVisionApiKey() {
  const raw = process.env.Google_vision_api_key;

  return String(raw).trim().replace(/^['"]|['"]$/g, "");
}

function parseMenuItemsFromText(rawText = "") {
  const lines = String(rawText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  const seen = new Set();

  const priceRegex =
    /(?:₹|rs\.?|inr)\s*([0-9]{1,5}(?:\.[0-9]{1,2})?)|([0-9]{1,5}(?:\.[0-9]{1,2})?)\s*$/i;

  for (const line of lines) {
    const match = line.match(priceRegex);
    if (!match) continue;

    const price = Number(match[1] || match[2] || 0);
    if (!Number.isFinite(price) || price <= 0) continue;

    const name = line
      .replace(priceRegex, "")
      .replace(/[-:|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!name || name.length < 2) continue;

    const key = `${name.toLowerCase()}::${price}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      id: `ocr-${items.length + 1}`,
      name,
      price,
      category: "Mains",
      isVeg: true,
      description: "",
    });

    if (items.length >= 80) break;
  }

  return items;
}

router.post("/ocr-menu", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const visionApiKey = getVisionApiKey();
    if (!visionApiKey) {
      return res.status(500).json({
        error: "Vision API key is not configured. Set Google_vision_api_key.",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(visionApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            },
          ],
        }),
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      const details = payload?.error?.message || "Vision API request failed";
      const normalized = String(details).toLowerCase();
      const isBillingError =
        normalized.includes("billing") ||
        normalized.includes("enable billing") ||
        normalized.includes("project") && normalized.includes("billing");

      if (isBillingError) {
        return res.status(402).json({
          code: "VISION_BILLING_REQUIRED",
          error:
            "Google Vision billing is not enabled for this project. Enable billing in Google Cloud Console and retry after a few minutes.",
          details,
        });
      }

      return res.status(502).json({
        code: "VISION_API_ERROR",
        error: details,
      });
    }

    const result = payload?.responses?.[0] || {};
    const extractedText =
      result?.fullTextAnnotation?.text ||
      result?.textAnnotations?.[0]?.description ||
      "";

    if (!extractedText.trim()) {
      return res.json({ text: "", items: [] });
    }

    const items = parseMenuItemsFromText(extractedText);
    res.json({
      text: extractedText,
      items,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  requireRole("manager"),
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
