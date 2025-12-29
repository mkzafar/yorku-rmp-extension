console.log("YorkU RMP Extension loaded on York Courses");

/* ------------------ Utilities ------------------ */

function observeDOM(callback) {
  const observer = new MutationObserver(() => callback());
  observer.observe(document.body, { childList: true, subtree: true });
}

function normalizeName(name) {
  return name
    .replace(",", "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/* ------------------ RateMyProfessor Proxy Fetch ------------------ */

async function fetchProfessorRating(firstName, lastName) {
  try {
    const response = await fetch("http://localhost:3000/rmp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName })
    });

    if (!response.ok) {
      console.error("RMP proxy returned error", response.status);
      return null;
    }

    const json = await response.json();
    const edges = json?.data?.search?.teachers?.edges || [];
    if (edges.length === 0) return null;

    const targetFull = normalizeName(firstName + " " + lastName);

    // exact match
    for (const edge of edges) {
      const node = edge.node;
      if (normalizeName(node.firstName + " " + node.lastName) === targetFull) {
        return node;
      }
    }

    // fallback: last name + first initial
    for (const edge of edges) {
      const node = edge.node;
      if (
        normalizeName(node.lastName) === normalizeName(lastName) &&
        node.firstName[0] === firstName[0]
      ) {
        return node;
      }
    }

    return null;
  } catch (err) {
    console.error("Error fetching from RMP proxy:", err);
    return null;
  }
}

/* ------------------ Badge / Info UI ------------------ */

function createProfessorInfo(data) {
  const container = document.createElement("span");
  container.style.display = "inline-block";
  container.style.marginLeft = "6px";
  container.style.padding = "2px 6px";
  container.style.borderRadius = "6px";
  container.style.fontSize = "11px";
  container.style.fontWeight = "bold";
  container.style.whiteSpace = "nowrap";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.background = "#f5f5f5"; // subtle neutral background

  if (!data || !data.avgRating) {
    container.textContent = "⭐ N/A";
    container.style.color = "#888";
    return container;
  }

  // Determine rating color
  let ratingColor = "#4caf50"; // default green
  const avg = parseFloat(data.avgRating);
  if (avg < 2.5) ratingColor = "#e53935"; // red
  else if (avg < 3.5) ratingColor = "#ff9800"; // orange/yellow

  container.innerHTML = `
    ⭐ <span style="color:${ratingColor}">${data.avgRating}</span>
    (${data.numRatings || 0}) • 
    Difficulty: ${data.avgDifficulty || "N/A"} • 
    Would Take Again: ${data.wouldTakeAgainPercent || 0}%
  `;

  // Tooltip
  container.title = `Average Rating: ${data.avgRating}\nNumber of Ratings: ${data.numRatings}\nDifficulty: ${data.avgDifficulty}\nWould Take Again: ${data.wouldTakeAgainPercent}%`;

  return container;
}

/* ------------------ Professor Detection ------------------ */

function getProfessorLinks() {
  const tdElements = Array.from(document.querySelectorAll("td"));

  return tdElements
    .filter(td => {
      const links = td.querySelectorAll("a");
      const hasBr = td.querySelector("br");

      if (links.length !== 1 || !hasBr) return false;

      const text = links[0].textContent.replace(/\s+/g, " ").trim();
      if (text.split(" ").length !== 2) return false;
      return /^[A-Za-z\s'-]+$/.test(text);
    })
    .map(td => td.querySelector("a"));
}

/* ------------------ Main Injection Logic ------------------ */

const processed = new Map(); // cache name -> badge

async function injectProfessorInfo() {
  const professorLinks = getProfessorLinks();

  for (const link of professorLinks) {
    const name = link.textContent.replace(/\s+/g, " ").trim();
    if (processed.has(name)) {
      // already processed, just append cached element clone
      const clone = processed.get(name).cloneNode(true);
      link.appendChild(clone);
      continue;
    }

    const parts = name.split(" ");
    if (parts.length !== 2) continue;

    const firstName = parts[0];
    const lastName = parts[1];

    console.log("Fetching RMP for:", firstName, lastName);

    // placeholder while fetching
    const placeholder = document.createElement("span");
    placeholder.textContent = " ⏳";
    placeholder.style.marginLeft = "6px";
    placeholder.style.fontSize = "11px";
    link.appendChild(placeholder);

    const data = await fetchProfessorRating(firstName, lastName);

    const infoElement = createProfessorInfo(data);
    placeholder.replaceWith(infoElement);

    // cache for reuse
    processed.set(name, infoElement.cloneNode(true));
  }
}

// Run once immediately
injectProfessorInfo();

// Observe dynamic page updates
observeDOM(injectProfessorInfo);
