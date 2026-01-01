import pino from 'pino'
import { randomUUID } from 'node:crypto'

const logger = pino({
	transport:
		process.env.GRAPHILE_ENV === 'development'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						ignore: 'pid,hostname',
						translateTime: 'SYS:standard'
					}
			  }
			: undefined
})

export const genReqId = (req: { headers: Record<string, string | string[] | undefined> }) =>
	(req.headers['x-request-id'] as string) || randomUUID()

export default logger
