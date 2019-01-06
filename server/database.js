/**
 * A module that contains database-related functions.
 *
 * @module database
 */

let firebase = require('firebase-admin');
let serviceKey = require('./config/firebaseServiceKey.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceKey),
    databaseURL: `https://${serviceKey.project_id}.firebaseio.com`,
});

firebase.firestore().settings({ timestampsInSnapshots: true });

/**
 * Returns a configured Firebase Firestore reference.
 *
 * @return {Object} The Firestore.
 */
module.exports.get = function getDatabase() {
    return firebase.firestore();
};
