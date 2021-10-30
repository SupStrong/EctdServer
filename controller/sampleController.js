const tool=require("../utils/tool");
const path=require('path');
const diskModels  = require('../models').disk;
const userModels  = require('../models').user;
let diskAttributes={ exclude: ['createdAt','state','md5','userId','sharePass'] };
const fileHandle =require('../utils/fileHandle');
const superagent = require('superagent');
let chunkUpload=require('../utils/chunkUpload');//分片上传
chunkUpload=new chunkUpload();
const zipper=require('../utils/zipper');
const getThumb=require('../utils/getThumb');

function folderExist(name,pid,type,userId){
	return diskModels.findOne({
		where:{
			name:name,
			parentId:pid||0,
			type:type||'folder',
			userId:userId
		}
	});
}
function getTree(userId,id,callback,data){
	diskModels.findAll({
		where:{
			parentId: {[Op.in]: id},
			userId:userId,
		},
	}).then((rs)=>{
		data=[...rs,...data];
		let ids=rs.reduce((a,b)=>{
			a.push(b.id);
			return a;
		},[]);
		if(ids.length){
			getTree(userId,ids,callback,data);
		}else{
			callback(data);
		}
	}).catch((error)=>{
		callback(data,error);
	});
}
function deepCopy(options,callback){
	let userId=options.userId;//查询的用户id
	let newUserId=options.newUserId||userId;//插入使用的用户id
	let id=options.id;//查询的id
	let newParent=options.newParent;//插入的parentId
	let prefix=options.prefix||'';//后缀
	diskModels.findAll({
		where:{
			parentId:id,
			userId:userId,
			state:'normal'
		},
	}).then((rs)=>{
		if(rs.length){
			rs.forEach((item)=>{
				let newId=tool.random(10);
				diskModels.create({
					userId:newUserId,
					id:newId,
					parentId:newParent,
					name:item.name+prefix,
					type:item.type,
					fileType:item.fileType,
					size:item.size,
					content:item.content,
					extName:item.extName,
					state:item.state,
				});
				deepCopy({
					userId:userId,
					newUserId:newUserId,
					id:item.id,
					newParent:newId,
					prefix:prefix,
				},callback);
			});
		}else{
			callback();
		}
	}).catch((error)=>{
		callback(error);
	});
}
function trashOrRestore(userId,id,res,state) {
	diskModels.update({
		state:state
	},{
		where:{
			id: {[Op.in]: id},
			userId:userId,
			state:state==='trash'?'normal':'trash'
		},
	}).then((rs)=>{
		if(rs[0]===id.length){
			getTree(userId,id,(result)=>{
				let ids=result.reduce((a,b)=>{
					a.push(b.id);
					return a;
				},[]);
				diskModels.update({
					state:state==='trash'?'child-trash':'normal'
				},{
					where:{
						id: {[Op.in]: ids},
						userId:userId,
					},
				}).then((rs)=> {
					if (rs[0] === ids.length) {
						if(state==='trash'){
							resHandle.init(res, {
								data: id,
								msg: "移入回收站完成"
							});
						}else{
							diskModels.findAll({
								where:{
									id: {[Op.in]: id},
									userId:userId,
									state:'normal'
								},
								attributes:diskAttributes
							}).then((restoreResult)=>{
								resHandle.init(res, {
									data: restoreResult,
									msg: "文件已恢复"
								});
							}).catch((error)=>{
								resHandle.error(res,error);
							});
						}
					}else{
						resHandle.error(res,(state==='trash'?'未全部移入回收站':'未全部恢复')+',成功'+rs[0]+'个');
					}
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			},[]);
		}else{
			resHandle.error(res,(state==='trash'?'移入回收站失败':'恢复失败')+',成功'+rs[0]+'个');
		}
	}).catch((error)=>{
		resHandle.error(res,error);
	});
}
function isFolder(res,userId,id,callback){
	if(id===1){
		callback();
		return;
	}
	diskModels.findOne({
		where:{
			id:id,
			userId:userId,
			type:"folder"
		}
	}).then((rs)=>{
		if(rs) {
			callback();
		}else{
			resHandle.error(res,'目标位置不是一个目录或不存在');
		}
	}).catch((error)=>{
		resHandle.error(res,'查询目标文件夹时发生了错误');
	});
}
function deleteData(res,userId,data,callback){
	let id=data.reduce((a,b)=>{
		a.push(b.id);
		return a;
	},[]);
	diskModels.destroy({
		where:{
			id: {[Op.in]: id},
			userId:userId
		}
	}).then((r)=>{
		data.forEach((item)=>{
			if(item.type!=='folder'){
				diskModels.findAll({
					where:{
						md5:item.md5
					}
				}).then((rs)=>{
					if(rs.length===0){
						fileHandle.delete(global.uploadUrl+'disk/'+item.content);
						if(item.thumb) {
							fileHandle.delete(item.thumb);
						}
					}
				});
			}
		});
		callback(r,id);
	}).catch((e)=>{
		resHandle.error(res,e);
	});
}
function getFileType(name){
	let typeList={
		picture:[
			"apng",
			"png",
			"jpg",
			"jpeg",
			"bmp",
			"gif",
			"ico",
			"webp"
		],
		video:[
			"mp4",
			"rmvb",
			"mkv",
		],
		document:[
			"md",
			"doc",
			"docx",
			"ppt",
			"pptx",
			"xls",
			"xlsx",
			"pdf",
			"txt"
		],
		music:[
			"m4a",
			"mp3",
			"ogg",
			"flac",
			"f4a",
			"wav",
			"ape"
		],
		torrent:[
			'torrent'
		]
	};
	let result='';//空为其他
	for(let type in typeList){
		let extNames=typeList[type];
		for(let i=0;i<extNames.length;i++){
			if(name==='.'+extNames[i]){
				result=type;
				break;
			}
		}
		if(result){
			break;
		}
	}
	return result;
}
async function addFile(req,res){
	let data=global.getData(req);
	let	name=data.name; //文件名称
	let	md5=data.md5;//文件md5
	let size=data.size;//文件大小
	let extname=path.extname(name).toLowerCase();
	let id=tool.random(10);
	let fileType=getFileType(extname);
	let fileUrl=md5+extname;
	let obj={
		id:id,
		parentId:data.parentId||1,
		type:'file',
		userId:req.userInfo.id,
		name:name,
		md5:md5,
		size:size,
		extName:extname,
		content:fileUrl,
		fileType:fileType
	};
	if(fileType==='picture'){
		obj.thumb=await getThumb(global.diskUrl + fileUrl, fileUrl);
	}
	diskModels.create(obj).then((rs)=>{
		if(rs){
			resHandle.init(res,{
				data:rs,
				msg:data.name+'上传成功'
			});
		}else{
			resHandle.error(res,"文件添加失败");
		}
	}).catch((error)=>{
		resHandle.error(res,error);
	});
}
function fullyAddress (id,data,callback){
	if(id===1){
		callback([]);
		return;
	}
	diskModels.findOne({
		where:{
			id:id,
		},
		attributes:['id','name','parentId']
	}).then((rs)=>{
		if(rs){
			if(rs.parentId===1){
				data.push(rs);
				callback(data.reverse());
			}else{
				data.push(rs);
				fullyAddress(rs.parentId,data,callback);
			}
		}else{
			callback([]);
		}
	});
}
function getParent(data,path) {
	return data.filter((item) => {
		return item.path.toString() === path.toString();
	})[0].id;
}
async function getUsedSize(req) {
	return new Promise((resolve,reject)=>{
		let userId=req.userInfo.id;
		diskModels.findAll({
			attributes:['size'],
			where:{
				userId:userId,
				type:'file',
			}
		}).then((rs)=>{
			let used=0;
			rs.forEach((item)=>{
				used=used+=parseInt(item.size);
			});
			resolve(used);
		}).catch(()=>{
			resolve(0);
		});
	});
}
function zipVerify (req,res,callback){
	let data=global.getData(req);
	let userId=req.userInfo.id;
	if(!data.id||data.id.length===0){
		return resHandle.error(res,'缺少参数');
	}
	diskModels.findOne({
		where: {
			id:data.id,
			type:'file',
			userId:userId,
			extName:'.zip'
		},
		attributes:['content','name','size'],
	}).then((rs)=>{
		if(rs){
			if(rs.size>209715200){
				return resHandle.error(res,'只能解压200MB以内的压缩包');
			}else{
				callback(rs);
			}
		}else{
			resHandle.error(res,'找不到该压缩包');
		}
	}).catch((error)=>{
		resHandle.error(res,error);
	});
}

module.exports={
	info:async function (req,res,next){
		let used=await getUsedSize(req);
		resHandle.init(res,{
			data:{
				used:used,
				left:req.userInfo.diskSize-used,
				total:req.userInfo.diskSize
			}
		});
	},
	list:function (req,res,next) {
		let data=global.getData(req);
		let userId=req.userInfo.id;
		let page=data.page||1;
		let limit=data.limit||50;
		let parentId=data.parentId||1;
		let category=data.category||'all';
		let keyWord=data.keyWord||false;
		let query={};
		if(category==='other'){//其他分类
			query={
				state:'normal',
				type:'file',
				fileType:''
			};
		}else if(category==='trash'){//回收
			query={
				state:'trash',
			};
		}else if(category==='all'){
			query={
				state:'normal',
				parentId:parentId,
			};
		}else if(category.includes('share')){
			if(category==='share'){
				query={
					state:'normal',
					share:{
						// 模糊查询
						[Op.not]:'null'
					}
				};
			}else{
				query= {
					state: 'normal',
					type: 'file',
					share: 'false'
				};
			}
		}else {
			query={
				state:'normal',
				type:'file',
				fileType:category
			};
		}
		if(keyWord){
			query.name={
				[Op.like]:'%' +keyWord + '%'
			};
			delete query.parentId;
		}
		diskModels.findAndCountAll({
			where:{
				userId:userId,
				...query
			},
			//order:["name"],
			attributes: diskAttributes,
			limit:  limit,
			distinct:true,
			offset: (page - 1) * limit
		}).then((rs)=>{
			if(keyWord){
				let count=0;
				if(rs.rows.length) {
					let result=[];
					rs.rows.forEach((item, index) => {
						result.push(item.dataValues);
						fullyAddress(item.parentId, [], (address) => {
							address.push({
								id: item.id,
								name: item.name,
								parentId: item.parentId
							});
							count++;
							result[index].address = address;
							if (count === rs.rows.length) {
								resHandle.init(res, {data: {
									count:rs.count,
									rows:result
								}});
							}
						});
					});
				}else{
					resHandle.init(res, {data: rs});
				}
			}else {
				resHandle.init(res,{data:rs});
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	folderList:function (req,res,next){
		let data=global.getData(req);
		let userId=req.userInfo.id;
		let parentId=data.parentId||1;
		diskModels.findAll({
			where:{
				userId:userId,
				parentId:parentId,
				type:'folder',
				state:'normal',
			},
			attributes: diskAttributes,
		}).then((rs)=>{
			resHandle.init(res,{data:rs});
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	createFolder:function (req,res,next) {
		let data=global.getData(req);
		let userId=req.userInfo.id;
		if(!data.parentId||data.parentId.length===0){
			return resHandle.error(res,'缺少参数');
		}
		folderExist(data.name,data.parentId,'folder',userId).then((rs)=>{
			if(rs){
				resHandle.error(res,"文件夹已存在");
			}else{
				let id=tool.random(10);
				diskModels.create({
					id:id,
					userId:req.userInfo.id,
					parentId:data.parentId||0,
					name:data.name,
				}).then((rs)=>{
					if(rs){
						resHandle.init(res,{
							data:{
								...data,
								id:id,
								type:'folder',
								state:'normal'
							},
							msg:data.name+'创建成功'
						});
					}else{
						resHandle.error(res,"文件夹创建失败");
					}
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	rename:function (req,res,next) {
		let data=global.getData(req);
		let userId=req.userInfo.id;
		if(!data.id||data.id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.findOne({
			where:{
				id:data.id,
				userId:userId
			},
			attributes:['name','type','parentId']
		}).then((rs)=>{
			if(rs){
				if(rs.name===data.name){
					resHandle.init(res,{
						data:data,
						msg:'名称未修改'
					});
				}else{
					folderExist(data.name,rs.parentId,rs.type,userId).then((a)=>{
						if(a){
							resHandle.error(res,'当前目录已存在同名文件/文件夹');
						}else{
							diskModels.update({
								name:data.name
							},{
								where:{
									id:data.id,
									userId:userId
								}
							}).then((rs)=>{
								if(rs[0]){
									resHandle.init(res,{
										data:data,
										msg:"重命名成功"
									});
								}else{
									resHandle.error(res,'重命名失败');
								}
							}).catch((error)=>{
								resHandle.error(res,error);
							});
						}
					}).catch((e)=>{
						resHandle.error(res,e);
					});
				}
			}else{
				resHandle.error(res,'找不到文件/文件夹');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	copy:function (req,res,next) {
		let data=global.getData(req);
		let id=data.id;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		if(!data.target||data.target.length===0){
			return resHandle.error(res,'缺少目标目录');
		}
		let userId=req.userInfo.id;
		let copyWhere=data.target;
		if(data.id.includes(copyWhere)){
			return resHandle.error(res,'目标目录有误');
		}
		isFolder(res,userId,copyWhere,()=>{
			let rootCopy='';//复制的根文件
			let newIdArr=[];//存放新的id
			let length=0;//需要复制几次
			function startDeepCopy(count) {
				deepCopy({
					userId:userId,
					newUserId:userId,
					id:id[count],
					newParent:newIdArr[count],
					prefix:'-复制',
				},(error)=>{
					if(!error){
						count++;
						if(count===length){
							resHandle.init(res,{
								data:rootCopy,
								msg:'复制完成'
							});
						}else{
							startDeepCopy(count);
						}
					}else{
						resHandle.error(res,error);
					}
				});
			}
			diskModels.findAll({
				where:{
					id: {[Op.in]: id},
					userId:userId,
					state:'normal'
				},
			}).then((rs)=>{
				if(rs.length){//这里只复制当前请求的
					length=rs.length;
					rs.forEach((item,index)=>{
						let newId=tool.random(10);
						newIdArr.push(newId);
						let object={
							userId:userId,
							id:newId,
							parentId:copyWhere,
							name:item.name+'-1',
							type:item.type,
							fileType:item.fileType,
							size:item.size,
							content:item.content,
							extName:item.extName,
							state:item.state,
						};
						diskModels.create(object).then((rs)=>{
							if(index===0){
								rootCopy={
									id:rs.id,
									parentId:rs.parentId,
									name:rs.name,
									type:rs.type
								};
							}
						}).catch((e)=>{
							resHandle.error(res,e);
						});
					});
					//这里复制请求里的子孙文件
					startDeepCopy(0);
				}else{
					resHandle.error(res,'复制失败，文件/文件夹不存在');
				}
			});
		});
	},
	move:function (req,res,next) {
		let data=global.getData(req);
		let id=data.id;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		if(!data.target||data.target.length===0){
			return resHandle.error(res,'缺少目标目录');
		}
		if(data.id.includes(data.target)){
			return resHandle.error(res,'目标目录有误');
		}
		let userId=req.userInfo.id;
		isFolder(res,userId,data.target,()=>{
			diskModels.update({
				parentId:data.target
			},{
				where:{
					id: {[Op.in]: id},
					userId:userId,
					state:'normal'
				},
			}).then((rs)=>{
				if(rs[0]===id.length){
					resHandle.init(res,{
						data:id,
						msg:"移动完成"
					});
				}else{
					resHandle.error(res,'未全部移动,成功'+rs[0]+'个');
				}
			}).catch((error)=>{
				resHandle.error(res,error);
			});
		});
	},
	trash:function (req,res,next) {
		let data=global.getData(req);
		let id=data.id;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		let userId=req.userInfo.id;
		trashOrRestore(userId,id,res,'trash');
	},
	recover:function (req,res,next) {
		let data=global.getData(req);
		let id=data.id;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		let userId=req.userInfo.id;
		trashOrRestore(userId,id,res,'normal');
	},
	delete:function (req,res,next) {
		let data=global.getData(req);
		if(!data.id||data.id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		let userId=req.userInfo.id;
		let query={
			userId:userId,
		};
		let id=data.id;
		if(id==='all'){
			query[Op.or]= [
				{state: 'child-trash'},
				{state: 'trash'}
			];
		}else{
			query.id={[Op.in]: id};
		}
		diskModels.findAll({
			where:query,
		}).then((rs)=>{
			if(rs.length===0){
				return resHandle.error(res,'所删除的文件不存在');
			}
			if(id!=='all') {
				getTree(userId,id,(result)=>{
					deleteData(res,userId,result,(r,ids)=>{
						resHandle.init(res,{
							data:ids,
							msg:"删除完成"
						});
					});
				},rs);
			}else{
				deleteData(res,userId,rs,(r,ids)=>{
					resHandle.init(res,{
						data:ids,
						msg:"删除完成"
					});
				});
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	uploadVerify:function (req,res,next){
		let data=global.getData(req);
		let	md5=data.md5;//文件md5
		let size=data.size;//文件大小
		diskModels.findOne({
			where: {
				md5: md5,
				size:size,
				type: 'file'
			},
		}).then((rs) => {
			if (rs) {
				addFile(req,res);
			} else {
				chunkUpload.handleVerifyUpload(req,res);//用于验证是否存在已经上传的片段文件
			}
		}).catch((error) => {
			resHandle.error(res,error);
		});
	},
	uploadChunk:function (req,res,next){
		chunkUpload.handleFormData(req,res);
	},
	mergeChunk:function (req,res,next){
		chunkUpload.handleMerge(req,res,()=>{
			addFile(req,res);
		});
	},
	uploadCancel:function (req,res,next){
		chunkUpload.cancelUpload(req,res);
	},
	lrc:function (req,res){
		let data=global.getData(req);
		let basic=process.env.NODE_ENV==='development'?'https://api.zjinh.cn/netase/':'http://localhost:3001/';
		let searchUrl=basic+'search?keywords=';
		let lrcUrl=basic+'lyric?id=';
		let name=encodeURIComponent(data.name);
		superagent.get(searchUrl+name)
			.send() // sends a JSON post body
			.end((err, body) => {
				body=JSON.parse(body.text);
				if(err||body.code!=="200") {
					if(body.code===200){
						let songId=body.result.songs&&body.result.songs[0]&&body.result.songs[0].id;
						if(songId){
							superagent.get(lrcUrl+songId)
								.send() // sends a JSON post body
								.end((err, body) => {
									body=JSON.parse(body.text);
									if(err||body.code!=="200") {
										resHandle.init(res,{
											data:{
												lrc:body.lrc
											}
										});
									}else {
										resHandle.error(res,'找不到歌词');
									}
								});
						}else{
							resHandle.error(res,'找不到对应歌曲');
						}
					}else{
						resHandle.error(res,'服务出错');
					}
				}else {
					resHandle.error(res,'服务异常');

				}
			});
	},
	fileInfo:function (req,res){
		let data=global.getData(req);
		let userId=data.userId||req.userInfo.id;
		if(!data.id||data.id.length===0||!userId||userId.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.findOne({
			where:{
				id:data.id,
				userId:userId
			},
			attributes:['id','name','type','fileType','size','md5','share','parentId','createdAt']
		}).then((rs)=>{
			if(rs) {
				fullyAddress(rs.parentId, [], (address) => {
					address.push({
						id:rs.id,
						name:rs.name,
						parentId:rs.parentId
					});
					resHandle.init(res, {
						data: {
							...rs.dataValues,
							address: address
						}
					});
				});
			}else{
				resHandle.error(res,'找不到该文件/文件夹');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	uploadFolder:function (req,res,next){
		let data=global.getData(req);
		let list=data.folder;
		let parentId=data.parentId;
		let folders=[];
		list.forEach((item)=>{
			if (path.length >= 2) {
				let path = tool.deepCopy(item);
				path.pop();
				folders.push(path);
			}
		});
		list.forEach((path)=>{
			folders.push({
				id: tool.random(10),
				path: path,
				name:path[path.length-1],
				parentId:parentId
			});
		});
		let mainFolder={};
		folders.forEach((item) => {
			if (item.path.length >= 2) {
				let parentPath = tool.deepCopy(item.path);
				parentPath.pop();
				item.parentId = getParent(folders,parentPath);
			} else {
				item.parentId = parentId;
				mainFolder=item;
			}
		});
		let count=0;
		folders.forEach((item)=>{
			diskModels.create({
				id:item.id,
				userId:req.userInfo.id,
				parentId:item.parentId,
				name:item.name,
			}).then((rs)=>{
				if(rs){
					count++;
					if(count===folders.length){
						resHandle.init(res,{
							data:{
								main:{
									...mainFolder,
									type:'folder',
									state:'normal'
								},
								folders:folders
							},
							msg:"文件夹结构创建成功"
						});
					}
				}else{
					count--;
				}
			}).catch((error)=>{
				count--;
			});
		});
	},
	zipUnpack:function (req,res,next){
		let data=global.getData(req);
		let diskSize=req.userInfo.diskSize;
		if(!data.targetId||data.targetId.length===0){
			return resHandle.error(res,'缺少解压目录');
		}
		let files=data.files;
		zipVerify(req,res,async (rs)=>{
			try {
				let zip = zipper.instance(global.diskUrl+rs.content);
				let leftSize=diskSize-await getUsedSize(req);
				let zipInfo=zipper.info(zip);
				let unZipList=[];
				if(files==='all'){
					if(zipInfo.size>leftSize){
						return resHandle.error(res,{
							data:zipInfo.size,
							msg:'剩余空间不足'
						});
					}
					unZipList=zipInfo.list;
				}else{
					zipInfo.list.forEach((item)=>{
						if(files.includes(item.entryName)){
							unZipList.push(item);
						}
					});
					let size=unZipList.reduce((a, b) => {
						a+=b.size;
						return a;
					}, 0);
					if(size>leftSize){
						return resHandle.error(res,{
							data:size,
							msg:'剩余空间不足'
						});
					}
				}
				let list= await zipper.unzip(zip,unZipList,req);
				let resolve=[];
				list.forEach((item)=>{
					resolve.push(new Promise((r)=>{
						diskModels.create({
							id:item.id,
							parentId:item.parentId||1,
							type:item.type,
							userId:req.userInfo.id,
							name:item.name,
							md5:item.type==='file'?item.md5||req.userInfo.id+'_'+item.id:'',
							size:item.size,
							extName:item.extName,
							content:item.content,
							fileType:getFileType(item.extName)
						}).then(()=>{
							r();
						});
					}));
				});
				Promise.all(resolve).then(values => {
					resHandle.init(res,{
						msg:'解压成功'
					});
				});
			}catch (e){
				resHandle.error(res,'无法解压该压缩包');
			}
		});
	},
	zipInfo:function (req,res,next){
		zipVerify(req,res,async (rs)=>{
			try {
				let zip = zipper.instance(global.diskUrl+rs.content);
				let zipInfo=zipper.info(zip);
				zipInfo.list.forEach((item)=>{
					item.extName=path.extname(item.name).toLowerCase();
				});
				resHandle.init(res,{
					data:zipInfo
				});
			}catch (e){
				resHandle.error(res,'无法获取压缩包信息');
			}
		});
	},
	zipPack:function (req,res,next){

	},
	getContent:function (req,res,next){
		let data=global.getData(req);
		let id=data.id;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		let userId=req.userInfo.id;
		diskModels.findOne({
			where:{
				id:data.id,
				userId:userId,
				type:'file'
			},
			attributes:['content']
		}).then((rs)=>{
			if(rs) {
				let fileUrl=global.diskUrl+rs.content;
				try{
					const buffer= fileHandle.get(fileUrl);
					resHandle.init(res,{
						data:String(buffer)
					});
				}catch (e){
					resHandle.error(res,{
						msg:'无法加载文件'
					});
				}

			}else{
				resHandle.error(res,'找不到该文件');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	shareInfo:function (req,res,next){
		let code=req.params.code;
		let pass=global.getData(req).pass;
		if(!code||code.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.belongsTo(userModels, { foreignKey: 'userId', targetKey: 'id' });
		diskModels.findOne({
			include:[{
				model:userModels,
				required: false,
				attributes: ['avatar','name','sign','id'],
			}],
			where:{
				share:code
			},
			attributes:{ exclude: ['createdAt','state','md5','userId'] }
		}).then((rs)=>{
			if(rs){
				let sharePass=rs.sharePass;
				let data=JSON.parse(JSON.stringify((rs)));
				delete data.sharePass;
				if(sharePass){
					if(pass===sharePass){
						resHandle.init(res,{
							data:data
						});
					}else{
						resHandle.init(res,{
							data:{
								name:data.name,
								type:data.type,
								thumb:data.thumb,
								extName:data.extName,
								user:data.user
							},
							msg:pass&&pass.length?"提取码错误":"请输入提取码",
							code:1000
						});
					}
				}else{
					resHandle.init(res,{
						data:data
					});
				}
			}else{
				resHandle.error(res,'分享失效或不存在');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	saveShare:function (req,res,next){
		let data=global.getData(req);
		let id=data.id;
		let shareWhere=data.target;
		if(!id||id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		if(!shareWhere||shareWhere.length===0){
			return resHandle.error(res,'缺少目标目录');
		}
		let userId=req.userInfo.id;
		if(id.includes(shareWhere)){
			return resHandle.error(res,'目标目录有误');
		}
		isFolder(res,userId,shareWhere,()=>{
			let newIdArr=[];//存放新的id
			let length=0;//需要复制几次
			let shareUserId='';
			function startDeepCopy(count) {
				deepCopy({
					userId:shareUserId,
					newUserId:userId,
					id:id[count],
					newParent:newIdArr[count],
				},(error)=>{
					if(!error){
						count++;
						if(count===length){
							resHandle.init(res,{
								data:null,
								msg:'保存成功'
							});
						}else{
							startDeepCopy(count);
						}
					}else{
						resHandle.error(res,error);
					}
				});
			}
			diskModels.findAll({
				where:{
					id: {[Op.in]: id},
					state:'normal'
				},
			}).then((rs)=>{
				if(rs.length){//这里只复制当前请求的
					if(rs[0].userId===userId){
						resHandle.error(res,'无法保存自己分享的文件');
						return;
					}
					shareUserId=rs[0].userId;
					length=rs.length;
					rs.forEach((item,index)=>{
						let newId=tool.random(10);
						newIdArr.push(newId);
						let object={
							userId:userId,
							id:newId,
							parentId:shareWhere,
							name:item.name,
							type:item.type,
							fileType:item.fileType,
							size:item.size,
							content:item.content,
							extName:item.extName,
							state:item.state,
						};
						diskModels.create(object).then((rs)=>{}).catch((e)=>{
							resHandle.error(res,e);
						});
					});
					//这里复制请求里的子孙文件
					startDeepCopy(0);
				}else{
					resHandle.error(res,'保存失败');
				}
			});
		});
	},
	shareCreate:function (req,res,next){
		let data=global.getData(req);
		let userId=req.userInfo.id;
		let shareCode=tool.randomStr(6);
		let sharePass=data.pass;
		if(!data.id||data.id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.update({
			share:shareCode,
			sharePass:sharePass
		},{
			where:{
				id:data.id,
				userId:userId
			}
		}).then((rs)=>{
			if(rs[0]){
				resHandle.init(res,{
					data:shareCode,
					msg:"分享成功"
				});
			}else{
				resHandle.error(res,'分享失败');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	shareCancel:function (req,res,next){
		let data=global.getData(req);
		let userId=req.userInfo.id;
		if(!data.id||data.id.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.update({
			share:null,
			sharePass:null
		},{
			where:{
				id:data.id,
				userId:userId
			}
		}).then((rs)=>{
			if(rs[0]){
				resHandle.init(res,{
					data:data,
					msg:"分享已取消"
				});
			}else{
				resHandle.error(res,'取消分享失败');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	shareFileList:function (req,res,next){
		let data=global.getData(req);
		let userId=data.userId;
		if(!data.id||data.id.length===0||!userId||userId.length===0){
			return resHandle.error(res,'缺少参数');
		}
		diskModels.findAll({
			where:{
				userId:userId,
				parentId:data.id,
			},
			//order:["name"],
			attributes: diskAttributes,
		}).then((rs)=>{
			resHandle.init(res,{data:rs});
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	}
};
