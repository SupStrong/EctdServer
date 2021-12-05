const express = require('express');
const router = express.Router();
const templateAllController =require("../controller/templateAllController");
/*品牌相关接口*/
router.post('/list',templateAllController.list);// 样式
router.post('/get',templateAllController.get);// 样式
router.post('/create',templateAllController.create);// 样式
router.post('/update',templateAllController.update);// 样式
router.post('/delete',templateAllController.delete);// 样式

module.exports = router;

