const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/rmp", async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Missing firstName or lastName" });
  }

  const query = `
    query SearchProfessors($query: TeacherSearchQuery!) {
      search: newSearch {
        teachers(query: $query) {
          edges {
            node {
              firstName
              lastName
              avgRating
              numRatings
              avgDifficulty
              wouldTakeAgainPercent
              legacyId
            }
          }
        }
      }
    }
  `;

  const variables = {
    query: {
      text: `${firstName} ${lastName}`,
    }
  };

  try {
    const response = await fetch("https://www.ratemyprofessors.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });

    const json = await response.json();
    console.log("RMP Proxy Response:", JSON.stringify(json, null, 2));
    res.json(json);
  } catch (err) {
    console.error("RMP fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch from RMP" });
  }
});

app.listen(PORT, () => {
  console.log(`RMP Proxy Server running on http://localhost:${PORT}`);
});
