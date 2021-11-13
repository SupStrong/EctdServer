'use strict';
module.exports = (sequelize, DataTypes) => {
	const imgText = sequelize.define('imgText', {
		name:{
			type:DataTypes.STRING,
			comment:"文案",
			notNull:true
		},
		categoryId:{
			type:DataTypes.STRING,
			comment:"分类id",
			notNull:true
		}
	}, {});
	imgText.associate = function(models) {
		// associations can be defined here
	};
	return imgText;
};
