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

router.post('/register', async (req, res, next) => {
  try {
    if (!req.body) {
      const error = new Error(errorCode.PARAMS_ERROR.message);
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    const { userAccount, userPassword, checkPassword, planetCode } = req.body;
    if (!userAccount || !userPassword || !checkPassword || !planetCode) {
      const error = new Error('参数为空');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    if (userAccount.length < 4) {
      const error = new Error('用户账号过短');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    if (userPassword.length < 8 || checkPassword.length < 8) {
      const error = new Error('用户密码过短');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    if (planetCode.length > 5) {
      const error = new Error('星球编号过长');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    if (invalidPattern.test(userAccount)) {
      const error = new Error('账号包含特殊字符');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    if (userPassword !== checkPassword) {
      const error = new Error('两次输入的密码不同');
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    const result = await userService.register(userAccount, userPassword, planetCode);
    res.json(resultUtils.success(result));
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!req.body) {
      const error = new Error(errorCode.PARAMS_ERROR.message);
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    const { userAccount, userPassword } = req.body;
    if (!userAccount || !userPassword) {
      const error = new Error(errorCode.PARAMS_ERROR.message);
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    const user = await userService.login(userAccount, userPassword);
    req.session.user = user;
    res.json(resultUtils.success(user));
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json(resultUtils.success());
  });
});

router.get('/current', async (req, res, next) => {
  try {
    const currentUser = req.session.user;
    if (!currentUser) {
      const error = new Error(errorCode.NOT_LOGIN.message);
      error.type = 'NOT_LOGIN';
      throw error;
    }
    const user = await userService.getById(currentUser.id);
    const camelCaseUser = camelCaseObject(user);
    res.json(resultUtils.success(camelCaseUser));
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      const error = new Error(errorCode.NO_AUTH.message);
      error.type = 'NO_AUTH';
      throw error;
    }
    const { username } = req.body;
    const users = await userService.list(username);
    const camelCaseUsers = users.map(user => camelCaseObject(user));
    res.json(resultUtils.success(camelCaseUsers));
  } catch (error) {
    next(error);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      const error = new Error(errorCode.NO_AUTH.message);
      error.type = 'NO_AUTH';
      throw error;
    }
    const { id } = req.body;
    if (!id) {
      const error = new Error(errorCode.PARAMS_ERROR.message);
      error.type = 'PARAMS_ERROR';
      throw error;
    }
    const result = await userService.removeById(id);
    res.json(resultUtils.success(result));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
