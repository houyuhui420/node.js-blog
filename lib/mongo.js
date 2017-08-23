var config = require("config-lite")(__dirname);
var Mongolass = require("mongolass");
var mongolass = new Mongolass();
var moment = require('moment');   //时间格式化
var objectIdToTimestamp = require("objectid-to-timestamp"); //根据Objectld生产时间戳

mongolass.connect(config.mongodb);

exports.User = mongolass.model("User",{
//名称，密码，头像，性别，个人简介
  name: { type: "string"},
  password: { type: "string"},
  avatar: { type: "string"},
  gender: { type: "string", enum: ["m", "f", "x"]},
  bio: {type: "string"}
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

//时间戳插件
mongolass.plugin('addCreatedAt', {
  afterFind: function(results){
    results.forEach(function(item){
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne: function(result){
    if(result){
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YY-MM-DD HH:mm');
    }
    return result;
  }
});



//文章数据
exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId},
  title: { type: 'string'},
  content: { type: 'string'},
  pv: { type: 'number'}   //浏览量
});
exports.Post.index({ authou: 1, _id: -1}).exec();
