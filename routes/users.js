const express = require('express');
const { errorCode } = require('../common/errorCode');
const knex = require('../db/knex');
const resultUtils = require('../common/resultUtils');
const userService = require('../services/users');
const { camelCaseObject } = require('../utils/camelCaseObject');
const { ADMIN_ROLE } = require('../constants');
const router = express.Router();
const invalidPattern =
  /[`~!@#$%^&*()+=|{}':;',\\[\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]/;

function isAdmin(req) {
  const user = req.session.user;
  return user && user.userRole === ADMIN_ROLE;
}

router.post('/register', async (req, res) => {
  if (!req.body) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR }));
  }
  const { userAccount, userPassword, checkPassword, planetCode } = req.body;
  if (!userAccount || !userPassword || !checkPassword || !planetCode) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '参数为空' }));
  }
  if (userAccount.length < 4) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '用户账号过短' }));
  }
  if (userPassword.length < 8 || checkPassword.length < 8) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '用户密码过短' }));
  }
  if (planetCode.length > 5) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '星球编号过长' }));
  }
  if (invalidPattern.test(userAccount)) {
    return res.json(
      resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '账号包含特殊字符' })
    );
  }
  if (userPassword !== checkPassword) {
    return res.json(
      resultUtils.error({ ...errorCode.PARAMS_ERROR, description: '两次输入的密码不同' })
    );
  }
  try {
    const result = await userService.register(userAccount, userPassword, planetCode);
    res.json(resultUtils.success(result));
  } catch (error) {
    const { message } = error;
    res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: message }));
  }
});

router.post('/login', async (req, res) => {
  if (!req.body) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR }));
  }
  const { userAccount, userPassword } = req.body;
  if (!userAccount || !userPassword) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR }));
  }
  try {
    const user = await userService.login(userAccount, userPassword);
    req.session.user = user;
    res.json(resultUtils.success(user));
  } catch (error) {
    res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR, description: error.message }));
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json(resultUtils.success());
  });
});

router.get('/current', async (req, res) => {
  const currentUser = req.session.user;
  if (!currentUser) {
    return res.json(resultUtils.error({ ...errorCode.NOT_LOGIN }));
  }
  const user = await userService.getById(currentUser.id);
  const camelCaseUser = camelCaseObject(user);
  res.json(resultUtils.success(camelCaseUser));
});

router.get('/search', async (req, res) => {
  if (!isAdmin(req)) {
    return res.json(resultUtils.error({ ...errorCode.NO_AUTH }));
  }
  const { username } = req.body;
  const users = await userService.list(username);
  const camelCaseUsers = users.map(user => camelCaseObject(user));
  res.json(resultUtils.success(camelCaseUsers));
});

router.post('/delete', async (req, res) => {
  if (!isAdmin(req)) {
    return res.json(resultUtils.error({ ...errorCode.NO_AUTH }));
  }
  const { id } = req.body;
  if (!id) {
    return res.json(resultUtils.error({ ...errorCode.PARAMS_ERROR }));
  }
  const result = await userService.removeById(id);
  res.json(resultUtils.success(result));
});

module.exports = router;
