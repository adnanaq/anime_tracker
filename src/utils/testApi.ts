// Utility to test API connectivity
export const testMALConnection = async () => {
  const CLIENT_ID = import.meta.env.VITE_MAL_CLIENT_ID
  
  try {
    const response = await fetch('https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=1&fields=id,title', {
      method: 'GET',
      headers: {
        'X-MAL-CLIENT-ID': CLIENT_ID,
      },
    })
    
    if (response.ok) {
      return true
    } else {
      console.error('MAL API connection failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('MAL API connection error:', error)
    return false
  }
}

export const testAniListConnection = async () => {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 1) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
            }
          }
        }
      }
    `
    
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
    
    if (response.ok) {
      return true
    } else {
      console.error('AniList API connection failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('AniList API connection error:', error)
    return false
  }
}