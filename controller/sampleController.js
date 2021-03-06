const tool=require("../utils/tool");
const path=require('path');
const sampleModels  = require('../models').sample;
const categorymenuModels  = require('../models').categorymenu;
const brandModels  = require('../models').brand;
module.exports={
	list:function (req, res, next) {
		let data=global.getData(req);
		let page = parseInt(data.page) || 1;
		let limit = parseInt(data.limit) || 10;
		sampleModels.belongsTo(categorymenuModels, { foreignKey: 'categoryId', targetKey: 'id' });
		sampleModels.belongsTo(brandModels, { foreignKey: 'brandId', targetKey: 'id' });
		sampleModels.findAndCountAll({
			where:{},
			include:[{
				model:categorymenuModels,
				required: false,
				attributes: { exclude: ['createdAt','updatedAt'] },
			},
			{
				model:brandModels,
				required: false,
				attributes: { exclude: ['createdAt','updatedAt'] },
			}],
			limit: limit,
			distinct:true,
			offset: (page - 1) * limit,
			attributes: { exclude: ['createdAt','updatedAt'] }, //过滤属性
		}).then((rs)=>{
			let newArr = [];
			rs.rows.forEach((item,index)=>{
				let object = {
					id: item.id,
					name: item.name,
					brandId: item.brandId,
					content: item.content,
					categoryId: item.categoryId,
					price: item.price,
					effect: item.effect,
					detail: item.detail,
					image: item.image,
					brandName:item.brand != null ? item.brand.name : '',
					nationality:item.brand != null ? item.brand.nationality : '',
					nickName:item.brand != null ? item.brand.nickName : '',
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
		sampleModels.findOne({
			where: {
				name: data.name
			}
		}).then((rs) => {
			if(rs){
				resHandle.error(res,"已有此名称");
			}else{
				sampleModels.create(data).then((rs)=>{
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
		sampleModels.findAll({
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
		sampleModels.destroy({
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
