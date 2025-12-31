import * as functions from 'firebase-functions';
import app from './app';

// Firebase Function export
// This wraps the Fastify app to handle the request/response from Firebase
export const api = functions.https.onRequest(async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
});
