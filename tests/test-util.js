let mock = require('mock-require');

module.exports.mockDatabaseDoc = function mockDatabaseDocAndData(doc, data) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    get: () => ({
                        ...doc,
                        data: () => data,
                    }),
                }),
            }),
            runTransaction: () => {},
        }),
    });
};

module.exports.mockDatabaseDocGetSet = function mockDatabaseDocGetAndSetMethod(
    doc,
    data,
    set
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    get: () => ({
                        ...doc,
                        data: () => data,
                    }),
                    set,
                }),
            }),
            runTransaction: () => {},
        }),
    });
};

module.exports.mockDatabaseAdd = function mockDatabaseDocSubcollectionAdd(
    add,
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    collection: () => ({ add }),
                }),
            }),
            runTransaction: () => {},
        }),
    });
};

module.exports.mockDatabaseSubGet = function mockDatabaseSubcollectionGet(
    doc,
    data,
    collection,
    docs,
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    collection: () => ({
                        get: () => ({
                            ...collection,
                            docs: docs.map((doc) => {
                                return { data: () => doc };
                            }),
                        }),
                    }),
                    get: () => ({
                        ...doc,
                        data: () => data,
                    }),
                    runTransaction: () => {},
                }),
            }),
            runTransaction: () => {},
        }),
    });
};

module.exports.getMockTimestamp = function getMockTimestampForDate(date) {
    return { toDate: () => date };
};

module.exports.require = function requireModuleName(moduleName) {
    return mock.reRequire(moduleName);
};

module.exports.end = function endAllMocks() {
    mock.stopAll();
};
