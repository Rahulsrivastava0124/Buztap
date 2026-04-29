const RETRY_KEY_PREFIX = "lazy-reload:";

function isChunkLoadError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("chunkloaderror")
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function lazyWithRetry(
  importer,
  key,
  retries = 2,
  retryDelayMs = 300,
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const loaded = await importer();
      sessionStorage.removeItem(`${RETRY_KEY_PREFIX}${key}`);
      return loaded;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(retryDelayMs * (attempt + 1));
      }
    }
  }

  const reloadKey = `${RETRY_KEY_PREFIX}${key}`;
  const alreadyReloaded = sessionStorage.getItem(reloadKey) === "1";
  if (!alreadyReloaded && isChunkLoadError(lastError)) {
    sessionStorage.setItem(reloadKey, "1");
    window.location.reload();
    return new Promise(() => {});
  }

  throw lastError;
}
