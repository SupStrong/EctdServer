'use strict';
module.exports = (sequelize, DataTypes) => {
	const styleAll = sequelize.define('styleAll', {
		styleLevel:{
			type:DataTypes.STRING(2000),
			comment:"样式",
			notNull:true
		},
	}, {});
	styleAll.associate = function(models) {
		// associations can be defined here
	};
	return styleAll;
};
