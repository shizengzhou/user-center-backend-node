const initKnex = require('knex');
const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

module.exports = knex;
