let express = require('express');
let bodyParser = require('body-parser');
let serveFavicon = require('serve-favicon');
let requestIP = require('request-ip');
let path = require('path');

let templates = require('./templates.js');
let shortLinks = require('./short-links.js');
let longLinks = require('./long-links.js');
let totalStatistics = require('./total-statistics.js');
let linkStatistics = require('./link-statistics.js');
let util = require('./util.js');

let app = express();

app.use(bodyParser.json());
app.use(serveFavicon(path.join(
    __dirname, '../web/static/res/koala-favicon.ico',
)));
app.use('/static', express.static(path.join(__dirname, '../web/static/')));

app.get('/', async (req, res) => {
    if (req.subdomains.length > 0 && req.subdomains[0] === 'mobile') {
        res.send(templates.mobileTemplate(templates.constants));
        return;
    }

    let statisticCounts = await totalStatistics.getAll();
    res.send(templates.indexTemplate({
        ...templates.constants,
        ...statisticCounts,
    }));
});

app.get('/web-api', async (req, res) => {
    res.send(templates.webAPIDocumentationTemplate(templates.constants));
});

app.get('/js-library', async (req, res) => {
    res.send(templates.jsLibraryDocumentationTemplate(templates.constants));
});

app.get('/telegram-bot', async (req, res) => {
    res.send(templates.telegramBotDocumentationTemplate(templates.constants));
});

app.get('/discord-bot', async (req, res) => {
    res.send(templates.discordBotDocumentationTemplate(templates.constants));
});

app.post('/api/shorten', async (req, res) => {
    let longLink = req.body.longLink;
    let isWords = req.body.isWords;
    let hideStatistics = req.body.hideStatistics;
    let expiryDate = (
        req.body.expiryDate
            ? util.getEpochAsDate(req.body.expiryDate)
            : undefined
    );
    let customShortLinkID = (
        req.body.customShortLinkID
            ? req.body.customShortLinkID.toLowerCase()
            : undefined
    );

    let shortLinkID;

    try {
        shortLinkID = await shortLinks.create(longLink, {
            isWords,
            expiryDate,
            hideStatistics,
            customShortLinkID,
        });
    } catch (error) {
        res.status(300).send({ error });
        return;
    }

    res.send({ shortLinkID });
});

app.get('/api/lengthen', async (req, res) => {
    let shortLinkID = req.query.shortLinkID.toLowerCase();

    let longLink;

    try {
        longLink = await longLinks.get(shortLinkID);
    } catch (error) {
        res.status(300).send({ error });
        return;
    }

    res.send({ longLink });
});

app.get('/api/statistics', async (req, res) => {
    let shortLinkID = req.query.shortLinkID.toLowerCase();

    let views;

    try {
        views = await shortLinks.getViews(shortLinkID);
    } catch (error) {
        res.status(300).send({ error });
        return;
    }

    let convertedViews = views.map((view) => {
        return {
            ...view,
            viewed: util.getDateAsEpoch(view.viewed),
        };
    });

    res.send({ views: convertedViews });
});

app.get(/@.+/, async (req, res) => {
    let shortLinkID = req.path.substring(2).toLowerCase();

    let statisticValues;

    try {
        statisticValues = await linkStatistics.getEach(shortLinkID);
    } catch (error) {
        console.error(error);
        res.send(templates.status404Template(templates.constants));
        return;
    }

    res.send(templates.statisticTemplate({
        ...templates.constants,
        url: 'qwa.la/' + shortLinkID,
        downloadURL: 'qwa.la/+' + shortLinkID,
        weeklyStatistics: {
            labels: JSON.stringify(statisticValues[0].labels),
            data: JSON.stringify(statisticValues[0].data),
        },
        monthlyStatistics: {
            labels: JSON.stringify(statisticValues[1].labels),
            data: JSON.stringify(statisticValues[1].data),
        },
        allTimeStatistics: {
            labels: JSON.stringify(statisticValues[2].labels),
            data: JSON.stringify(statisticValues[2].data),
        },
        allTimeMap: {
            points: JSON.stringify(statisticValues[3]),
        },
    }));
});

app.get(/\+.+/, async (req, res) => {
    let shortLinkID = req.path.substring(2).toLowerCase();

    let views;

    try {
        views = await shortLinks.getViews(shortLinkID);
    } catch (error) {
        console.error(error);
        res.send(templates.status404Template(templates.constants));
        return;
    }

    let convertedViews = views.map((view) => {
        return {
            ...view,
            viewed: view.viewed.toString(),
        };
    });

    res.set({
        'content-disposition': 'attachment; filename=views.json',
        'content-type': 'application/json',
    });
    res.send(convertedViews);
});


app.get(/.+/, async (req, res) => {
    let shortLinkID = req.path.substring(1).toLowerCase();

    let longLink;

    try {
        longLink = await longLinks.get(shortLinkID);
    } catch (error) {
        res.send(templates.status404Template(templates.constants));
        return;
    }

    res.redirect(longLink);

    try {
        shortLinks.addView(shortLinkID, requestIP.getClientIp(req));
        totalStatistics.addView(shortLinkID, requestIP.getClientIp(req));
    } catch (error) {
        console.error(error);
    }
});

let port = process.env.PORT || 8080;
app.listen(port, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Listening on port ' + port + '.');
    }
});

util.printMemory();
