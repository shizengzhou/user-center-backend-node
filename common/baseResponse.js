function baseResponse(code, data, message = '', description = '') {
  return {
    code,
    data,
    message,
    description
  };
}

module.exports = { baseResponse };
