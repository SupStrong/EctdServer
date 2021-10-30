'use strict';
module.exports = (sequelize, DataTypes) => {
	const classify = sequelize.define('classify', {
		name:{
			type:DataTypes.STRING,
			comment:"品牌名称",
			notNull:true
		}
	}, {});
	classify.associate = function(models) {
		// associations can be defined here
	};
	return classify;
};
