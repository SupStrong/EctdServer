const express = require('express');
const router = express.Router();
const imgTextController =require("../controller/imgTextController");
/*品牌相关接口*/
router.post('/list',imgTextController.list);//获取品牌列表
router.post('/create',imgTextController.create);//创建品牌
router.post('/update',imgTextController.update);//编辑品牌
router.post('/delete',imgTextController.delete);//获取品牌列表

module.exports = router;

