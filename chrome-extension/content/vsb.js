import { observeDOM } from "../../utils/domObserver.js";
import { normalizeName } from "../../utils/nameNormalizer.js";
import { fetchProfessorRating } from "../../services/rateMyProfApi.js";
import { createBadge } from "../../ui/badge.js";

const processedProfs = new Set();

/**
 * Attempt to extract professor name from VSB section details
 */
function findProfessorName() {
  // VSB typically shows instructor info in labels or detail rows
  const labels = Array.from(document.querySelectorAll("label, span, div"));

  for (const el of labels) {
    const text = el.textContent || "";

    // Common patterns: "Instructor: John Smith"
    if (text.toLowerCase().includes("instructor")) {
      const parts = text.split(":");
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
  }

  return null;
}

/**
 * Inject RMP badge near the professor name
 */
async function injectRating() {
  const profName = findProfessorName();
  if (!profName || processedProfs.has(profName)) return;

  processedProfs.add(profName);

  // Handle formats like "Smith, John" or "John Smith"
  let firstName = "";
  let lastName = "";

  if (profName.includes(",")) {
    const parts = profName.split(",");
    lastName = parts[0].trim();
    firstName = parts[1].trim();
  } else {
    const parts = profName.split(" ");
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }

  if (!firstName || !lastName) return;

  const data = await fetchProfessorRating(
    normalizeName(firstName),
    normalizeName(lastName)
  );

  // Find a place to inject UI
  const container = Array.from(document.querySelectorAll("label, span, div"))
    .find(el => el.textContent?.includes(profName));

  if (!container) return;

  // Avoid injecting twice
  if (container.querySelector(".rmp-badge")) return;

  const badge = createBadge(data);
  container.appendChild(badge);
}

// Observe DOM changes because VSB is dynamic
observeDOM(injectRating);
