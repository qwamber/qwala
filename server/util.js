/**
 * A module that contains utility functions.
 *
 * @module util
 */

let _ = require('lodash');
let settings = require('./config/settings.json');

/**
 * Returns the Unix timestamp in seconds of a date.
 *
 * @param {Date} date The date to convert.
 * @return {number} The Unix timestamp.
 */
module.exports.getDateAsEpoch = function convertDateToUnixEpochSeconds(date) {
    return Math.round(date.getTime() / 1000);
};

/**
 * Returns a `Date` object of a Unix timestamp in seconds.
 *
 * @param {number} timestamp The Unix timestamp to convert.
 * @return {Date} The `Date` objetc.
 */
module.exports.getEpochAsDate = function convertUnixEpochSecondsToDate(
    timestamp,
) {
    return new Date(timestamp * 1000);
};

/**
 * Returns the number of whole days between two dates.
 *
 * @param {Date} day1 The first date.
 * @param {Date} day2 The second date. If this date comes before `date1`, the
 *                    value will be negative.
 * @return {number} The number of days between these dates.
 */
module.exports.getDateDifference = function getDaysBetweenDays(day1, day2) {
    let day1Copy = new Date(day1.getTime());
    day1Copy.setHours(0, 0, 0, 0);
    let day2Copy = new Date(day2.getTime());
    day2Copy.setHours(0, 0, 0, 0);

    return Math.round(
        (day2Copy.getTime() - day1Copy.getTime()) / (24 * 60 * 60 * 1000),
    );
};

/**
 * Returns a string of random characters of a configured length.
 *
 * @return {string} The string of random characters.
 */
module.exports.getRandomCharacters = function getRandomAlphanumericCharacters(
) {
    let currentOutput = '';

    for (let i = 0; i < settings.shortLinkCharactersLength; i++) {
        if (i % 2 === 0) {
            currentOutput += _.sample(settings.shortLinkUnambiguousLetters);
        } else {
            currentOutput += _.sample(settings.shortLinkUnambiguousDigits);
        }
    }

    return currentOutput;
};

/**
 * Returns a string of random words from a configured list.
 *
 * @return {string} The string of random words.
 */
module.exports.getRandomWords = function getRandomHyphenatedWords() {
    let currentRandomWords = [];

    // There are essentially 3 viable word orders (ANV, AVN, and VAN),
    // so a number from 0-2 can be picked, and then the words can be made based
    // on that number.
    let type = _.random(0, 2);

    if (type === 0) {
        currentRandomWords.push(_.sample(settings.shortLinkAdjectives));
        currentRandomWords.push(_.sample(settings.shortLinkNouns));
        currentRandomWords.push(_.sample(settings.shortLinkVerbs));
    } else if (type === 1) {
        currentRandomWords.push(_.sample(settings.shortLinkAdjectives));
        currentRandomWords.push(_.sample(settings.shortLinkVerbs));
        currentRandomWords.push(_.sample(settings.shortLinkNouns));
    } else {
        currentRandomWords.push(_.sample(settings.shortLinkVerbs));
        currentRandomWords.push(_.sample(settings.shortLinkAdjectives));
        currentRandomWords.push(_.sample(settings.shortLinkNouns));
    }

    return currentRandomWords.join('-');
};

/**
 * Prints the current memory usage for the server.
 */
module.exports.printMemory = function printCurrentMemoryInformation() {
    let usage = process.memoryUsage();
    console.log(
        'Current memory usage:\n'
            + ' - Resident Set Size   '
            + (usage.rss / 1024 / 1024) + ' MiB\n'
            + ' - Heap Total          '
            + (usage.heapTotal / 1024 / 1024) + ' MiB\n'
            + ' - Heap Used           '
            + (usage.heapUsed / 1024 / 1024) + ' MiB\n',
    );
};
