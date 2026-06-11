import { Router, Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { query } from '../utils/db'
import {
  buildImpactSummary,
  getPeriodStart,
  type AnalyticsPeriod,
  type CarbonEntryRow,
} from '../utils/analytics'

const router = Router()

function readPeriod(value: unknown): AnalyticsPeriod {
  return value === 'month' || value === 'year' || value === 'all' ? value : 'all'
}

function readYear(value: unknown): number {
  const parsed = Number(value)
  const currentYear = new Date().getUTCFullYear()
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : currentYear
}

router.get('/impact', requireAuth, async (req: AuthRequest, res: Response) => {
  const period = readPeriod(req.query.period)
  const periodStart = getPeriodStart(period)

  const params: unknown[] = [req.user!.id]
  let where = 'where user_id = $1'
  if (periodStart) {
    params.push(periodStart.toISOString())
    where += ' and created_at >= $2'
  }

  const { rows } = await query<CarbonEntryRow>(
    `select id, trips, total_emissions, flight_emissions, car_emissions, hotel_emissions,
            rail_emissions, bus_emissions, taxi_emissions, created_at
     from carbon_entries
     ${where}
     order by created_at desc`,
    params,
  )

  res.status(200).json(buildImpactSummary(rows, period))
})

router.get('/goal', requireAuth, async (req: AuthRequest, res: Response) => {
  const year = readYear(req.query.year)
  const start = new Date(Date.UTC(year, 0, 1)).toISOString()
  const end = new Date(Date.UTC(year + 1, 0, 1)).toISOString()

  const [goalResult, emissionsResult] = await Promise.all([
    query(
      `select id, year, annual_budget_kg, created_at, updated_at
       from carbon_budget_goals
       where user_id = $1 and year = $2`,
      [req.user!.id, year],
    ),
    query<{ total_emissions: string }>(
      `select coalesce(sum(total_emissions), 0) as total_emissions
       from carbon_entries
       where user_id = $1 and created_at >= $2 and created_at < $3`,
      [req.user!.id, start, end],
    ),
  ])

  const annualBudgetKg = goalResult.rows[0] ? Number(goalResult.rows[0].annual_budget_kg) : null
  const usedKg = Number(emissionsResult.rows[0]?.total_emissions || 0)
  const percentUsed = annualBudgetKg && annualBudgetKg > 0 ? (usedKg / annualBudgetKg) * 100 : null

  res.status(200).json({
    goal: goalResult.rows[0]
      ? {
          id: goalResult.rows[0].id,
          year: goalResult.rows[0].year,
          annualBudgetKg,
          createdAt: goalResult.rows[0].created_at,
          updatedAt: goalResult.rows[0].updated_at,
        }
      : null,
    year,
    usedKg: Math.round(usedKg * 10) / 10,
    remainingKg: annualBudgetKg === null ? null : Math.round((annualBudgetKg - usedKg) * 10) / 10,
    percentUsed: percentUsed === null ? null : Math.round(percentUsed * 10) / 10,
  })
})

router.put('/goal', requireAuth, async (req: AuthRequest, res: Response) => {
  const year = readYear(req.body?.year)
  const annualBudgetKg = Number(req.body?.annualBudgetKg)

  if (!Number.isFinite(annualBudgetKg) || annualBudgetKg <= 0) {
    res.status(400).json({ error: 'annualBudgetKg must be a positive number' })
    return
  }

  const { rows } = await query(
    `insert into carbon_budget_goals (user_id, year, annual_budget_kg)
     values ($1, $2, $3)
     on conflict (user_id, year)
     do update set annual_budget_kg = excluded.annual_budget_kg, updated_at = now()
     returning id, year, annual_budget_kg, created_at, updated_at`,
    [req.user!.id, year, annualBudgetKg],
  )

  res.status(200).json({
    goal: {
      id: rows[0].id,
      year: rows[0].year,
      annualBudgetKg: Number(rows[0].annual_budget_kg),
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    },
  })
})

export default router

