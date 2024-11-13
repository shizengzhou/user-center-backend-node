const { baseResponse } = require('./baseResponse');

function success(data) {
  return baseResponse(0, data, 'ok');
}

function error({ code, message = '', description = '' }) {
  return baseResponse(code, null, message, description);
}

module.exports = {
  success,
  error,
};
