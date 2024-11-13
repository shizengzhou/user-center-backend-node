const path = require('path');
const dotenv = require('dotenv');
const _ = require('lodash');

dotenv.config({
  path: path.join(__dirname, '../.env')
});

module.exports = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    port: 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'user_center'
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value))
};
