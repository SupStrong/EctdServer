const express = require('express');
const router = express.Router();
const diskController =require("../controller/diskController");
/*网盘相关接口*/
router.get('/info',diskController.info);//获取网盘信息
router.get('/list',diskController.list);//获取文件列表
router.get('/folderlist',diskController.folderList);//获取文件夹列表
router.post('/new/folder',diskController.createFolder);//新建文件夹
router.post('/rename',diskController.rename);//文件重命名
router.post('/copy',diskController.copy);//文件复制
router.post('/move',diskController.move);//文件移动
router.post('/trash',diskController.trash);//文件回收
router.post('/recover',diskController.recover);//文件恢复
router.delete('/delete',diskController.delete);//文件彻底删除
router.post('/upload/verify',diskController.uploadVerify);//文件分片文件上传验证
router.post('/upload/chunk',diskController.uploadChunk);//文件分片文件上传
router.post('/upload/merge',diskController.mergeChunk);//文件分片合并
router.post('/upload/cancel',diskController.uploadCancel);//文件取消上传
router.get('/lrc',diskController.lrc);//歌词接口
router.get('/file/info',diskController.fileInfo);//文件属性
router.post('/upload/folder',diskController.uploadFolder);//上传文件夹
router.post('/zip/unpack',diskController.zipUnpack);//文件解压缩
router.get('/zip/info',diskController.zipInfo);//文件解压缩
router.post('/zip/pack',diskController.zipPack);//文件打包下载
router.get('/get-content',diskController.getContent);//获取文件内容
router.post('/share/create',diskController.shareCreate);//分享文件
router.post('/share/cancel',diskController.shareCancel);//取消分享文件
router.post('/share/save',diskController.saveShare);//保存分享文件
router.get('/share/list',diskController.shareFileList);//获取分享文件

module.exports = router;

