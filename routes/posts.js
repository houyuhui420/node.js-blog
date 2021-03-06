var express = require("express");
var router = express.Router();

var PostModel = require('../models/posts');

var checkLogin = require("../middlewares/check").checkLogin;

//blog首页
router.get("/", function(req, res, next){
  var author = req.query.author;

  PostModel.getPosts(author)
  .then(function(posts) {
    res.render('posts', {
      posts: posts
    });
  })
  .catch(next);
});

//发表文章页
router.get("/create", checkLogin, function(req, res, next){
  res.render("create");
});


//发表一篇文章  /posts
router.post("/", checkLogin, function(req, res, next){
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  //验证参数
  try{
    if(!title.length){
      throw new Error('请写填写标题');
    }
    if(!content.length){
      throw new Error('请填写内容');
    }
  } catch(e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  //文章数据
  var post = {
    author: author,
    title: title,
    content: content,
    pv:0
  };

  //数据加入数据库
  PostModel.create(post)
   .then(function(result){
     post = result.ops[0];
     req.flash('success', '发表成功');
     res.redirect(`/posts/${post._id}`);
   })
    .catch(next);
});


//单独一篇文章页
router.get("/:postId", function(req, res, next){
  var postId = req.params.postId;

    Promise.all([
      PostModel.getPostById(postId),// 获取文章信息
      PostModel.incPv(postId)// pv 加 1
    ])
    .then(function (result) {
      var post = result[0];
      if (!post) {
        throw new Error('该文章不存在');
      }

      res.render('post', {
        post: post
      });
    })
    .catch(next);
  });


//更新文章页
router.get("/:postId/edit", checkLogin, function(req, res, next){
  var postId = req.params.postId;
var author = req.session.user._id;

PostModel.getRawPostById(postId)
  .then(function (post) {
    if (!post) {
      throw new Error('该文章不存在');
    }
    if (author.toString() !== post.author._id.toString()) {
      throw new Error('权限不足');
    }
    res.render('edit', {
      post: post
    });
  })
  .catch(next);

});

//提交更新页
router.post("/:postId/edit", checkLogin, function(req, res, next){
  var postId = req.params.postId;
 var author = req.session.user._id;
 var title = req.fields.title;
 var content = req.fields.content;

 PostModel.updatePostById(postId, author, { title: title, content: content })
   .then(function () {
     req.flash('success', '编辑文章成功');
     // 编辑成功后跳转到上一页
     res.redirect(`/posts/${postId}`);
   })
   .catch(next);
});

//删除一篇文章
router.get("/:postId/remove", checkLogin, function(req, res, next){
  var postId = req.params.postId;
 var author = req.session.user._id;

 PostModel.delPostById(postId, author)
   .then(function () {
     req.flash('success', '删除文章成功');
     // 删除成功后跳转到主页
     res.redirect('/posts');
   })
   .catch(next);
});

//留言
router.post("/:postId/comment", checkLogin, function(req, res, next){
  res.send("留言");
});

//删除留言
router.get("/postId/comment/:commentId/remove", checkLogin,function(req, res, next){
  res.send("删除留言");
});





module.exports = router;
