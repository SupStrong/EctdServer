'use strict';
module.exports = (sequelize, DataTypes) => {
	const companyTable = sequelize.define('companyTable', {
		name:{
			type:DataTypes.STRING,
			comment:"含量",
			notNull:true
		}
	}, {});
	companyTable.associate = function(models) {
		// associations can be defined here
	};
	return companyTable;
};
