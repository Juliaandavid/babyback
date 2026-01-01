import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import baseLogger from './logger'

const logger = baseLogger.child({ module: 'FirebaseConfig' })

try {
	initializeApp()
	logger.info('Firebase Admin SDK initialized successfully')
} catch (error) {
	logger.error({ error }, 'Error initializing Firebase Admin SDK')
	process.exit(1)
}

export const auth = getAuth()
