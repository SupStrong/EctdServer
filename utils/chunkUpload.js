/* eslint-disable no-debugger */
const path = require("path");
const fse = require("fs-extra");
const fs=require('fs');
const extractExt = filename =>
	filename.slice(filename.lastIndexOf("."), filename.length).toLowerCase(); // 提取后缀名
const pipeStream = (path, writeStream) =>
	new Promise(resolve => {
		const readStream = fs.createReadStream(path);
		readStream.on("end", () => {
			fs.unlink(path,function () {
				resolve();
			});
		});
		readStream.pipe(writeStream);
	});

// 合并切片
const mergeFileChunk = async (req,res,filePath, fileHash, size,callback) => {
	let basicDir=getBasicDir(req);
	const chunkDir = path.resolve(basicDir, fileHash);
	try{
		const chunkPaths = await fs.readdirSync(chunkDir);
		// 根据切片下标进行排序
		// 否则直接读取目录的获得的顺序可能会错乱
		chunkPaths.sort((a, b) => a.split("_")[1] - b.split("_")[1]);
		await Promise.all(
			chunkPaths.map((chunkPath, index) =>
				pipeStream(
					path.resolve(chunkDir, chunkPath),
					// 指定位置创建可写流
					fs.createWriteStream(filePath, {
						start: index * size,
						end: (index + 1) * size
					})
				)
			)
		);
		fs.rmdirSync(chunkDir); // 合并后删除保存切片的目录
		// eslint-disable-next-line no-empty
	}catch (e){

	}
	callback();
};

function getBasicDir(req){
	return global.diskUrl;
}
module.exports = class {
	// 合并切片
	async handleMerge(req, res,callback) {
		let data=global.getData(req);
		let	name=data.name; //文件名称
		let	md5=data.md5;//文件md5
		let size=data.chunkSize;//文件大小
		let extname=extractExt(name);
		let basicDir=getBasicDir(req);
		const filePath = path.resolve(basicDir, `${md5}${extname}`);//注意这里是带。的文件后缀
		await mergeFileChunk(req,res,filePath, md5, size,callback);
	}
	// 处理切片
	async handleFormData(req, res) {
		let file=req.files;
		console.log(req.files);
		let data=global.getData(req);
		
		if(!file){
			return resHandle.error(res,'缺少文件');
		}
		let chunk=data.chunk;//切片
		let	md5=data.md5;//文件md5
		let basicDir=getBasicDir(req);
		const chunkDir = path.resolve(basicDir, md5);
		// 切片目录不存在，创建切片目录
		if (!fs.existsSync(chunkDir)) {
			await fs.mkdirSync(chunkDir);
		}
		console.log(file.file.tempFilePath,"filePath");
		// fs-extra 专用方法，类似 fs.rename 并且跨平台
		// fs-extra 的 rename 方法 windows 平台会有权限问题
		// https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
		debugger;
		fse.move(file.file.tempFilePath, path.resolve(chunkDir, md5+'_'+chunk),{ overwrite:true },(e)=>{
			if(e){
				let message=e.message;
				console.log(message,"messagemessage");
				if(message==='dest already exists.'){
					resHandle.init(res,{
						data: {},
						msg:"已存在"+chunk+'号文件片段'
					});
				}else{
					resHandle.error(res,'上传失败');
				}
			}else{
				resHandle.init(res,{
					data:{},
					msg:"已接收"+chunk+'号文件片段'
				});
			}
		});
	}
	// 验证是否已上传/已上传切片下标
	async handleVerifyUpload(req, res) {
		let data=global.getData(req);
		let md5=data.md5;
		let basicDir=getBasicDir(req);
		const filePath = path.resolve(
			basicDir,
			`${md5}`
		);
		// 文件存在
		if (fs.existsSync(filePath)) {
			let chunks=await fs.readdirSync(filePath);
			if(chunks.length>0){
				resHandle.init(res,{
					data:{
						md5:md5,
						chunk:chunks.length-1
					},
					msg:'开始上传',
					code:1
				});
			}else{
				resHandle.init(res,{
					data:{
						md5:md5,
						chunk:0
					},
					msg:'开始上传',
					code:1
				});
			}
		}else{
			resHandle.init(res,{
				data:{
					md5:md5,
					chunk:0
				},
				msg:'开始上传',
				code:1
			});
		}
	}
	cancelUpload(req,res){
		let data=global.getData(req);
		let md5=data.md5;
		let basicDir=getBasicDir(req);
		const filePath = path.resolve(
			basicDir,
			`${md5}`
		);
		if (fs.existsSync(filePath)) {
			let chunks=fs.readdirSync(filePath);
			let i=0;
			chunks.forEach((path)=>{
				fs.unlink(filePath+'/'+path,function (err) {
					console.log(err);
					i++;
					if(i===chunks.length){
						fs.rmdirSync(filePath); // 合并后删除保存切片的目录
						resHandle.init(res,{
							data:{},
							msg:"已取消上传"
						});
					}
				});
			});
		}else{
			resHandle.init(res,{
				data:{},
				msg:"已取消上传"
			});
		}
	}
};
