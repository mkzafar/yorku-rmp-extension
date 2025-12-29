export function normalizeName(name) {
  if (!name) return "";

  return name
    .replace(",", "") 
    .replace(/\./g, "")
    .replace(/\s+/g, " ") // new
    .replace(/\b[A-Z]\.\b/g, "") // new
    .toLowerCase()
    .trim();
}