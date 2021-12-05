'use strict';
module.exports = (sequelize, DataTypes) => {
	const templateAll = sequelize.define('templateAll', {
		swiperBanner:{
			type:DataTypes.STRING(5000),
			comment:"轮播数据",
			notNull:true
		},
		imgToData:{
			type:DataTypes.STRING(5000),
			comment:"填充图片",
			notNull:true
		},
		currentSwiper:{
			type:DataTypes.STRING(1000),
			comment:"当前文件夹",
			notNull:true
		},
		newSwiperBanner:{
			type:DataTypes.STRING(5000),
			comment:"所有数据",
			notNull:true
		}
	}, {});
	templateAll.associate = function(models) {
		// associations can be defined here
	};
	return templateAll;
};
