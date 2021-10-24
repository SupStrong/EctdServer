const AdmZip = require('adm-zip-iconv');
const tool=require("./tool");
const path = require('path');
const fs=require('fs');
function getFolder(path){
	return path.substring(0,path.length-1).split('/').pop();
}
function getParentName(item){
	let list=item.entryName.split('/');
	list.pop();
	if(item.isDirectory){
		list.pop();
	}
	return list.join('/')+'/';
}
module.exports={
	unzip:async function (zip,list,req){
		let uid=req.userInfo.id;
		let temDir='uid_'+uid;
		let data=global.getData(req);
		let targetId=data.targetId;//解压目录id
		const zipDir = path.resolve(global.diskUrl, temDir);
		// 切片目录不存在，创建切片目录
		if (!fs.existsSync(zipDir)) {
			await fs.mkdirSync(zipDir);
		}
		for(let i=0;i<list.length;i++){
			let item=list[i];
			list[i].id = tool.random(10);
			list[i].parentId=targetId;
			list[i].extName=path.extname(list[i].name).toLowerCase();
			list[i].content=uid+'_'+list[i].id+list[i].extName;
			for(let j=0;j<list.length;j++) {
				if(i===j) continue;
				let file = list[j];
				if (item.path === file.entryName) {
					list[i].parentId=file.id;
					break;
				}
			}
		}
		list.forEach((item)=>{
			if(item.type==='file'){
				zip.extractEntryTo(item.entryName, zipDir,false, true);
				fs.renameSync(zipDir+'/'+item.name, global.diskUrl+item.content);
			}
		});
		return list;
	},
	zip:function (zip){
    	
	},
	info:function (zip){
		let zipEntries = zip.getEntries();
		let data=[];
		let zipSize=0;
		zipEntries.forEach(function(zipEntry) {
			let folderName=getFolder(zipEntry.entryName);
			data.push({
				name:zipEntry.name||folderName,
				entryName:zipEntry.entryName,
				path:getParentName(zipEntry),
				type:zipEntry.isDirectory?'folder':'file',
				size:zipEntry.header.size,
			});
			zipSize=zipSize+=zipEntry.header.size;
		});
		return {
			list:data,
			size:zipSize
		};
	},
	instance:AdmZip
};
