const admin = require('firebase-admin');

let app;
function getApp() {
  if (app) return app;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env required');
  const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  app = admin.initializeApp({
    credential: admin.credential.cert(creds),
    projectId: process.env.FIREBASE_PROJECT_ID || creds.project_id
  });
  return app;
}

function getDb() {
  return admin.firestore(getApp());
}

module.exports = { getDb };
