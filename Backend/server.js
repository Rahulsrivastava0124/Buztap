require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");
const { version, name } = require("./package.json");

const BASE_PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

function printBanner(port) {
  const line = "─".repeat(48);
  console.info(`
┌${line}┐
│  🚀  ${name} v${version}${"".padEnd(48 - name.length - version.length - 6)}│
├${line}┤
│  ENV   : ${(process.env.NODE_ENV || "development").padEnd(37)}│
│  HOST  : ${HOST.padEnd(37)}│
│  PORT  : ${String(port).padEnd(37)}│
│  URL   : http://localhost:${port}/api/health${"".padEnd(48 - 28 - String(port).length - 12)}│
└${line}┘`);
}

function startServer(port, retriesLeft = 5) {
  const server = app.listen(port, HOST, () => {
    printBanner(port);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is already in use. Retrying on port ${nextPort}...`,
      );
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error("Server failed to start:", err.message);
    process.exit(1);
  });
}

connectDB()
  .then(() => {
    startServer(BASE_PORT);
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
