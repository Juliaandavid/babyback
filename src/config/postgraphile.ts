import type { FastifyReply, FastifyRequest } from 'fastify'
import { postgraphile, PostGraphileResponseFastify3 } from 'postgraphile'
import type { PostGraphileOptions, PostGraphileResponse } from 'postgraphile'
import type { IncomingMessage } from 'node:http'
import { auth } from './firebase'
import baseLogger from './logger'

const logger = baseLogger.child({ module: 'PostGraphile' })

let config: PostGraphileOptions = {
	retryOnInitFail: (error, attemps) => {
		logger.error({ error }, 'PostGraphile initialization failed')
		return attemps < 3
	},
	pgSettings: async (req: IncomingMessage) => {
		const authorization = req.headers.authorization
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return {
				role: 'anonymous'
			}
		}

		const token = authorization.slice(7)
		try {
			const decodedToken = await auth.verifyIdToken(token)

			const role = (decodedToken.role as string) || 'authenticated_user'

			const claims = Object.entries(decodedToken).reduce((acc, [key, value]) => {
				acc[`jwt.claims.${key}`] = value
				return acc
			}, {} as Record<string, unknown>)

			return {
				role,
				'jwt.claims.user_id': decodedToken.uid,
				...claims
			}
		} catch (error) {
			logger.error({ error }, 'Firebase Auth Error')
			return {
				role: 'anonymous'
			}
		}
	}
}

if (process.env.GRAPHILE_ENV === 'development') {
	config = {
		...config,
		graphiql: true,
		enhanceGraphiql: true
	}
} else {
	config = {
		...config,
		disableQueryLog: true
	}
}

export const instance = postgraphile(process.env.DATABASE_URL, process.env.DATABASE_SCHEMAS!.split(','), config)

export const handler =
	(handler: (_res: PostGraphileResponse) => Promise<void>) => (request: FastifyRequest, reply: FastifyReply) =>
		handler(new PostGraphileResponseFastify3(request, reply))
