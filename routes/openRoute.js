const express = require('express');
const router = express.Router();
const userController =require("../controller/userController");
const indexController =require("../controller/indexController");
const diskController =require("../controller/diskController");
const { zip } = require('../utils/zipper');
/*无需登录就可以使用的接口*/
router.post('/user/login',userController.login);//登录
router.post('/user/register',userController.register);//注册
router.post('/user/forget',userController.forget);//忘记密码
router.post('/user/verify',userController.verify);//激活用户
router.post('/user/resend',userController.resend);//重新发送邮件
router.post('/user/error/email',userController.errorEmail);//修改错误的邮箱
router.post('/user/token',userController.realToken);//验证token
router.get('/user/code',userController.verifyCode);//验证码
/*部分网盘接口*/
router.get('/disk/share/info/:code',diskController.shareInfo);//获取分享信息



module.exports = router;
