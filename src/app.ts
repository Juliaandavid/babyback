import Fastify from 'fastify'
import logger, { genReqId } from './config/logger'
import { handler, instance } from './config/postgraphile'

const app = Fastify({
	loggerInstance: logger,
	genReqId,
	requestIdLogLabel: 'id'
})

app.get('/health', async () => {
	return { status: 'UP' }
})

app.options(instance.graphqlRoute, handler(instance.graphqlRouteHandler))
app.post(instance.graphqlRoute, handler(instance.graphqlRouteHandler))

if (instance.options.graphiql) {
	if (instance.graphiqlRouteHandler) {
		app.head(instance.graphiqlRoute, handler(instance.graphiqlRouteHandler))
		app.get(instance.graphiqlRoute, handler(instance.graphiqlRouteHandler))
	}
}

if (process.env.GRAPHILE_ENV === 'development') {
	const port = Number(process.env.PORT) || 3000
	app.listen({ port, host: '0.0.0.0' }, (err, address) => {
		if (err) {
			app.log.error(String(err))
			process.exit(1)
		}
		app.log.info(`PostGraphiQL available at ${address}${instance.graphiqlRoute}`)
	})
}

export default app
