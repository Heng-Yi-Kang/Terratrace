import { Router, Response } from 'express'
import { query } from '../utils/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

const todoSelect = `
  select id, name, is_complete as "isComplete", inserted_at
  from todos
  where user_id = $1
`

router.get('/', async (req: AuthRequest, res: Response) => {
  const { rows } = await query(`${todoSelect} order by inserted_at desc`, [req.user!.id])
  return res.status(200).json(rows)
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'name is required' })

  const { rows } = await query(
    `insert into todos (user_id, name)
     values ($1, $2)
     returning id, name, is_complete as "isComplete", inserted_at`,
    [req.user!.id, name],
  )

  return res.status(201).json(rows[0])
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const isComplete = Boolean(req.body?.isComplete)
  const { rows } = await query(
    `update todos
     set is_complete = $3
     where id = $1 and user_id = $2
     returning id, name, is_complete as "isComplete", inserted_at`,
    [req.params.id, req.user!.id, isComplete],
  )

  if (!rows[0]) return res.status(404).json({ error: 'Todo not found' })
  return res.status(200).json(rows[0])
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await query('delete from todos where id = $1 and user_id = $2', [req.params.id, req.user!.id])
  return res.status(200).json({ success: true })
})

export default router
