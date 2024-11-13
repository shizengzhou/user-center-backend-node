const crypto = require('crypto');
const knex = require('../db/knex');
const { camelCaseObject } = require('../utils/camelCaseObject');

const salt = 'yupi';

function encrypt(password, salt) {
  return crypto
    .createHash('md5')
    .update(salt + password)
    .digest('hex');
}

async function register(userAccount, userPassword, planetCode) {
  let [{ count }] = await knex('user')
    .count({ count: 'user_account' })
    .where('user_account', userAccount);
  if (count > 0) {
    throw new Error('账号重复');
  }
  [{ count }] = await knex('user').count({ count: 'planet_code' }).where('planet_code', planetCode);
  if (count > 0) {
    throw new Error('编号重复');
  }
  const encryptPassword = encrypt(userPassword, salt);
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
  const encryptPassword = encrypt(userPassword, salt);
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
    .where({ userAccount, userPassword: encryptPassword, isDelete: 0 })
    .first();
  if (!user) {
    throw new Error('账号或密码错误');
  }
  const camelCaseUser = camelCaseObject(user);
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
