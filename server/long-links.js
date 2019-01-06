/**
 * A module that contains functions for creating long links.
 *
 * @module long-links
 */

let db = require('./database.js').get();

/**
 * Returns a long link for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to find the long link of.
 * @return {string} The long link.
 */
module.exports.get = async function getLongLinkFromDatabase(shortLinkID) {
    let doc;

    try {
        doc = await db.collection('shortLinks').doc(shortLinkID).get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when finding the short link.';
    }

    if (!doc.exists) {
        throw 'That short link does not exist or has expired.';
    }

    let data = doc.data();

    if (data.expiryDate && data.expiryDate.toDate() <= new Date()) {
        throw 'That short link does not exist or has expired.';
    }

    return data.longLink;
};
