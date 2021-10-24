const fs =require('fs');
const path=require('path');  /*nodejs自带的模块*/
const md5 = require('md5');
module.exports={
	getType:function (file) {
		return path.extname(file.originalFilename);
	},
	upload:function (file,name,location) {
		return new Promise((resolve,injector)=>{
			let url=global.uploadUrl+location+'/';
			fs.readFile( file.path, function (err, data) {
				if(err){
					injector('无法读取上传的文件');
				}else{
					fs.writeFile(url+name, data, function (err) {
						if( err ){
							injector('文件写入失败');
						}else{
							resolve({file:name, path:url});
						}
					});
				}
			});
		});
	},
	delete:function (location) {
		fs.unlink(location,function () {

		});
	},
	createMd5:function (file){
		return new Promise((resolve,injector)=>{
			fs.readFile( file.path, function (err, data) {
				if(err){
					injector('无法读取上传的文件');
				}else{
					let fileData=data;
					let start=fileData.slice(0,10)+fileData.length;
					let medium=fileData.slice(Math.ceil(fileData.length/2-5),Math.ceil(fileData.length/2+5));
					let end=fileData.slice(-10);
					resolve(md5(start+medium+end));
				}
			});
		});
	},
	get:function (path){
		return fs.readFileSync(path);
	},
	createFolder:function (path){
		return fs.mkdirSync(path,'0777');
	},
};
