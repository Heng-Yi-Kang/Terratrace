import { Request, Response, Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { pool, query } from '../utils/db'
import { readTokenFromRequest, SessionUser, verifySessionToken } from '../utils/auth'

const router = Router()

type OptionalAuthRequest = Request & { viewer?: SessionUser }

const REVIEW_SELECT = `
  select
    r.id,
    r.user_id as "userId",
    r.location_id as "locationId",
    r.location_name as "location",
    r.city,
    r.country,
    r.category,
    r.rating,
    r.title,
    r.body,
    r.practices,
    r.reviewer_name as "reviewer",
    r.reviewer_initials as "reviewerInitials",
    r.verified,
    r.accent_color as "color",
    r.created_at as "createdAt",
    coalesce(h.helpful_count, 0)::int as "helpful",
    case when $1::uuid is null then false else exists (
      select 1
      from community_review_helpful vh
      where vh.review_id = r.id and vh.user_id = $1::uuid
    ) end as "viewerMarkedHelpful",
    case when $1::uuid is null then false else r.user_id = $1::uuid end as "viewerCanEdit"
  from community_reviews r
  left join (
    select review_id, count(*) as helpful_count
    from community_review_helpful
    group by review_id
  ) h on h.review_id = r.id
`

function optionalAuth(req: OptionalAuthRequest, _res: Response, next: () => void) {
  const token = readTokenFromRequest(req)
  if (token) {
    try {
      req.viewer = verifySessionToken(token)
    } catch {
      req.viewer = undefined
    }
  }
  next()
}

function nonEmptyText(value: unknown, max = 160) {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.slice(0, max)
}

function normalizePractices(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

function initialsFrom(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
  return initials || 'TT'
}

function daysLeft(endsAt: string | null) {
  if (!endsAt) return null
  const ms = new Date(endsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

router.get('/reviews', optionalAuth, async (req: OptionalAuthRequest, res: Response) => {
  const viewerId = req.viewer?.id ?? null
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
  const search = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''

  try {
    const conditions: string[] = []
    const values: unknown[] = [viewerId]

    if (category && category !== 'All') {
      values.push(category.toLowerCase())
      conditions.push(`lower(r.category) = $${values.length}`)
    }

    if (search) {
      values.push(`%${search}%`)
      const param = `$${values.length}`
      conditions.push(`(
        lower(r.location_name) like ${param}
        or lower(r.city) like ${param}
        or lower(r.country) like ${param}
        or lower(r.title) like ${param}
        or lower(r.body) like ${param}
      )`)
    }

    const where = conditions.length ? ` where ${conditions.join(' and ')}` : ''
    const { rows } = await query(`${REVIEW_SELECT}${where} order by r.created_at desc`, values)
    return res.status(200).json(rows)
  } catch (error) {
    console.error('Unexpected error in GET community reviews:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.post('/reviews', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!
  const location = nonEmptyText(req.body?.location, 120)
  const category = nonEmptyText(req.body?.category, 80)
  const title = nonEmptyText(req.body?.title, 160)
  const body = nonEmptyText(req.body?.body, 2000)
  const city = nonEmptyText(req.body?.city, 80) || null
  const country = nonEmptyText(req.body?.country, 80) || null
  const locationId = nonEmptyText(req.body?.locationId, 80) || null
  const rating = Number(req.body?.rating)
  const practices = normalizePractices(req.body?.practices)
  const reviewer = user.username || user.email.split('@')[0] || 'Terratrace traveler'

  if (!location || !category || !title || !body) {
    return res.status(400).json({ error: 'location, category, title, and body are required' })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' })
  }

  try {
    const { rows } = await query(
      `insert into community_reviews (
         user_id, location_id, location_name, city, country, category, rating, title, body,
         practices, reviewer_name, reviewer_initials, verified
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
       returning id`,
      [
        user.id,
        locationId,
        location,
        city,
        country,
        category,
        rating,
        title,
        body,
        practices,
        reviewer,
        initialsFrom(reviewer),
      ],
    )
    const review = await query(`${REVIEW_SELECT} where r.id = $2`, [user.id, rows[0].id])
    return res.status(201).json(review.rows[0])
  } catch (error) {
    console.error('Unexpected error in POST community review:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.patch('/reviews/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const rating = Number(req.body?.rating)
  const title = nonEmptyText(req.body?.title, 160)
  const body = nonEmptyText(req.body?.body, 2000)
  const practices = normalizePractices(req.body?.practices)

  if (!title || !body) return res.status(400).json({ error: 'title and body are required' })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' })
  }

  try {
    const { rows } = await query(
      `update community_reviews
       set rating = $3, title = $4, body = $5, practices = $6, updated_at = now()
       where id = $1 and user_id = $2
       returning id`,
      [req.params.id, req.user!.id, rating, title, body, practices],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' })

    const review = await query(`${REVIEW_SELECT} where r.id = $2`, [req.user!.id, req.params.id])
    return res.status(200).json(review.rows[0])
  } catch (error) {
    console.error('Unexpected error in PATCH community review:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.post('/reviews/:id/helpful', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const exists = await query('select id from community_reviews where id = $1 limit 1', [req.params.id])
    if (!exists.rows[0]) return res.status(404).json({ error: 'Review not found' })

    await query(
      `insert into community_review_helpful (review_id, user_id)
       values ($1, $2)
       on conflict do nothing`,
      [req.params.id, req.user!.id],
    )
    const review = await query(`${REVIEW_SELECT} where r.id = $2`, [req.user!.id, req.params.id])
    return res.status(200).json(review.rows[0])
  } catch (error) {
    console.error('Unexpected error in POST review helpful:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.delete('/reviews/:id/helpful', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await query('delete from community_review_helpful where review_id = $1 and user_id = $2', [
      req.params.id,
      req.user!.id,
    ])
    const review = await query(`${REVIEW_SELECT} where r.id = $2`, [req.user!.id, req.params.id])
    if (!review.rows[0]) return res.status(404).json({ error: 'Review not found' })
    return res.status(200).json(review.rows[0])
  } catch (error) {
    console.error('Unexpected error in DELETE review helpful:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.get('/challenges', optionalAuth, async (req: OptionalAuthRequest, res: Response) => {
  const viewerId = req.viewer?.id ?? null

  try {
    const { rows } = await query(
      `select
         c.id,
         c.slug,
         c.title,
         c.description,
         c.reward,
         c.points,
         c.category,
         c.total,
         c.unit,
         c.ends_at as "endsAt",
         b.name as "badge",
         b.icon as "badgeIcon",
         b.color as "badgeColor",
         coalesce(p.participants, 0)::int as "participants",
         coalesce(cp.progress, 0)::int as "progress",
         cp.joined_at as "joinedAt",
         cp.completed_at as "completedAt"
       from community_challenges c
       left join community_badges b on b.id = c.badge_id
       left join (
         select challenge_id, count(*) as participants
         from community_challenge_progress
         group by challenge_id
       ) p on p.challenge_id = c.id
       left join community_challenge_progress cp on cp.challenge_id = c.id and cp.user_id = $1::uuid
       where c.active = true
       order by c.starts_at desc, c.created_at desc`,
      [viewerId],
    )

    return res.status(200).json(rows.map((row: any) => ({ ...row, daysLeft: daysLeft(row.endsAt) })))
  } catch (error) {
    console.error('Unexpected error in GET community challenges:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.post('/challenges/:id/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const exists = await query('select id from community_challenges where id = $1 and active = true limit 1', [
      req.params.id,
    ])
    if (!exists.rows[0]) return res.status(404).json({ error: 'Challenge not found' })

    await query(
      `insert into community_challenge_progress (challenge_id, user_id)
       values ($1, $2)
       on conflict do nothing`,
      [req.params.id, req.user!.id],
    )
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Unexpected error in POST challenge join:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.patch('/challenges/:id/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  const inputProgress = Number(req.body?.progress)
  if (!Number.isInteger(inputProgress) || inputProgress < 0) {
    return res.status(400).json({ error: 'progress must be a non-negative integer' })
  }

  const client = await pool.connect()
  try {
    await client.query('begin')
    const challengeResult = await client.query(
      `select c.id, c.total, c.badge_id
       from community_challenges c
       where c.id = $1 and c.active = true
       limit 1`,
      [req.params.id],
    )
    const challenge = challengeResult.rows[0]
    if (!challenge) {
      await client.query('rollback')
      return res.status(404).json({ error: 'Challenge not found' })
    }

    const progress = Math.min(inputProgress, Number(challenge.total))
    const completedAt = progress >= Number(challenge.total) ? new Date() : null
    const progressResult = await client.query(
      `insert into community_challenge_progress (challenge_id, user_id, progress, completed_at)
       values ($1, $2, $3, $4)
       on conflict (challenge_id, user_id) do update
       set progress = excluded.progress,
           completed_at = case
             when community_challenge_progress.completed_at is not null then community_challenge_progress.completed_at
             else excluded.completed_at
           end,
           updated_at = now()
       returning progress, completed_at as "completedAt"`,
      [req.params.id, req.user!.id, progress, completedAt],
    )

    if (completedAt && challenge.badge_id) {
      await client.query(
        `insert into community_user_badges (badge_id, user_id)
         values ($1, $2)
         on conflict do nothing`,
        [challenge.badge_id, req.user!.id],
      )
    }

    await client.query('commit')
    return res.status(200).json(progressResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    console.error('Unexpected error in PATCH challenge progress:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  } finally {
    client.release()
  }
})

router.get('/badges', optionalAuth, async (req: OptionalAuthRequest, res: Response) => {
  const viewerId = req.viewer?.id ?? null

  try {
    const { rows } = await query(
      `select
         b.id,
         b.name,
         b.icon,
         b.color,
         ub.earned_at as "earnedAt",
         (ub.earned_at is not null) as earned
       from community_badges b
       left join community_user_badges ub on ub.badge_id = b.id and ub.user_id = $1::uuid
       order by b.created_at asc`,
      [viewerId],
    )
    return res.status(200).json(rows)
  } catch (error) {
    console.error('Unexpected error in GET community badges:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.get('/leaderboard', optionalAuth, async (req: OptionalAuthRequest, res: Response) => {
  const viewerId = req.viewer?.id ?? null

  try {
    const { rows } = await query(
      `with challenge_scores as (
         select
           cp.user_id,
           coalesce(sum(case when cp.completed_at is not null then c.points else 0 end), 0)::int as points
         from community_challenge_progress cp
         left join community_challenges c on c.id = cp.challenge_id
         group by cp.user_id
       ),
       badge_scores as (
         select user_id, count(distinct badge_id)::int as badges
         from community_user_badges
         group by user_id
       ),
       active_users as (
         select user_id from challenge_scores
         union
         select user_id from badge_scores
         union
         select $1::uuid as user_id where $1::uuid is not null
       ),
       scores as (
         select
           u.id,
           coalesce(nullif(u.username, ''), split_part(u.email, '@', 1)) as name,
           coalesce(cs.points, 0)::int as points,
           coalesce(bs.badges, 0)::int as badges
         from active_users au
         join users u on u.id = au.user_id
         left join challenge_scores cs on cs.user_id = u.id
         left join badge_scores bs on bs.user_id = u.id
       ),
       ranked as (
         select *, rank() over (order by points desc, badges desc, name asc) as rank
         from scores
       ),
       selected as (
         select * from ranked where rank <= 10
         union
         select * from ranked where id = $1::uuid
       )
       select id, rank::int, name, points, badges, id = $1::uuid as you
       from selected
       order by rank asc, name asc`,
      [viewerId],
    )
    return res.status(200).json(rows)
  } catch (error) {
    console.error('Unexpected error in GET community leaderboard:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.get('/summary', optionalAuth, async (req: OptionalAuthRequest, res: Response) => {
  const viewerId = req.viewer?.id ?? null

  try {
    const { rows } = await query(
      `select
         coalesce(sum(case when cp.completed_at is not null then c.points else 0 end), 0)::int as points,
         count(distinct ub.badge_id)::int as "earnedBadges"
       from (select $1::uuid as user_id) viewer
       left join community_challenge_progress cp on cp.user_id = viewer.user_id
       left join community_challenges c on c.id = cp.challenge_id
       left join community_user_badges ub on ub.user_id = viewer.user_id`,
      [viewerId],
    )
    return res.status(200).json(rows[0] || { points: 0, earnedBadges: 0 })
  } catch (error) {
    console.error('Unexpected error in GET community summary:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

export default router
