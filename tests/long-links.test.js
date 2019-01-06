let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js');

describe('long-links', () => {
    describe('get', () => {
        it('should fail if the link does not exist', async () => {
            util.mockDatabaseDoc({ exists: false });
            let longLinks = util.require('../server/long-links.js');

            await assert.rejects(
                longLinks.get('example'),
                /^That short link does not exist or has expired\.$/,
            );
        });

        it('should fail if the link has expired', async () => {
            let expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() - 100);

            util.mockDatabaseDoc(
                { exists: true },
                { expiryDate: util.getMockTimestamp(expiryDate) },
            );

            let longLinks = util.require('../server/long-links.js');

            await assert.rejects(
                longLinks.get('example'),
                /^That short link does not exist or has expired\.$/,
            );
        });

        it('should return the long link if successful', async () => {
            util.mockDatabaseDoc(
                { exists: true },
                { longLink: 'example.com' },
            );

            let longLinks = util.require('../server/long-links.js');
            let longLink = await longLinks.get('example');

            assert.strictEqual(
                longLink,
                'example.com',
            );
        });
    });

    after(() => {
        util.end();
    });
});
