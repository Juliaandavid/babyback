import type { FastifyReply, FastifyRequest } from 'fastify'
import { postgraphile, PostGraphileResponseFastify3 } from 'postgraphile'
import type { PostGraphileOptions, PostGraphileResponse } from 'postgraphile'

let config: PostGraphileOptions = {
	retryOnInitFail: (error, attemps) => {
		console.log(error)
		return attemps < 3
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
		...config
	}
}

export const instance = postgraphile(process.env.DATABASE_URL, process.env.DATABASE_SCHEMAS!.split(','), config)

export const handler =
	(handler: (_res: PostGraphileResponse) => Promise<void>) => (request: FastifyRequest, reply: FastifyReply) =>
		handler(new PostGraphileResponseFastify3(request, reply))
