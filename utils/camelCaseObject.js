const _ = require('lodash');

function camelCaseObject(obj) {
  return _.mapKeys(obj, (value, key) => _.camelCase(key));
}

module.exports = {
  camelCaseObject
}
