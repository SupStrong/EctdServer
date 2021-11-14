const tool=require("../utils/tool");
const path=require('path');
const imgTextModels  = require('../models').imgText;
const categorymenuModels  = require('../models').categorymenu;

module.exports={
	list:function (req, res, next) {
		let data=global.getData(req);
		let page = parseInt(data.page) || 1;
		let limit = parseInt(data.limit) || 10;
		imgTextModels.belongsTo(categorymenuModels, { foreignKey: 'categoryId', targetKey: 'id' });
		imgTextModels.findAndCountAll({
			where:{},
			include:[{
				model:categorymenuModels,
				required: false,
				attributes: { exclude: ['createdAt','updatedAt'] },
			}],
			limit: limit,
			distinct:true,
			offset: (page - 1) * limit
		}).then((rs)=>{
			let newArr = [];
			rs.rows.forEach((item,index)=>{
				let object = {
					id:item.id,
					name: item.name,
					categoryId:item.categoryId,
					categoryName:item.categorymenu != null ? item.categorymenu.name : ''
				};
				newArr.push(object);
			});
			resHandle.init(res,{data: {count:rs.count,rows:newArr}});
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	create:function (req, res, next) {
		let data=global.getData(req);
		imgTextModels.findOne({
			where: {
				name: data.name
			}
		}).then((rs) => {
			if(rs){
				resHandle.error(res,"已有此名称");
			}else{
				imgTextModels.create(data).then((rs)=>{
					if(rs){
						resHandle.init(res, {data: rs});
					}else{
						resHandle.error(res,"文件添加失败");
					}
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			}
		});
	},
	update:function (req, res, next) {
		let data=global.getData(req);
		imgTextModels.findAll({
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
		imgTextModels.destroy({
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
