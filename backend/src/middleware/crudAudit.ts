import type { NextFunction, Request, Response } from 'express'
import type { AuthRequest } from './auth'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

const operationByMethod: Record<string, CrudOperation | undefined> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
}

const routePathFor = (req: Request) => {
  const routePath = typeof req.route?.path === 'string' ? req.route.path : ''
  return `${req.baseUrl || ''}${routePath || req.path}`
}

export function auditCrudOperations(req: Request, res: Response, next: NextFunction) {
  const operation = operationByMethod[req.method]
  if (!operation) return next()

  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    const user = (req as AuthRequest).user
    const event = {
      event: 'crud_operation',
      operation,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      route: routePathFor(req),
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      actorId: user?.id || 'anonymous',
      actorEmail: user?.email,
      actorRole: user?.role,
      ip: req.ip,
    }

    const log = res.statusCode >= 400 ? console.warn : console.info
    log('[crud]', event)
  })

  next()
}
