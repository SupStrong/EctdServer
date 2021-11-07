const tool=require("../utils/tool");
const path=require('path');
const companyTableModels  = require('../models').companyTable;

module.exports={
	list:function (req, res, next) {
		let data=global.getData(req);
		companyTableModels.findAll({
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
	create:function (req, res, next) {
		let data=global.getData(req);
		console.log(data,"data");
		companyTableModels.create(data).then((rs)=>{
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
		companyTableModels.findAll({
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
		companyTableModels.destroy({
			where:{
				userId:data.id
			}
		}).then((res)=>{
			resHandle.init(res, {data: rs});
		}).catch((e)=>{
			resHandle.error(res,e);
		});
	},
};
