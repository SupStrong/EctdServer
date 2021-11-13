const express = require('express');
const router = express.Router();
const companyTableController =require("../controller/companyTableController");
/*品牌相关接口*/
router.post('/list',companyTableController.list);//获取品牌列表
router.post('/create',companyTableController.create);//创建品牌
router.post('/update',companyTableController.update);//编辑品牌
router.post('/delete',companyTableController.delete);//获取品牌列表

module.exports = router;

