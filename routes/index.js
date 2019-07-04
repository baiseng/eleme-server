var express = require('express');
var router = express.Router();

/* 欢迎光临美食街. */
router.get('/', function(req, res, next) {
  res.render('index', { h1: '欢迎来到王者荣耀',h2:'敌军还有五秒到达战场',h3:'全军出击' });
});

module.exports = router;
