var fs = require("fs");
var path = require("path");
var sha1 = require("sha1");

var express = require("express");
var router = express.Router();

var UserModel = require("../models/users");
var checkNotLogin = require("../middlewares/check").checkNotLogin;

//注册页
router.get("/", checkNotLogin, function(req, res, next){
  res.render("signup");
});

//用户注册
router.post("/", checkNotLogin, function(req, res, next){
  var name = req.fields.name;//fields来自express-formidable
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();//获取图像文件的路径
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  //验证参数
  try{
    if(!(name.length >=1 && name.length <= 10)){
      throw new Error("名字请限制在1-10个字符");
    }
    if(["m", "f", "x" ].indexOf(gender) === -1){
      throw new Error("性别只能是m,f,或x");
    }
    if(!(bio.length >= 1 && bio.length <= 30)){
      throw new Error('个人简介请限制在30个字符内');
    }
    if(!req.files.avatar.name){
      throw new Error("缺少图像");
    }
    if(password.length < 6){
      throw new Error("密码至少6个字符");
    }
    if(repassword !== password){
      throw new Error("两次输入密码不一致");
    }

  }catch (e){
    fs.unlink(req.files.avatar.path);//删除图像
    req.flash("error", e.message);
    return res.redirect("./signup");
  }

  //密码加密
  password = sha1(password);

  //要写入数据库的数据
  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };

  //数据写入数据库
  UserModel.create(user)
  .then(function(result){
    //user 是插入mongodb后的值
    user = result.ops[0];
    //将用户信息存入session
    delete user.password;
    req.session.user = user;
    req.flash("success", "注册成功");
    res.redirect("/posts");
  })
  .catch(function(e){
    //注册失败，删除图像
    fs.unlink(req.files.avatar.path);
    //用户名被占用
    if(e.message.match("E11000 duplicate key")){
      req.flash("error", "用户名已被占用");
      return res.redirect("/signup");
    }
    next(e);
  });
});

module.exports = router;
