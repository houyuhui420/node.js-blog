var User = require("../lib/mongo").User;

module.exports = {
  //注册一个用户
  create: function create(user){
    return User.create(user).exec();
  },
  //获取用户信息
  getUserByName: function getUserByName(name){
    return User   //返回所有用户信息
     .findOne({name: name})   //查找name相同的用户信息
     .addCreatedAt()    //生成时间戳
     .exec();
  }
};
