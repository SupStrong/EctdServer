const express = require('express');
const router = express.Router();
const categoryController =require("../controller/categorymenuController");
/*品牌相关接口*/
router.post('/list',categoryController.list);//获取品牌列表
router.post('/create',categoryController.create);//创建品牌
router.post('/update',categoryController.update);//编辑品牌
router.post('/delete',categoryController.delete);//获取品牌列表

module.exports = router;

