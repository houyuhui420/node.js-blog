var express = require("express");
var router = express.Router();

var checkLogin = require("../middlewares/check").checkLogin;

router.get("/", checkLogin, function(req, res, next){
  //清空session中的用户信息
  req.session.user= null;
  req.flash('success', '登出成功');
  //跳转到主页
  res.redirect('/posts');
});

module.exports = router;
