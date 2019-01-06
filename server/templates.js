/**
 * A module that contains functions for returning templates.
 *
 * @module templates
 */

let handlebars = require('handlebars');
let fs = require('fs');
let path = require('path');
let settings = require('./config/settings.json');

/**
 * A template to be used for rendering the index page.
 *
 * The template uses the following context:
 *
 *  - `totalViewCount` (number): The total amount of views for all links.
 *  - `totalLinksCount` (string): The total amount of links created.
 *  - `totalCustomLinksCount` (number): The total amount of custom links
 *                                      created.
 *
 * @type {Function}
 */
module.exports.indexTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/index.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering the mobile index page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.mobileTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/mobile.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering a statistics page for a link.
 *
 * The template uses the following context:
 *
 *  - `url` (string): The URL of the link that the statistics are for.
 *  - `downloadURL` (string): A link to download the statistics as JSON.
 *  - `weeklyStatistics` (LabelDataArrayPair): The statistics for weekly views.
 *  - `monthlyStatistics` (LabelDataArrayPair): The statistics for monhtly
 *                                              views.
 *  - `allTimeStatistics` (LabelDataArrayPair): The statistics for all-time
 *                                              views.
 *  - `allTimeMap.points` (Array<MapDataPoint>): The map data points for
 *                                               all-time views.
 *
 * @type {Function}
 */
module.exports.statisticTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/statistic.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering a 404 status page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.status404Template = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/404.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering the JS library documentation page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.jsLibraryDocumentationTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/js-library.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering the web API documentation page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.webAPIDocumentationTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/web-api.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering the Telegram bot documentation
 * page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.telegramBotDocumentationTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/telegram-bot.hbs'),
        { encoding: 'utf-8' },
    ),
);

/**
 * A template that can be used for rendering the Discord bot documentation
 * page.
 *
 * The template uses no context.
 *
 * @type {Function}
 */
module.exports.discordBotDocumentationTemplate = handlebars.compile(
    fs.readFileSync(
        path.resolve(__dirname, '../web/views/discord-bot.hbs'),
        { encoding: 'utf-8' },
    ),
);

module.exports.constants = {
    analyticsKey: settings.analyticsKey,
};
