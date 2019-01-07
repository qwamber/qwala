let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js');
let linkStatistics;

describe('link-statistics', () => {
    before(() => {
        let date0 = new Date();
        let date1 = new Date();
        date1.setDate(date0.getDate() - 3);
        let date2 = new Date();
        date2.setDate(date0.getDate() - 8);
        let date3 = new Date();
        date3.setDate(date0.getDate() - 50);
        let date4 = new Date();
        date4.setDate(date0.getDate() - 100);
        let date5 = new Date();
        date5.setDate(date0.getDate() - 100);

        mock('../server/short-links.js', {
            getViews: () => {
                return [
                    { ipAddress: 'abc', viewed: date0 },
                    { ipAddress: 'def', viewed: date1 },
                    { ipAddress: 'ghi', viewed: date2 },
                    { ipAddress: 'jkl', viewed: date3 },
                    { ipAddress: 'mno', viewed: date4 },
                    { ipAddress: 'pqr', viewed: date5 },
                ];
            },
            getCreationDate: () => {
                return date5;
            },
        });

        mock('iplocation', {
            default: (ipAddress, providers, callback) => {
                callback(
                    undefined,
                    {
                        latitude: 50,
                        longitude: 100,
                    },
                );
            },
        });

        linkStatistics = util.require('../server/link-statistics.js');
    });

    describe('getEach', () => {
        it('should return weekly statistics at index 0', async () => {
            let eachStatistic = await linkStatistics.getEach();
            let weeklyStatistics = eachStatistic[0];

            assert.strictEqual(weeklyStatistics.labels.length, 7);

            for (let i = 0; i < weeklyStatistics.data.length; i++) {
                if (i === 3 || i === 6) {
                    assert.strictEqual(weeklyStatistics.data[i], 1);
                    continue;
                }

                assert.strictEqual(weeklyStatistics.data[0], 0);
            }
        });

        it('should return monthly statistics at index 1', async () => {
            let eachStatistic = await linkStatistics.getEach();
            let monthlyStatistics = eachStatistic[1];

            assert.strictEqual(monthlyStatistics.labels.length, 31);

            for (let i = 0; i < monthlyStatistics.data.length; i++) {
                if (i == 22 || i === 27 || i === 30) {
                    assert.strictEqual(monthlyStatistics.data[i], 1);
                    continue;
                }

                assert.strictEqual(monthlyStatistics.data[0], 0);
            }
        });

        it('should return all-time statistics at index 2', async () => {
            let eachStatistic = await linkStatistics.getEach();
            let allTimeStatistics = eachStatistic[2];

            assert.strictEqual(allTimeStatistics.labels.length, 101);

            for (let i = 0; i < allTimeStatistics.data.length; i++) {
                if (i === 50 || i == 92 || i === 97 || i === 100) {
                    assert.strictEqual(allTimeStatistics.data[i], 1);
                    continue;
                }

                if (i === 0) {
                    assert.strictEqual(allTimeStatistics.data[i], 2);
                    continue;
                }

                assert.strictEqual(allTimeStatistics.data[i], 0);
            }
        });

        it('should return the all-time map at index 3', async () => {
            let eachStatistic = await linkStatistics.getEach();
            let allTimeMap = eachStatistic[3];

            assert.strictEqual(allTimeMap.length, 6);

            for (let i = 0; i < allTimeMap.length; i++) {
                assert.strictEqual(allTimeMap[i].latitude, 50);
                assert.strictEqual(allTimeMap[i].longitude, 100);
            }
        });

        it ('should not fail if no location is found', async () => {
            mock('iplocation', {
                default: (ipAddress, providers, callback) => {
                    callback('Example error');
                },
            });

            linkStatistics = util.require('../server/link-statistics.js');

            await assert.doesNotReject(linkStatistics.getEach());
        });

        it ('should not include an empty point', async () => {
            mock('iplocation', {
                default: (ipAddress, providers, callback) => {
                    if (ipAddress === 'abc' || ipAddress === 'def') {
                        callback(
                            undefined,
                            { latitude: null, longitude: null },
                        );
                        return;
                    }

                    callback(undefined, { latitude: 1, longitude: 2 });
                },
            });

            linkStatistics = util.require('../server/link-statistics.js');

            let eachStatistic = await linkStatistics.getEach();
            let mapPoints = eachStatistic[3]
            assert.strictEqual(mapPoints.length, 4);
        });
    });

    after(() => {
        util.end();
    });
});
