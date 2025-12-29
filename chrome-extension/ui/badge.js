export function createBadge(data) {
  const badge = document.createElement("span");
  badge.className = "rmp-badge";

  if (!data) {
    badge.textContent = "No RMP data";
    return badge;
  }

  badge.innerHTML = `
    ⭐ ${data.avgRating || "N/A"}
    (${data.numRatings || 0})
  `;

  badge.title = `
Difficulty: ${data.avgDifficulty}
Would Take Again: ${data.wouldTakeAgainPercent}%
  `;

  return badge;
}
