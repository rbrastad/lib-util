var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('./index'),
    value: require('./value')
};

var getContent = libs.portal.getContent;
var queryContent = libs.content.query;
var toStr = libs.util.toStr;
var valueOr = libs.value.valueOr;

/**
 * Get content by key (path or id)
 * @param {string} key - Content key
 * @returns {object} Content object
 */
exports.get = function (key) {
    var content;
    if (typeof key == 'undefined') {
        content = libs.portal.getContent();
    }
    else {
        content = libs.content.get({
            key: key
        });
    }
    return content;
};

/**
 * Check if content exists at path
 * @param {string} path
 * @returns {boolean}
 */
exports.exists = function (path) {
    return exports.get(path) ? true : false;
};


/**
 * Get content property
 * @param {string} key - Content key
 * @param {string} property - Property name
 * @returns {*}
 */
exports.getProperty = function (key, property) {
    if (!key || !property) {
        return null;
    }
    var result = exports.get(key);
    return result ? result[property] : null;
};

/**
 * Returns the path to the content location. If the key to a content is passed, it will be used. If contenKey is null, the path
 * to the page that the part is on will be returned.
 * @param {Content} contentKey - content key. Example: config['saveFolder']
 * @return {String} Returns the path of the save location.
 */
exports.getPath = function (contentKey) {
    var defaultContent = libs.portal.getContent();
    var contentPath;
    if (contentKey) {
        var content = exports.get(contentKey);
        if (content) {
            contentPath = content._path;
        }
    }
    return contentPath ? contentPath : defaultContent._path;
};

/**
 * Returns a list of ancestors.
 *
 * @param {object} params - JSON with the parameters.
 * @param {object} [params.content = getContent()] - Content (as JSON) to find anscestors of.
 * @param {Array} [params.contentTypes = [`${app.name}:page`,'portal:site']] - Content types to filter on.
 * @param {Number} [params.count = -1] - Number of contents to fetch.
 * @param {string} [params.sort = '_path ASC'] - Sorting expression.
 * @return {Array} Returns a list of ancestor content
 */
exports.getAncestors = function (params) {
    var pathParts = valueOr(params.content, getContent())._path.split('/').slice(1);
    let ancestorPaths = [];
    while (pathParts.pop()) { ancestorPaths.push("'/content/" + pathParts.join('/') + "'"); }
    var query = {
        contentTypes: valueOr(params.contentTypes, [
            app.name + ':page',
            'portal:site'
        ]), // Note that folders have not been added to the fallback contentTypes
        count: valueOr(params.count, -1),
        query: '_path IN (' + ancestorPaths.join(', ') + ')',
        sort:  valueOr(params.sort, '_path ASC')
    };
    log.info('query:', toStr(query));
    return queryContent(query).hits;
};
