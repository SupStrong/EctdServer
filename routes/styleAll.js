const express = require('express');
const router = express.Router();
const styleAllController =require("../controller/styleAllController");
/*品牌相关接口*/
router.post('/list',styleAllController.list);// 样式
router.post('/create',styleAllController.create);// 样式
router.post('/update',styleAllController.update);// 样式
router.post('/delete',styleAllController.delete);// 样式

module.exports = router;

