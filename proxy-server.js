// Simple proxy server for MyAnimeList API to handle CORS
import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = 3002

// Enable CORS for all routes
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const MAL_BASE_URL = 'https://api.myanimelist.net/v2'
const CLIENT_ID = '195a1bf1e8043ed0507576d020e9e17d'

const ANILIST_CLIENT_ID = '24531'
const ANILIST_CLIENT_SECRET = '5rUv0GnpO2dwYtV6PnxtEMmMRFWWUiocUtox8HNt'

const ANIME_SCHEDULE_TOKEN = process.env.ANIME_SCHEDULE_TOKEN || 'MDnyW7kcDAMtyiaIg4bc2IIMOrHpbQ'

// Proxy middleware for AniList OAuth token exchange
app.post('/anilist/oauth/token', async (req, res) => {
  try {
    
    const response = await axios.post('https://anilist.co/api/v2/oauth/token', req.body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('AniList OAuth token error:', error.response?.status, error.response?.data)
    res.status(error.response?.status || 500).json({
      error: 'AniList OAuth Error',
      message: error.message,
      details: error.response?.data,
    })
  }
})

// Proxy middleware for MAL OAuth token exchange
app.post('/mal/oauth/token', async (req, res) => {
  try {
    
    // Parse the form data to log individual fields
    const bodyString = Object.keys(req.body).map(key => `${key}=${req.body[key]}`).join('&')
    
    const response = await axios.post('https://myanimelist.net/v1/oauth2/token', req.body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('MAL OAuth token error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestBody: req.body
    })
    res.status(error.response?.status || 500).json({
      error: 'MAL OAuth Error',
      message: error.message,
      details: error.response?.data,
    })
  }
})

// Proxy middleware for MAL API
app.get('/mal/*', async (req, res) => {
  try {
    const malPath = req.path.replace('/mal', '')
    const malUrl = `${MAL_BASE_URL}${malPath}`
    
    
    // Forward authorization header if present
    const headers = {
      'X-MAL-CLIENT-ID': CLIENT_ID,
    }
    
    // Forward Authorization header from client to MAL API
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    } else {
    }
    
    const response = await axios.get(malUrl, {
      headers,
      params: req.query,
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('MAL Proxy Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('MAL Error Details:', error.response.data)
    }
    res.status(error.response?.status || 500).json({
      error: 'MAL API Error',
      message: error.message,
      status: error.response?.status,
    })
  }
})

// Proxy middleware for MAL API PUT requests (for updating anime status)
app.put('/mal/*', async (req, res) => {
  try {
    const malPath = req.path.replace('/mal', '')
    const malUrl = `${MAL_BASE_URL}${malPath}`
    
    console.log('🎬 MAL PUT Proxy:', { malUrl, body: req.body })
    
    // Forward authorization header if present
    const headers = {
      'X-MAL-CLIENT-ID': CLIENT_ID,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    
    // Forward Authorization header from client to MAL API
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    }
    
    const response = await axios.put(malUrl, req.body, {
      headers,
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('MAL PUT Proxy Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('MAL PUT Error Details:', error.response.data)
    }
    res.status(error.response?.status || 500).json({
      error: 'MAL API Error',
      message: error.message,
      status: error.response?.status,
    })
  }
})

// Proxy middleware for MAL API DELETE requests (for removing anime from list)
app.delete('/mal/*', async (req, res) => {
  try {
    const malPath = req.path.replace('/mal', '')
    const malUrl = `${MAL_BASE_URL}${malPath}`
    
    console.log('🎬 MAL DELETE Proxy:', { malUrl })
    
    // Forward authorization header if present
    const headers = {
      'X-MAL-CLIENT-ID': CLIENT_ID,
    }
    
    // Forward Authorization header from client to MAL API
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    }
    
    const response = await axios.delete(malUrl, {
      headers,
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('MAL DELETE Proxy Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('MAL DELETE Error Details:', error.response.data)
    }
    res.status(error.response?.status || 500).json({
      error: 'MAL API Error',
      message: error.message,
      status: error.response?.status,
    })
  }
})

// Proxy middleware for AniList GraphQL API
app.post('/anilist/graphql', async (req, res) => {
  try {
    console.log('🎬 AniList GraphQL Proxy Request:', {
      query: req.body.query?.substring(0, 200) + '...',
      variables: req.body.variables,
      hasAuth: !!req.headers.authorization
    })
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    }
    
    const response = await axios.post('https://graphql.anilist.co/', req.body, {
      headers,
    })
    
    console.log('🎬 AniList GraphQL Success Response:', response.status)
    res.json(response.data)
  } catch (error) {
    console.error('AniList Proxy Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('AniList Error Details:', error.response.data)
    }
    res.status(error.response?.status || 500).json({
      error: 'AniList API Error',
      message: error.message,
      status: error.response?.status,
    })
  }
})

// Proxy middleware for AnimeSchedule API
app.get('/animeschedule/*', async (req, res) => {
  try {
    const schedulePath = req.path.replace('/animeschedule', '')
    const scheduleUrl = `https://animeschedule.net/api/v3${schedulePath}`
    
    console.log('📅 AnimeSchedule Proxy:', { scheduleUrl, params: req.query })
    
    const response = await axios.get(scheduleUrl, {
      params: req.query,
      headers: {
        'Authorization': `Bearer ${ANIME_SCHEDULE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    res.json(response.data)
  } catch (error) {
    console.error('AnimeSchedule Proxy Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('AnimeSchedule Error Details:', error.response.data)
    }
    res.status(error.response?.status || 500).json({
      error: 'AnimeSchedule API Error',
      message: error.message,
      status: error.response?.status,
    })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Anime API Proxy Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`MAL API proxy: http://localhost:${PORT}/mal/...`)
  console.log(`MAL OAuth proxy: http://localhost:${PORT}/mal/oauth/token`)
  console.log(`AniList OAuth proxy: http://localhost:${PORT}/anilist/oauth/token`)
  console.log(`AniList GraphQL proxy: http://localhost:${PORT}/anilist/graphql`)
  console.log(`AnimeSchedule API proxy: http://localhost:${PORT}/animeschedule/...`)
})

export default app