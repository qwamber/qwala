/**
 * A module that contains functions for managing link statistics.
 *
 * @module link-statistics
 */

let ipLocation = require('iplocation').default;
let shortLinks = require('./short-links.js');
let util = require('./util.js');

/**
 * Returns statistics for this week (the last 7 days) for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to find statistics for.
 * @return {LabelDataArrayPair} The statistics for weekly views.
 */
let getWeekly = async function getWeeklyStatistics(shortLinkID) {
    let weekAgo = new Date();
    weekAgo.setHours(0, 0, 0, 0);
    weekAgo.setDate(weekAgo.getDate() - 6);

    let views = await shortLinks.getViews(shortLinkID);
    let weeklyViews = views.filter((view) => {
        return weekAgo <= view.viewed;
    });

    let labels = getWeekLabels(weekAgo);
    let data = getDataArray(weeklyViews, weekAgo);

    return { labels, data };
};

/**
 * Returns statistics for this month (the last 31 days) for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to find statistics for.
 * @return {LabelDataArrayPair} The statistics for monthly views.
 */
let getMonthly = async function getMonthlyStatistics(shortLinkID) {
    let monthAgo = new Date();
    monthAgo.setHours(0, 0, 0, 0);
    monthAgo.setDate(monthAgo.getDate() - 30);

    let views = await shortLinks.getViews(shortLinkID);
    let monthlyViews = views.filter((view) => {
        return monthAgo <= view.viewed;
    });

    let labels = getLabelsSinceDate(monthAgo);
    let data = getDataArray(monthlyViews, monthAgo);

    return { labels, data };
};

/**
 * Returns statistics for all time for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to find statistics for.
 * @return {LabelDataArrayPair} The statistics for all time.
 */
let getAll = async function getAllStatistics(shortLinkID) {
    let views = await shortLinks.getViews(shortLinkID);
    let creationDate = await shortLinks.getCreationDate(shortLinkID);

    let labels = getLabelsSinceDate(creationDate);
    let data = getDataArray(views, creationDate);

    return { labels, data };
};

/**
 * Returns a map of views for all time for a short link ID.
 *
 * @param {string} shortLinkID The short link ID to find the map for.
 * @return {Array<MapDataPoint>} An array of map points to use for the map.
 */
let getMap = async function getAllStatistics(shortLinkID) {
    let views = await shortLinks.getViews(shortLinkID);
    return getMapArray(views);
};

/**
 * Returns an array containing values for the functions `getWeekly`,
 * `getMonthly`, `getAll`, and `getMap`.
 *
 * @param {string} shortLinkID The short link ID to find the statistics and map
 *                             for.
 * @return {LinkStatisticsSummary} The array containing the values.
 */
module.exports.getEach = async function getEachStatisticArray(shortLinkID) {
    return Promise.all([
        getWeekly(shortLinkID),
        getMonthly(shortLinkID),
        getAll(shortLinkID),
        getMap(shortLinkID),
    ]);
};

/**
 * Returns a list of labels for weekly statistics.
 *
 * @param {Date} startDate The date that the week starts on.
 * @return {Array<string>} An array of strings representing labels for each day
 *                         of the week.
 */
let getWeekLabels = function getWeekLabelsForIndex(startDate) {
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let startSlice = days.slice(startDate.getDay());
    let endSlice = days.slice(0, startDate.getDay());
    return startSlice.concat(endSlice);
};

/**
 * Returns a list of labels for the days since a specified day.
 *
 * @param {Date} startDate The date to use as the starting label.
 * @return {Array<string>} An array of labels for each day until today, where
 *                         index 0 corresponds with `startDate`.
 */
let getLabelsSinceDate = function getDateLabelsSinceDate(startDate) {
    let currentDates = [];
    let todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; true; i++) {
        let currentDate = new Date(startDate.getTime());
        currentDate.setDate(currentDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        currentDates.push(getDateString(currentDate));

        if (todayDate <= currentDate) {
            return currentDates;
        }
    }
};

/**
 * Returns a map of views for all time for an array of views.
 *
 * @param {Array<View>} views The views to use to construct the map.
 * @return {Array<MapDataPoint>} An array of map points to use for the map.
 */
let getMapArray = async function getLatitudeLongitudeArray(views) {
    let points = await Promise.all(
        views.map(async (view) => {
            // `iplocation` seems to have a bug where return data is empty, but
            // this can be solved by using only one of its default providers.
            // See https://git.io/fh3hm.
            let ipProviders = [
                'https://ipinfo.io/*',
            ];

            let lookup = await new Promise((resolve) => {
                ipLocation(view.ipAddress, ipProviders, (error, response) => {
                    if (error) {
                        resolve({});
                        return;
                    }

                    resolve(response);
                });
            });

            // `iplocation` returns `null` if the location is unavailable.
            // See https://git.io/fhG6s.
            if (
                !lookup
                    || lookup.latitude === null
                    || lookup.longitude === null
            ) {
                return null;
            }

            return {
                latitude: lookup.latitude,
                longitude: lookup.longitude,
                title: getDateString(view.viewed),
            };
        }),
    );

    return points.filter((point) => {
        return point !== null;
    });
};

/**
 * Returns a data array for an array of views given a start date.
 *
 * @param {Array<View>} views An array of views for a link.
 * @param {Date} startDate The date to start with in the data array. All views
 *                         before this date are ignored.
 * @return {Array<number>} An array containing numbers representing the number
 *                         of views for each day, where index 0 corresponds
 *                         with `startDate`.
 */
let getDataArray = function getDataArrayForViews(views, startDate) {
    // `dataLength` is the number of data points (i.e. days) to be shown.
    // E.g., for a month this would be 31, and for a week this would be 7.
    let dataLength = util.getDateDifference(startDate, new Date()) + 1;
    let currentData = new Array(dataLength).fill(0);

    for (let i = 0; i < views.length; i++) {
        // The data index is the location in the data array, which is
        // essentially the difference between the day index for this one view
        // and the starting day.
        let dataDayIndex = util.getDateDifference(startDate, views[i].viewed);

        currentData[dataDayIndex]++;
    }

    return currentData;
};

/**
 * Returns a string representation of a date, in the form "<month>_<date>", for
 * a `LabelDataArrayPair`.
 *
 * @param {Date} date The date to return a string for.
 * @return {string} The string representation.
 */
let getDateString = function getDateAndMonthString(date) {
    let months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec',
    ];
    return months[date.getMonth()] + '_' + date.getDate();
};
