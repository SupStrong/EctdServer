'use strict';
module.exports = (sequelize, DataTypes) => {
	const categorymenu = sequelize.define('categorymenu', {
		name:{
			type:DataTypes.STRING,
			comment:"品牌名称",
			notNull:true
		}
	}, {});
	categorymenu.associate = function(models) {
		// associations can be defined here
	};
	return categorymenu;
};
