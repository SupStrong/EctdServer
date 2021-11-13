const express = require('express');
const router = express.Router();
const sampleController =require("../controller/sampleController");
/*品牌相关接口*/
router.post('/list',sampleController.list);//获取品牌列表
router.post('/create',sampleController.create);//创建品牌
router.post('/update',sampleController.update);//编辑品牌
router.post('/delete',sampleController.delete);//获取品牌列表

module.exports = router;

