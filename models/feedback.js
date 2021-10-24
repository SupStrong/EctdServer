'use strict';
module.exports = (sequelize, DataTypes) => {
	const feedback = sequelize.define('feedback', {
		userId:{
			type:DataTypes.INTEGER(11),//用户id
			comment:"用户id",
			notNull:true
		},
		app:{
			type:DataTypes.STRING,
			comment:"应用名称",
			notNull: true,
		},
		version: {
			type:DataTypes.STRING,
			comment:"版本号",
			notNull: true,
		},
		title:{
			type:DataTypes.STRING,
			comment:"反馈标题",
			notNull: true,
		},
		content: {
			type:DataTypes.TEXT,//反馈详情
			comment:"反馈详情"
		},
		state:{
			type:DataTypes.ENUM('get','start','finish'),//反馈状态
			defaultValue:'get',
			comment:"收到/开始/完成",
		}
	}, {});
	feedback.associate = function(models) {
		// associations can be defined here
	};
	return feedback;
};
