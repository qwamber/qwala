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
    set
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    get: () => ({
                        ...doc,
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

module.exports.mockDatabaseFail = function mockDatabaseDocGetFail(
    errorMessage,
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    get: () => {
                        throw errorMessage;
                    },
                }),
            }),
        }),
    });
};

module.exports.mockDatabaseSetFail = function mockDatabaseDocSetFail(
    doc,
    errorMessage,
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    get: () => doc,
                    set: () => {
                        throw errorMessage;
                    },
                }),
            }),
        }),
    });
};

module.exports.mockDatabaseSubFail = function mockDatabaseCollectionFail(
    errorMessage,
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    collection: () => ({
                        get: () => {
                            throw errorMessage;
                        },
                        add: () => {
                            throw errorMessage;
                        },
                    }),
                    get: () => ({
                        exists: true,
                        data: () => ({}),
                    }),
                }),
            }),
        }),
    });
};

module.exports.mockDatabaseTransaction = function mockDatabaseRunTransaction(
    doc,
    set,
    update,
    collectionAdd
) {
    mock('../server/database.js', {
        get: () => ({
            collection: () => ({
                doc: () => ({
                    exists: true,
                    collection: () => ({
                        add: collectionAdd,
                    }),
                }),
            }),
            runTransaction: (transactionFunction) => {
                transactionFunction({
                    set,
                    get: () => doc,
                    update
                });
            },
        }),
    });
}

module.exports.getMockTimestamp = function getMockTimestampForDate(date) {
    return { toDate: () => date };
};

module.exports.require = function requireModuleName(moduleName) {
    return mock.reRequire(moduleName);
};

module.exports.end = function endAllMocks() {
    mock.stopAll();
};
