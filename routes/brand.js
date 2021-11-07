const express = require('express');
const router = express.Router();
const brandController =require("../controller/brandController");
/*品牌相关接口*/
router.post('/list',brandController.list);//获取品牌列表
router.post('/create',brandController.create);//创建品牌
router.post('/update',brandController.update);//编辑品牌
router.post('/delete',brandController.delete);//获取品牌列表

module.exports = router;

