chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "FETCH_RMP") return;

  const { firstName, lastName } = message.payload;

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
      text: firstName + " " + lastName,
      schoolID: "U2Nob29sLTE0NjI="
    }
  };

  fetch("https://www.ratemyprofessors.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables })
  })
    .then(res => res.json())
    .then(json => sendResponse({ success: true, data: json }))
    .catch(err =>
      sendResponse({ success: false, error: err.toString() })
    );

  return true; // REQUIRED: keeps message channel open
});
