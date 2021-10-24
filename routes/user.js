const express = require('express');
const router = express.Router();
const userController =require("../controller/userController");
/*用户相关接口*/
router.get('/info',userController.info);//获取登录的用户信息
router.get('/info/:id',userController.info);//用户信息
router.post('/logout',userController.logout);//退出登录
router.post('/update',userController.update);//修改用户基本信息
router.post('/update/password',userController.updatePassword);//修改密码
router.post('/update/email',userController.updateEmail);//修改邮箱
router.post('/feedback',userController.feedBack);//问题反馈

/*router.get('/list', async function(req, res, next) { //查询usrs表中的所有数据
  await models.User.findAll().then(users=>{  //调用models模块下的User
    res.json({
      data:users
    })
  })
});
router.get('/list/user', async function(req, res, next) { //查询usrs表中的所有数据
  await models.User.findAll().then(users=>{  //调用models模块下的User
    res.json({
      data:users
    })
  })
});

router.get('/info/:id', async function(req, res, next) { //查询usrs表中的所有数据
  await models.User.findAll({
    where:{
      id:req.params.id
    }
  }).then(data=>{  //调用models模块下的User
    resHandle.init(res,data[0]);
  })
});

router.get('/createUser', async function(req, res, next) { //往user表中添加数据
  let {firstName,lastName,email}=req.query  //入参
  let user= await models.User.create({firstName,lastName,email})
  res.json({
    user
  })

});*/

module.exports = router;
