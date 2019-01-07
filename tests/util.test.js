let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js')

describe('short-links', () => {
    describe('getDateAsEpoch', () => {
        it('should return the correct timestamp', async () => {
            let utilModule = util.require('../server/util.js');
            let timestamp = utilModule.getDateAsEpoch(new Date("January 1, 2000"));
            assert.equal(timestamp, 946713600);
        });
    });

    describe('getEpochAsDate', () => {
        it('should return the correct date', async () => {
            let utilModule = util.require('../server/util.js');
            let date = utilModule.getEpochAsDate(946713600);
            assert.equal(date.getTime(), new Date("January 1, 2000").getTime());
        });
    });

    describe('getDateDifference', () => {
        it('should return the correct difference', async () => {
            let utilModule = util.require('../server/util.js');
            let difference = utilModule.getDateDifference(
                new Date("January 1, 2000"),
                new Date("June 23, 2005"),
            );
            assert.equal(difference, 2000);
        });
    });

    describe('getRandomCharacters', () => {
        it('should match a regular expression', async () => {
            let utilModule = util.require('../server/util.js');
            let randomCharacters = utilModule.getRandomCharacters();
            assert(/^([a-z][0-9]){3}$/.test(randomCharacters));
        });
    });

    describe('getRandomWords', () => {
        it('should match a regular expression', async () => {
            for (let i = 0; i < 3; i++) {
                let originalLodash = require('lodash');

                mock('lodash', {
                    random: () => i,
                    sample: originalLodash.sample,
                });

                let utilModule = util.require('../server/util.js');
                let randomWords = utilModule.getRandomWords();
                assert(/^([a-z]+\-){2}[a-z]+$/.test(randomWords));
            }
        });
    });

    describe('printMemory', () => {
        it('should not fail', () => {
            let utilModule = util.require('../server/util.js');
            assert.doesNotThrow(utilModule.printMemory);
        })
    });

    after(() => {
        util.end();
    });
});
