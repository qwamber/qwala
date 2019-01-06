let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js')

describe('short-links', () => {
    describe('addView', () => {
        it('should add the correct data', async () => {
            util.mockDatabaseAdd((data) => {
                assert.equal(data.shortLinkID, 'example');
                assert.equal(data.ipAddress, 'abc');
            });

            let totalStatistics = util.require('../server/total-statistics');

            await totalStatistics.addView('example', 'abc')
        });
    });

    describe('addLinkCount', () => {
        it('should not fail', async () => {
            util.mockDatabaseAdd();
            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addLinkCount('example', 'abc')
        });
    });

    describe('addCustomLinkCount', () => {
        it('should not fail', async () => {
            util.mockDatabaseAdd();
            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addCustomLinkCount('example', 'abc')
        });
    });

    describe('getAll', () => {
        it('should return all statistics', async () => {
            util.mockDatabaseDoc(
                { exists: true },
                {
                    totalViewCount: 3000,
                    totalLinksCount: 2000,
                    totalCustomLinksCount: 1000,
                },
            );

            let totalStatistics = util.require('../server/total-statistics');
            let allStatistics = await totalStatistics.getAll('example', 'abc');

            assert.equal(allStatistics.totalViewCount, 3000);
            assert.equal(allStatistics.totalLinksCount, 2000);
            assert.equal(allStatistics.totalCustomLinksCount, 1000);
        });

        it('should should not fail if values are unavailable', async () => {
            util.mockDatabaseDoc(
                { exists: true },
                {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await assert.doesNotReject(totalStatistics.getAll('example', 'abc'));
        });
    });

    after(() => {
        util.end();
    });
});
