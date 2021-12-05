const tool=require("../utils/tool");
const path=require('path');
const styleAllModels  = require('../models').styleAll;

module.exports={
	list:function (req, res, next) {
		let data=global.getData(req);
		let page = parseInt(data.page) || 1;
		let limit = parseInt(data.limit) || 1000;
		styleAllModels.findAndCountAll({
			where:{},
			limit: limit,
			distinct:true,
			offset: (page - 1) * limit
		}).then((rs)=>{
			resHandle.init(res,{data: rs});
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	create:function (req, res, next) {
		let data=global.getData(req);
		styleAllModels.create(data).then((rs)=>{
			if(rs){
				resHandle.init(res, {data: rs});
			}else{
				resHandle.error(res,"文件添加失败");
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	update:function (req, res, next) {
		let data=global.getData(req);
		styleAllModels.findAll({
			where: {
				...data
			},
			attributes: { exclude: ['createdAt','updatedAt','sex'] }, //过滤属性
		}).then(function(rs){
			if(rs){
				resHandle.init(res, {data: rs});
			}else{
				resHandle.error(res,'登录失败,用户不存在');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	delete:function (req, res, next) {
		let data=global.getData(req);
		styleAllModels.destroy({
			where:{
				id:data.id
			}
		}).then((rs)=>{
			resHandle.init(res, {data: rs});
		}).catch((e)=>{
			resHandle.error(res,e);
		});
	},
};
