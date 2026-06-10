import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import weatherRoutes from './routes/weather'
import smartRecommendationRoutes from './routes/smart-recommendation'
import ecoRouteRoutes from './routes/eco-route'
import carbonRoutes from './routes/carbon'
import locationsRoutes from './routes/locations'
import favouritesRoutes from './routes/favourites'
import authRoutes from './routes/auth'
import todosRoutes from './routes/todos'
import tripsRoutes from './routes/trips'
import { requireAuth } from './middleware/auth'
import { query } from './utils/db'
import { clearSessionCookie } from './utils/auth'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Terratrace API' })
})
app.use('/api/weather', weatherRoutes)
app.use('/api/recommendations', smartRecommendationRoutes)
app.use('/api/eco-route', ecoRouteRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/carbon', carbonRoutes)
app.use('/api/locations', locationsRoutes)
app.use('/api/favourites', favouritesRoutes)
app.use('/api/todos', todosRoutes)
app.use('/api/trips', tripsRoutes)

// Delete user account
app.delete('/api/user/account', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await query('delete from users where id = $1', [userId])
    clearSessionCookie(res)

    res.status(200).json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Something went wrong!' })
  }
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
