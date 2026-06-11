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
import userRoutes from './routes/user'
import communityRoutes from './routes/community'
import analyticsRoutes from './routes/analytics'

dotenv.config()

export function createApp(): Application {
  const app: Application = express()

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' })
  })

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
  app.use('/api/user', userRoutes)
  app.use('/api/community', communityRoutes)
  app.use('/api/analytics', analyticsRoutes)

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
  })

  return app
}

const app = createApp()

export default app
