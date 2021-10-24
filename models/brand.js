'use strict';
module.exports = (sequelize, DataTypes) => {
	const good = sequelize.define('good', {
		name:{
			type:DataTypes.STRING,
			comment:"商品名称",
			notNull:true
		},
		nickname:{
			type:DataTypes.STRING,
			comment:"别称",
		},
		brandId:{
			type:DataTypes.STRING,
			comment:"品牌id"	
		},
		content: {
			type:DataTypes.STRING,
			comment:"含量",
		},
		classify:{
			type:DataTypes.STRING,
			comment:"分类",
		},
		nationality:{
			type:DataTypes.STRING,
			comment:"国籍",
			notNull: true,
		},
		price:{
			type:DataTypes.INTEGER,
			comment:"价格",
		},
		effect:{
			type:DataTypes.TEXT,
			comment:"功效",
		},
		detail:{
			type:DataTypes.STRING,
			comment:"详情"
		},
		image:{
			type:DataTypes.STRING,
			comment:"图片",
			notNull: true,
		},
	}, {});
	good.associate = function(models) {
		// associations can be defined here
	};
	return good;
};
