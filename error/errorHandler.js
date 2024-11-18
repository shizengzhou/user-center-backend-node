const { errorCode } = require('../common/errorCode');
const resultUtils = require('../common/resultUtils');

function errorHandler() {
  this.handleError = async (error, responseStream) => {
    if (error.type) {
      return responseStream.json(
        resultUtils.error({ ...errorCode[error.type], description: error.message })
        );
    }
    responseStream.status(500).json({ error: error.message });
  };
}

module.exports = new errorHandler();
