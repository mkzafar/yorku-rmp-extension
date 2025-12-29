const RMP_ENDPOINT = "https://www.ratemyprofessors.com/graphql";

const YORKU_SCHOOL_ID = "U2Nob29sLTE0NjI="; // York University 

export async function fetchProfessorRating(firstName, lastName) {
  const query = `
    query SearchProfessors($query: TeacherSearchQuery!) {
      search: newSearch {
        teachers(query: $query) {
          edges {
            node {
              id
              firstName
              lastName
              avgRating
              avgDifficulty
              wouldTakeAgainPercent
              numRatings
            }
          }
        }
      }
    }
  `;

  const variables = {
    query: {
      text: `${firstName} ${lastName}`,
      schoolID: YORKU_SCHOOL_ID
    }
  };

  const response = await fetch(RMP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();
  return json?.data?.search?.teachers?.edges?.[0]?.node || null;
}
