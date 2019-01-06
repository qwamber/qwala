/**
 * A module that contains functions for creating and managing short links.
 *
 * @module short-links
 */

let urlRegExp = require('url-regex');
let db = require('./database.js').get();
let util = require('./util');
let statistics = require('./total-statistics.js');
let settings = require('./config/settings');

/**
 * Creates a short link ID for a long link and adds it to the database.
 *
 * @param {string} longLink The long link to shorten.
 * @param {ShortLinksCreateOptions} [options] Options to use advanced features
 *                                            for link shortening.
 * @return {string} The created short link ID.
 */
module.exports.create = async function createShortLink(longLink, options) {
    let fixedLongLink = validateLongLink(longLink);

    let shortLinkID;

    if (typeof options.customShortLinkID === 'string') {
        await validateCustom(options.customShortLinkID);
        shortLinkID = options.customShortLinkID;
    } else if (!options.isWords) {
        shortLinkID = util.getRandomCharacters();
    } else {
        shortLinkID = util.getRandomWords();
    }

    let docRef = db.collection('shortLinks').doc(shortLinkID);
    let doc;

    try {
        doc = await docRef.get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when shortening the link';
    }

    if (!doc.exists) {
        let shortLinkObject = {
            longLink: fixedLongLink,
            created: new Date(),
            viewCount: 0,
        };

        if (options.expiryDate instanceof Date) {
            if (options.expiryDate <= new Date()) {
                throw 'That expiry date is in the past.';
            }

            shortLinkObject.expiryDate = options.expiryDate;
        }

        if (typeof options.hideStatistics === 'boolean') {
            shortLinkObject.hideStatistics = options.hideStatistics;
        }

        try {
            await docRef.set(shortLinkObject);
        } catch (error) {
            console.error(error);
            throw 'An unexpected error occurred when saving the shortlink.';
        }

        statistics.addLinkCount();

        if (options.customShortLinkID) {
            statistics.addCustomLinkCount();
        }

        return shortLinkID;
    }

    return createShortLink(fixedLongLink, options);
};

/**
 * Adds a view to a short link ID in the database.
 *
 * @param {string} shortLinkID The short link ID to add a view to.
 * @param {string} ipAddress The IP address to use as the viewer.
 */
module.exports.addView = async function addViewToShortLink(
    shortLinkID,
    ipAddress,
) {
    try {
        let docRef = db.collection('shortLinks').doc(shortLinkID);
        await docRef.collection('views').add({
            ipAddress,
            viewed: new Date(),
        });
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when updating the statistics.';
    }
};

/**
 * Returns an array of views for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to return the views for.
 * @return {Array<View>} The array of all views for the short link ID.
 */
module.exports.getViews = async function getViewsForShortLink(shortLinkID) {
    let docRef = db.collection('shortLinks').doc(shortLinkID);

    let doc;

    try {
        doc = await docRef.get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (!doc.exists) {
        throw 'Statistics are unavailable for that link.';
    }

    let data = doc.data();

    if (
        data.hideStatistics === true
            || (data.expiryDate && data.expiryDate.toDate() <= new Date())
    ) {
        throw 'Statistics are unavailable for that link.';
    }

    let snapshot;

    try {
        snapshot = await docRef.collection('views').get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map((viewDoc) => {
        let viewData = viewDoc.data();
        return {
            ...viewData,
            viewed: viewData.viewed.toDate(),
        };
    });
};

/**
 * Returns the creation date for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to return the creation date
 *                             of.
 * @return {Date} When the short link was created.
 */
module.exports.getCreationDate = async function getCreationDateForShortLink(
    shortLinkID,
) {
    let doc;

    try {
        doc = await db.collection('shortLinks').doc(shortLinkID).get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (!doc.exists) {
        throw 'That short link does not exist.';
    }

    return doc.data().created.toDate();
};

/**
 * Validates a custom short link ID.
 *
 * @param {string} customShortLinkID The custom short link ID to validate.
 */
let validateCustom = async function validateCustomShortLinkID(
    customShortLinkID,
) {
    if (!customShortLinkID) {
        throw 'The custom short link cannot be empty.';
    }

    for (
        let i = 0;
        i < settings.reservedCustomShortLinkIDRegExps.length;
        i++
    ) {
        if (
            new RegExp(settings.reservedCustomShortLinkIDRegExps[i])
                .test(customShortLinkID)
        ) {
            throw 'That custom short link is unavailable.';
        }
    }

    if (
        !(new RegExp(settings.customShortLinkIDRegExp)
            .test(customShortLinkID))
    ) {
        throw (
            'Only letters, numbers, underscores, and hyphens can be used in '
                + 'the custom shortlink.'
        );
    }

    let doc = await db.collection('shortLinks').doc(customShortLinkID).get();

    if (doc.exists) {
        throw 'That custom short link is unavailable.';
    }
};

/**
 * Validates a long link.
 *
 * @param {string} longLink The long link to validate.
 * @return {string} A fixed long link to be used in the future. For example, if
 *                  the original link was missing a protocol, the fixed long
 *                  link would include one. It is possible for the fixed long
 *                  link to be the same as the original long link.
 */
let validateLongLink = function validateAndFixLongLink(longLink) {
    if (!urlRegExp({ strict: false }).test(longLink)) {
        throw 'That long link is in an incorrect format.';
    }

    let fixedLongLink;

    if (!(new RegExp(settings.protocolRegExp).test(longLink))) {
        fixedLongLink = 'http://' + longLink;
    } else {
        fixedLongLink = longLink;
    }

    for (let i = 0; i < settings.reservedLongLinkRegExps.length; i++) {
        let reservedRegExp = new RegExp(settings.reservedLongLinkRegExps[i]);
        if (reservedRegExp.test(fixedLongLink)) {
            throw 'That long link cannot be shortened.';
        }
    }

    return fixedLongLink;
};
