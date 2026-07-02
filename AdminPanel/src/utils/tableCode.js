// Derives a short, human-friendly table code from an area name and table id.
// e.g. area "Couple Table" + id "Couple Table-T1" -> "CT-01"
//      area "Ground Floor" + id "Ground Floor-T5" -> "GF-05"

/**
 * Builds an area abbreviation from its name.
 * - Multiple words: first letter of each word (e.g. "Couple Table" -> "CT").
 * - Single word: first two letters (e.g. "Bar" -> "BA").
 */
export const getAreaCode = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "T";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0].toUpperCase()).join("");
};

/**
 * Derives a display code from a raw table id string alone (no area object).
 * Expects ids shaped like "<Area>-T<number>" or "<Area>-<number>",
 * e.g. "Couple Table-T1" -> "CT-01". Returns the input unchanged when it
 * doesn't match that shape.
 */
export const getTableCodeFromId = (rawId = "") => {
  const value = String(rawId ?? "").trim();
  if (!value) return value;
  const match = value.match(/^(.*?)-T?(\d+)\s*$/);
  if (!match || !match[1]) return value;
  return `${getAreaCode(match[1])}-${match[2].padStart(2, "0")}`;
};

/**
 * Returns the display code for a table, e.g. "CT-01".
 * Uses the table's area when available, otherwise derives from the id string.
 * Falls back to the raw id when no trailing number can be found.
 */
export const getTableCode = (table) => {
  if (!table) return "";
  const rawId = String(table.id ?? "");
  if (!table.area) return getTableCodeFromId(rawId);
  const match = rawId.match(/(\d+)\s*$/);
  if (!match) return rawId;
  return `${getAreaCode(table.area)}-${match[1].padStart(2, "0")}`;
};
