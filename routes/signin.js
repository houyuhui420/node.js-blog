var express = require("express");
var router = express.Router();
var sha1 = require('sha1');//密码加密

var UserModel = require('../models/users');
var checkNotLogin = require("../middlewares/check").checkNotLogin;

//登陆页
router.get("/", checkNotLogin, function(req, res, next){
  res.render('signin');
});

//用户登陆
router.post("/", checkNotLogin, function(req, res, next){
  var name = req.fields.name;
  var password = req.fields.password;

//获取用户信息,所有信息包含在user中
  UserModel.getUserByName(name)
    .then(function(user){     //异步执行，先执行前面的后执行里面的
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('back');
      }
      //检查密码是否匹配
      if(sha1(password) !== user.password){
        req.flash('error', '用户名或密码错误');
        return res.redirect('back');
      }
      req.flash('success', '登陆成功');
      //用户信息写入session
      //删除密码
      delete user.password;
      req.session.user = user;

      res.redirect('/posts');
    })
    .catch(next);
});

module.exports = router;
