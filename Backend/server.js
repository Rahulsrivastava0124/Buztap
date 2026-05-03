require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

const BASE_PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

function startServer(port, retriesLeft = 5) {
  const server = app.listen(port, HOST, () => {
    console.log(
      `Buztap API running on http://localhost:${port} (host: ${HOST})`,
    );
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
