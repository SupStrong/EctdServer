'use strict';
module.exports = (sequelize, DataTypes) => {
	const brand = sequelize.define('brand', {
		name:{
			type:DataTypes.STRING,
			comment:"品牌名称",
			notNull:true
		},
		nickName:{
			type:DataTypes.STRING,
			comment:"别称别称",
		},
		nationality:{
			type:DataTypes.STRING,
			comment:"国籍",
			notNull: true,
		},
	}, {});
	brand.associate = function(models) {
		// associations can be defined here
	};
	return brand;
};
