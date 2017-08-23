var path = require("path");
var express = require("express");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var flash = require("connect-flash");
var config = require("config-lite")(__dirname);
var routes = require('./routes');


var pkg = require("./package");

var app = express();

//设置模板目录
app.set("views", path.join(__dirname, "views"));
//设置模板引擎
app.set("view engine", "ejs");

//设置静态文件目录
app.use(express.static(path.join(__dirname,"public")));
//session会话
app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
    url: config.mongodb
  })
}));

app.use(flash());

//处理表单上传
app.use(require("express-formidable")({
  uploadDir: path.join(__dirname, "public/img"),//上传文件目录
  keepExtensions:true //保留后缀
}));









//app.locals 上通常挂载常量信息（如博客名、描述、作者信息），res.locals 上通常挂载变量信息，即每次请求可能的值都不一样（如请求者信息，res.locals.user = req.session.user）。

//设置模板全局常量
app.locals.blog = {
  title: "暮下孤星",
  description: "We come to AloneSrat!"
};

//添加模板三个变量
app.use(function(req, res, next){
  res.locals.user = req.session.user;
  res.locals.success = req.flash("success").toString();
  res.locals.error = req.flash("error").toString();
  next();
})



//路由
// var index = require("./routes/index");
// index(app);
routes(app);

//监听端口
app.listen(config.port, function(){
  console.log(`"程序启动成功，端口为" ${config.port}`);
});
