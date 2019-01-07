let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js')

describe('short-links', () => {
    describe('addView', () => {
        it('should not fail if the count exists', async () => {
            util.mockDatabaseTransaction(
                { exists: true, data: () => ({}) },
                () => {},
                () => {},
                (data) => {
                    assert.equal(data.shortLinkID, 'example');
                    assert.equal(data.ipAddress, 'abc');
                },
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addView('example', 'abc')
        });

        it('should not fail if the count does not exist', async () => {
            util.mockDatabaseTransaction(
                { exists: false, data: () => ({}) },
                () => {},
                () => {},
                (data) => {
                    assert.equal(data.shortLinkID, 'example');
                    assert.equal(data.ipAddress, 'abc');
                },
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addView('example', 'abc')
        });

        it('should throw "unexpected" if the database fails', async () => {
            util.mockDatabaseSubFail('Example error');

            let totalStatistics = util.require('../server/total-statistics');
            await assert.rejects(
                totalStatistics.addView('example'),
                /^An unexpected error occurred when updating the statistics\.$/
            );
        });
    });

    describe('addLinkCount', () => {
        it('should not fail if the count exists', async () => {
            util.mockDatabaseTransaction(
                { exists: true, data: () => ({}) },
                () => {},
                () => {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addLinkCount('example', 'abc')
        });

        it('should not fail if the count does not exist', async () => {
            util.mockDatabaseTransaction(
                { exists: false, data: () => ({}) },
                () => {},
                () => {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addLinkCount('example', 'abc')
        });
    });

    describe('addCustomLinkCount', () => {
        it('should not fail if the count exists', async () => {
            util.mockDatabaseTransaction(
                { exists: true, data: () => ({}) },
                () => {},
                () => {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addCustomLinkCount('example', 'abc')
        });

        it('should not fail if the count does not exist', async () => {
            util.mockDatabaseTransaction(
                { exists: false, data: () => ({}) },
                () => {},
                () => {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await totalStatistics.addCustomLinkCount('example', 'abc')
        });
    });

    describe('getAll', () => {
        it('should return all statistics', async () => {
            util.mockDatabaseDoc(
                { exists: true, data: () => ({}) },
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

        it('should should not fail if values are empty', async () => {
            util.mockDatabaseDoc(
                { exists: true, data: () => ({}) },
                {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await assert.doesNotReject(totalStatistics.getAll('example', 'abc'));
        });

        it('should should not fail if values do not exist', async () => {
            util.mockDatabaseDoc(
                { exists: false },
                {},
            );

            let totalStatistics = util.require('../server/total-statistics');
            await assert.doesNotReject(totalStatistics.getAll('example', 'abc'));
        });

        it('should should not fail if the database fails', async () => {
            util.mockDatabaseFail('Example error');

            let totalStatistics = util.require('../server/total-statistics');
            await assert.doesNotReject(totalStatistics.getAll('example', 'abc'));
        });
    });

    after(() => {
        util.end();
    });
});
