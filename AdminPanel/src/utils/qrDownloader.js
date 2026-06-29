import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Generates and downloads a single or bulk QR code images for the given tables.
 * @param {Array} tables - Array of table objects e.g., [{ id: "GT-1", area: "Ground", ... }]
 * @param {String} businessId - The restaurant's business ID for the URL
 * @param {String} zipName - Name of the ZIP file if downloading multiple
 */
export async function downloadQRCodes(tables, businessId, zipName = "Table-QRs.zip") {
  if (!tables || tables.length === 0) return;

  const frontendBase = import.meta.env.VITE_MENU_BASE_URL || "http://localhost:5174";
  
  const qrPromises = tables.map(async (table) => {
    // Generate the URL for this table's digital menu
    const menuUrl = `${frontendBase}/order?table=${encodeURIComponent(table.id)}&biz=${encodeURIComponent(businessId)}`;

    // Create a temporary canvas
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    // Fill background with white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 480);

    // Draw the QR Code onto another canvas using the qrcode library
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, menuUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1A1A1A",
        light: "#ffffff"
      }
    });

    // Draw QR onto main canvas
    ctx.drawImage(qrCanvas, 40, 40);

    // Draw Table ID text
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 34px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Table: ${table.id}`, 200, 400);
    
    // Draw Area name
    if (table.area) {
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#666666";
      ctx.fillText(table.area, 200, 435);
    }

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ tableId: table.id, blob });
      }, "image/png");
    });
  });

  const generatedQRs = await Promise.all(qrPromises);

  // If only 1 table, download PNG directly
  if (generatedQRs.length === 1) {
    saveAs(generatedQRs[0].blob, `${generatedQRs[0].tableId}-QR.png`);
    return;
  }

  // If multiple tables, create a ZIP
  const zip = new JSZip();
  generatedQRs.forEach(({ tableId, blob }) => {
    zip.file(`${tableId}-QR.png`, blob);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, zipName);
}
