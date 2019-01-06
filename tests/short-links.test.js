let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js')

describe('short-links', () => {
    describe('create', () => {
        it('should fail if it is not a vailid link', async () => {
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create('invalidurl'),
                /^That long link is in an incorrect format\.$/,
            );
        });

        it('should fail if the custom link is invalid', async () => {
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create(
                    'example.com',
                    { customShortLinkID: '!@#^' },
                ),
                /^Only letters, numbers, underscores, and hyphens can be used in the custom shortlink\.$/,
            );
        });

        it('should fail if the custom link is empty', async () => {
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create(
                    'example.com',
                    { customShortLinkID: '' },
                ),
                /^The custom short link cannot be empty\.$/,
            );
        });

        it('should fail if the custom link is taken', async () => {
            util.mockDatabaseDoc({ exists: true });

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create(
                    'example.com',
                    { customShortLinkID: 'example' },
                ),
                /^That custom short link is unavailable\.$/,
            );
        });

        it('should add the correct data to the database', async () => {
            util.mockDatabaseDocGetSet(
                { exists: false },
                undefined,
                (data) => {
                    assert.strictEqual(data.longLink, 'http://example.com');
                    assert.strictEqual(data.viewCount, 0);
                },
            );

            let shortLinks = util.require('../server/short-links.js');

            await shortLinks.create('example.com', {});
        });

        it(
            'should add the correct data to the database for custom',
            async () => {
                util.mockDatabaseDocGetSet(
                    { exists: false },
                    undefined,
                    (data) => {
                        assert.strictEqual(
                            data.longLink,
                            'http://example.com'
                        );
                        assert.strictEqual(data.viewCount, 0);
                    },
                );

                let shortLinks = util.require('../server/short-links.js');

                await shortLinks.create('example.com', {
                    customShortLinkID: 'test',
                });
            }
        );

        it(
            'should add the correct data to the database for words',
            async () => {
                util.mockDatabaseDocGetSet(
                    { exists: false },
                    undefined,
                    (data) => {
                        assert.strictEqual(
                            data.longLink,
                            'http://example.com'
                        );
                        assert.strictEqual(data.viewCount, 0);
                    },
                );

                let shortLinks = util.require('../server/short-links.js');

                await shortLinks.create('example.com', { isWords: true });
            }
        );

        it('should fail if expiry is in the past', async () => {
            util.mockDatabaseDoc({ exists: false }, undefined);

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create('example.com', {
                    expiryDate: new Date('January 1, 0000'),
                }),
                /^That expiry date is in the past\.$/,
            );
        });

        it(
            'should add the correct data for expiry and hidden stats',
            async () => {
                util.mockDatabaseDocGetSet(
                    { exists: false },
                    undefined,
                    (data) => {
                        assert.strictEqual(
                            data.longLink,
                            'http://example.com'
                        );
                        assert.strictEqual(data.viewCount, 0);
                        assert.strictEqual(
                            data.expiryDate.getTime(),
                            new Date('January 1, 3000').getTime(),
                        );
                        assert.strictEqual(data.hideStatistics, true);
                    }
                );

                let shortLinks = util.require('../server/short-links.js');

                await shortLinks.create('example.com', {
                    expiryDate: new Date('January 1, 3000'),
                    hideStatistics: true,
                });
            }
        );
    });

    describe('addView', () => {
        it('should update the view count', async () => {
            util.mockDatabaseAdd((data) => {
                assert.equal(data.ipAddress, 'abc');
            });

            let shortLinks = util.require('../server/short-links.js');

            await shortLinks.addView('example', 'abc');
        });
    });

    describe('getViews', () => {
        it('should return the view count', async () => {
            util.mockDatabaseSubGet(
                { exists: true },
                { hideStatistics: false },
                { empty: false },
                [
                    {
                        ipAddress: 'abc',
                        viewed: util.getMockTimestamp(new Date()),
                    },
                    {
                        ipAddress: 'def',
                        viewed: util.getMockTimestamp(new Date()),
                    }
                ],
            );

            let shortLinks = util.require('../server/short-links.js');

            let views = await shortLinks.getViews('example', 'abc');
            assert.equal(views.length, 2);
            assert.equal(views[0].ipAddress, 'abc');
            assert.equal(views[1].ipAddress, 'def');
        });

        it('should fail if statistics are off', async () => {
            util.mockDatabaseDoc(
                { exists: true },
                { hideStatistics: true },
            );

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.getViews('example', 'abc'),
                /^Statistics are unavailable for that link\.$/,
            )
        });

        it('should fail if the link expired', async () => {
            util.mockDatabaseDoc(
                { exists: true },
                {
                    expiryDate: util.getMockTimestamp(
                        new Date("January 1, 2000")
                    ),
                },
            );

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.getViews('example', 'abc'),
                /^Statistics are unavailable for that link\.$/,
            )
        });
    });

    after(() => {
        util.end();
    });
});
