import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
<import { createClient } from '@supabase/supabase-js'
import weatherRoutes from './routes/weather'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3001

// Supabase Admin client (server-side only)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Terratrace API' })
})
app.use('/api/weather', weatherRoutes)

// Delete user account
app.delete('/api/user/account', async (req: Request, res: Response) => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      res.status(500).json({ error: 'Supabase not configured' })
      return
    }

    // Get authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' })
      return
    }

    const token = authHeader.substring(7)

    // Verify the token and get user ID
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: userData, error: authError } = await adminClient.auth.getUser(token)

    if (authError || !userData?.user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    const userId = userData.user.id

    // Delete user using admin client
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      res.status(500).json({ error: deleteError.message || 'Failed to delete account' })
      return
    }

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
