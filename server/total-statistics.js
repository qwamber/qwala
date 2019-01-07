/**
 * A module that contains functions for managing total statistics.
 *
 * @module total-statistics
 */

let db = require('./database.js').get();
let settings = require('./config/settings.json');

/**
 * Adds a view to the list of total views in the database.
 *
 * @param {string} shortLinkID The short link ID to add the view for.
 * @param {string} ipAddress The IP address to use as the viewer.
 */
module.exports.addView = async function addToTotalViews(
    shortLinkID,
    ipAddress,
) {
    try {
        let docRef = db.collection('statistics').doc('totalViews');
        await docRef.collection('totalViews').add({
            shortLinkID,
            ipAddress,
            viewed: new Date(),
        });
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when updating the statistics.';
    }

    let totalViewsRef = db.collection('statistics').doc('totalViews');

    await db.runTransaction(async (transaction) => {
        let doc = await transaction.get(totalViewsRef);

        if (!doc.exists) {
            transaction.set(totalViewsRef, {
                totalViewCount: 1,
            });
            return;
        }

        transaction.update(totalViewsRef, {
            totalViewCount: (doc.data().totalViewCount || 0) + 1,
        });
    });
};

/**
 * Adds to the total link count in the database.
 */
module.exports.addLinkCount = async function addToTotalLinksCount() {
    let linksRef = db.collection('statistics').doc('links');

    await db.runTransaction(async (transaction) => {
        let doc = await transaction.get(linksRef);

        if (!doc.exists) {
            transaction.set(linksRef, {
                totalLinksCount: 1,
            });
            return;
        }

        transaction.update(linksRef, {
            totalLinksCount: (doc.data().totalLinksCount || 0) + 1,
        });
    });
};

/**
 * Adds to the total custom link count in the database.
 */
module.exports.addCustomLinkCount = async function addToTotalCustomLinksCount(
) {
    let linksRef = db.collection('statistics').doc('links');

    await db.runTransaction(async (transaction) => {
        let doc = await transaction.get(linksRef);

        if (!doc.exists) {
            transaction.set(linksRef, {
                totalCustomLinksCount: 1,
            });
            return;
        }

        transaction.update(linksRef, {
            totalCustomLinksCount: (doc.data().totalCustomLinksCount || 0) + 1,
        });
    });
};

/**
 * Returns the total view count for all links.
 *
 * @return {number} The total view count.
 */
let getTotalViewCount = async function getTotalViewCountStatistic() {
    let doc;

    try {
        doc = await db.collection('statistics').doc('totalViews').get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (!doc.exists) {
        throw 'No statistics are available at this time.';
    }

    return doc.data().totalViewCount;
};

/**
 * Returns the total link count of all links created.
 *
 * @return {number} The total link count.
 */
let getTotalLinksCount = async function getTotalViewCountStatistic() {
    let doc;

    try {
        doc = await db.collection('statistics').doc('links').get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (!doc.exists) {
        throw 'No statistics are available at this time.';
    }

    return doc.data().totalLinksCount;
};

/**
 * Returns the total custom link count of all custom links created.
 *
 * @return {number} The total custom link count.
 */
let getTotalCustomLinksCount = async function getTotalViewCountStatistic() {
    let doc;

    try {
        doc = await db.collection('statistics').doc('links').get();
    } catch (error) {
        console.error(error);
        throw 'An unexpected error occurred when getting the statistics.';
    }

    if (!doc.exists) {
        throw 'No statistics are available at this time.';
    }

    return doc.data().totalCustomLinksCount;
};

/**
 * Returns an object containing values for the functions `getTotalViewCount`,
 * `getTotalLinksCount`, and `getTotalCustomLinksCount`. If any of these values
 * are unavailable, the configured default value is returned instead.
 *
 * @return {TotalStatisticsSummary} The object containing the values
 */
module.exports.getAll = async function getAllStatistics() {
    let counts = await Promise.all([
        getTotalViewCount().catch((error) => {
            console.error(error);
            return settings.defaultTotalViewCount;
        }),
        getTotalLinksCount().catch((error) => {
            console.error(error);
            return settings.defaultTotalLinksCount;
        }),
        getTotalCustomLinksCount().catch((error) => {
            console.error(error);
            return settings.defaultTotalCustomLinksCount;
        }),
    ]);

    // If the statistic is less than the provided default value, then something
    // likely went wrong when fetching the data. In this case, just return the
    // default value.
    let totalViewCount = Math.max(counts[0], settings.defaultTotalViewCount);
    let totalLinksCount = Math.max(counts[1], settings.defaultTotalLinksCount);
    let totalCustomLinksCount = Math.max(
        counts[2],
        settings.defaultTotalCustomLinksCount,
    );

    return { totalViewCount, totalLinksCount, totalCustomLinksCount };
};
