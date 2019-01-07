let assert = require('assert');
let mock = require('mock-require');
let util = require('./test-util.js')

describe('short-links', () => {
    describe('create', () => {
        it('should fail if it is not a vailid link', async () => {
            util.mockDatabaseDoc();
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create('invalidurl'),
                /^That long link is in an incorrect format\.$/,
            );
        });

        it('should fail if the custom link is invalid', async () => {
            util.mockDatabaseDoc();
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
            util.mockDatabaseDoc();
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
            mock('../server/total-statistics.js', { addLinkCount: () => {} });

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
                (data) => {
                    assert.strictEqual(data.longLink, 'http://example.com');
                    assert.strictEqual(data.viewCount, 0);
                },
            );
            mock('../server/total-statistics.js', { addLinkCount: () => {} });

            let shortLinks = util.require('../server/short-links.js');

            await shortLinks.create('example.com', {});
        });

        it(
            'should add the correct data to the database for custom',
            async () => {
                util.mockDatabaseDocGetSet(
                    { exists: false },
                    (data) => {
                        assert.strictEqual(
                            data.longLink,
                            'http://example.com'
                        );
                        assert.strictEqual(data.viewCount, 0);
                    },
                );
                mock('../server/total-statistics.js', {
                    addLinkCount: () => {},
                    addCustomLinkCount: () => {},
                });

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

        it('should fail if the long link is reserved', async () => {
            mock('../server/config/settings.json', {
                reservedLongLinkRegExps: ['^example.com$']
            });

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create('example.com'),
                /^That long link cannot be shortened\.$/,
            );
        });

        it('should fail if the custom short link is reserved', async () => {
            mock('../server/config/settings.json', {
                reservedLongLinkRegExps: [],
                reservedCustomShortLinkIDRegExps: ['^exampleCustom$']
            });

            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.create('example.com', {
                    customShortLinkID: 'exampleCustom'
                }),
                /^That custom short link is unavailable\.$/,
            );
        });

        it('should retry if the shortlink is taken', async () => {
            mock('../server/database.js', {
                get: () => ({
                    collection: () => ({
                        doc: (name) => ({
                            get: () => {
                                if (name === 'example-untaken') {
                                    return { exists: false };
                                }

                                return { exists: true };
                            },
                            set: () => {
                                assert.equal(name, 'example-untaken');
                            },
                        })
                    })
                })
            });

            let hasTriedOnce = false;
            mock('../server/util.js', {
                getRandomCharacters: () => {
                    if (hasTriedOnce) {
                        return 'example-untaken';
                    }

                    hasTriedOnce = true;
                    return 'example-taken';
                }
            });

            let shortLinks = util.require('../server/short-links.js');
            let shortLinkID = await shortLinks.create('example.com', {});
            assert.equal(shortLinkID, 'example-untaken');
        });

        it('should throw "unexpected" if the database fails', async () => {
            util.mockDatabaseFail('Example error');

            let shortLinks = util.require('../server/short-links.js');
            await assert.rejects(
                shortLinks.create('example.com', {}),
                /^An unexpected error occurred when shortening the link\.$/
            );

            util.mockDatabaseSetFail({ exists: false}, 'Example error');

            shortLinks = util.require('../server/short-links.js');
            await assert.rejects(
                shortLinks.create('example.com', {}),
                /^An unexpected error occurred when saving the shortlink\.$/
            );
        });
    });

    describe('addView', () => {
        it('should update the view count', async () => {
            util.mockDatabaseAdd((data) => {
                assert.equal(data.ipAddress, 'abc');
            });

            let shortLinks = util.require('../server/short-links.js');

            await shortLinks.addView('example', 'abc');
        });

        it('should throw "unexpected" if the database fails', async () => {
            util.mockDatabaseSubFail('Example doc error');

            let shortLinks = util.require('../server/short-links.js');
            await assert.rejects(
                shortLinks.addView('example'),
                /^An unexpected error occurred when updating the statistics\.$/
            );
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

        it('should return an empty array if there are no views', async () => {
            util.mockDatabaseSubGet(
                { exists: true },
                { hideStatistics: false },
                { empty: true },
                []
            );

            let shortLinks = util.require('../server/short-links.js');

            let views = await shortLinks.getViews('example', 'abc');
            assert.equal(views.length, 0);
        });

        it('should throw "unexpected" if the database fails', async () => {
            util.mockDatabaseFail('Example doc error');

            let shortLinks = util.require('../server/short-links.js');
            await assert.rejects(
                shortLinks.getViews('example'),
                /^An unexpected error occurred when getting the statistics\.$/
            );

            util.mockDatabaseSubFail('Example collection error');

            shortLinks = util.require('../server/short-links.js');
            await assert.rejects(
                shortLinks.getViews('example'),
                /^An unexpected error occurred when getting the statistics\.$/
            );
        });

        it('should fail if the statistics do not exist', async () => {
            util.mockDatabaseDoc({ exists: false });
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.getViews('example'),
                /^Statistics are unavailable for that link\.$/
            );
        });
    });

    describe('getCreationDate', () => {
        it('should return the correct creation date', async () => {
            let creationDate = new Date('January 1, 2000');
            util.mockDatabaseDoc(
                { exists: true },
                { created: util.getMockTimestamp(creationDate) },
            );

            let shortLinks = util.require('../server/short-links.js');

            let returnedCreationDate = await shortLinks.getCreationDate('examle');
            assert.equal(returnedCreationDate, creationDate);
        });

        it('should fail if the shortlink does not exist', async () => {
            util.mockDatabaseDoc({ exists: false });
            let shortLinks = util.require('../server/short-links.js');

            assert.rejects(
                shortLinks.getCreationDate('example'),
                /^That short link does not exist\.$/,
            );
        });

        it('should throw "unexpected" if the database fails', async () => {
            util.mockDatabaseFail('Example error');
            let shortLinks = util.require('../server/short-links.js');

            await assert.rejects(
                shortLinks.getCreationDate('example'),
                /^An unexpected error occurred when getting the statistics\.$/
            );
        });
    });
    after(() => {
        util.end();
    });
});
