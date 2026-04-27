/**
 * In-memory JWT blacklist.
 *
 * Tokens added on logout are stored with their expiry timestamp.
 * An auto-purge runs every 10 minutes so the Set never grows unbounded.
 */

const _blacklist = new Map(); // token -> expiresAtMs

function addToBlacklist(token, expiresAtMs) {
  _blacklist.set(token, expiresAtMs);
}

function isBlacklisted(token) {
  if (!_blacklist.has(token)) return false;
  // If the token is already past its natural expiry it is effectively dead anyway
  if (Date.now() > _blacklist.get(token)) {
    _blacklist.delete(token);
    return false;
  }
  return true;
}

// Purge expired entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, exp] of _blacklist.entries()) {
      if (now > exp) _blacklist.delete(token);
    }
  },
  10 * 60 * 1000,
);

module.exports = { addToBlacklist, isBlacklisted };
