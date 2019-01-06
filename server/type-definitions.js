/**
 * An object representing a time that a short link was opened.
 *
 * @typedef {Object<string, *>} View
 * @property {string} ipAddress The IP address that viewed the link.
 * @property {Date} viewed The time that the link was viewed.
 */

/**
 * A set of labels and data values for use in a Chart.js graph. Note that
 * spaces are replaced by underscores in labels.
 *
 * @typedef {Object<String, Array<*>>} LabelDataArrayPair
 * @property {Array<string>} labels The labels to be used on the x-axis.
 * @property {Array<number>} data The data corresponding to the labels at the
 *                                same index in `labels`.
 */

/**
 * A point to be displayed on a statistics map.
 *
 * @typedef {Object<string, *>} MapDataPoint
 * @property {number} latitude The latitude value to use for this point on a
 *                             map.
 * @property {number} longitude The longitude value to use for this point on a
 *                              map.
 * @property {string} title The title for this point on a map.
 */

/**
 * A length-4 array containing values for the `link-statistics` functions
 * `getWeekly`, `getMonthly`, `getAll`, and `getMap`.
 *
 * @typedef {Array<Object<string, *>>} LinkStatisticsSummary
 * @property {LabelDataArrayPair} 0 The `getWeekly` value.
 * @property {LabelDataArrayPair} 1 The `getMonthly` value.
 * @property {LabelDataArrayPair} 2 The `getAll` value.
 * @property {Array<MapDataPoint>} 3 The `getMap` value.
 */

/**
 * Options to use advanced features for link shortening in the `short-links`
 * method `create`.
 *
 * @typeDef {Object<string, *>} ShortLinksCreateOptions
 * @property {boolean} [isWords] Whether or not to use words instead of
 *                               alphanumeric characters in the short link.
 *                               If unspecified, alphanumeric characters will
 *                               be used. This argument is ignored if a
 *                               `customShortLinkID` is provided.
 * @property {boolean} [hideStatistics] Whether or not to hide statistics
 *                                      for this link. If unspecified,
 *                                      statistics will not be hidden.
 * @property {Date} [expiryDate] When this link should expire. If
 *                               unspecified, the link will never expire.
 * @property {string} [customShortLinkID] A custom shortlink ID to use
 *                                        instead of the randomly generated
 *                                        one. For example, if you wanted
 *                                        the link `qwa.la/example`, then
 *                                        `example` is your custom ID.
 *                                        Default is no custom short link.
 */

/**
 * An object containing values for the `total-statistics` functions
 * `getTotalViewCount`, `getTotalLinksCount`, and `getTotalCustomLinksCount`.
 *
 * @typedef {Object<string, number>} TotalStatisticsSummary
 * @property {number} totalViewCount The `getTotalViewCount` value.
 * @property {number} totalLinksCount The `getTotalLinksCount` value.
 * @property {number} totalCustomLinksCount The `getTotalCustomLinksCount`
 *                                          value.
 */
