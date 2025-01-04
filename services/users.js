const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const { camelCaseObject } = require('../utils/camelCaseObject');

async function register(userAccount, userPassword, planetCode) {
  let [{ count }] = await knex('user')
    .count({ count: 'user_account' })
    .where({
      'user_account': userAccount,
      isDelete: 0,
    });
  if (count > 0) {
    const error = new Error('账号重复');
    error.type = 'PARAMS_ERROR';
    throw error;
  }
  [{ count }] = await knex('user').count({ count: 'planet_code' }).where({
    'planet_code': planetCode,
    isDelete: 0,
  });
  if (count > 0) {
    const error = new Error('编号重复');
    error.type = 'PARAMS_ERROR';
    throw error;
  }
  const encryptPassword = bcrypt.hashSync(userPassword, 10);
  const [id] = await knex('user').insert({
    userAccount,
    userPassword: encryptPassword,
    planetCode,
  });
  if (!id) {
    return -1;
  }
  return id;
}

async function login(userAccount, userPassword) {
  const user = await knex('user')
    .select(
      'id',
      'username',
      'userAccount',
      'userPassword',
      'avatarUrl',
      'gender',
      'phone',
      'email',
      'userStatus',
      'createTime',
      'userRole',
      'planetCode'
    )
    .where({ userAccount, isDelete: 0 })
    .first();
  if (!user) {
    const error = new Error('账号或密码错误');
    error.type = 'PARAMS_ERROR';
    throw error;
  }
  const camelCaseUser = camelCaseObject(user);
  if (!bcrypt.compareSync(userPassword, camelCaseUser.userPassword)) {
    const error = new Error('账号或密码错误');
    error.type = 'PARAMS_ERROR';
    throw error;
  }
  delete camelCaseUser.userPassword;
  return camelCaseUser;
}

async function getById(id) {
  const user = await knex('user')
    .select(
      'id',
      'username',
      'userAccount',
      'avatarUrl',
      'gender',
      'phone',
      'email',
      'userStatus',
      'createTime',
      'userRole',
      'planetCode'
    )
    .where({ id, isDelete: 0 })
    .first();
  return user;
}

async function list(username) {
  let query = knex('user')
    .select(
      'id',
      'username',
      'userAccount',
      'avatarUrl',
      'gender',
      'phone',
      'email',
      'userStatus',
      'createTime',
      'userRole',
      'planetCode'
    )
    .where({ isDelete: 0 });
  if (username) {
    query = query.whereLike('username', `%${username}%`);
  }
  return await query;
}

async function removeById(id) {
  return await knex('user').where({ id }).update({ isDelete: 1 });
}

module.exports = {
  register,
  login,
  getById,
  list,
  removeById,
};
