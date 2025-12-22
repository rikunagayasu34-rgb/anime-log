const ANILIST_API = 'https://graphql.anilist.co';

export async function searchAnime(query: string) {
  const graphqlQuery = {
    query: `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title {
              native
              romaji
            }
            coverImage {
              medium
            }
            seasonYear
            season
            genres
          }
        }
      }
    `,
    variables: { search: query }
  };

  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphqlQuery)
  });

  const data = await response.json();
  return data.data.Page.media;
}

