'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('feedbacks', {
			id : {
				type: Sequelize.INTEGER(11),
				primaryKey: true, 
				autoIncrement: true
			},
			userId:{
				type:Sequelize.INTEGER(11),//用户id
				comment:"用户id",
				notNull:true
			},
			app:{
				type:Sequelize.STRING,
				comment:"应用名称",
				notNull: true,
			},
			version: {
				type:Sequelize.STRING,
				comment:"版本号",
				notNull: true,
			},
			title:{
				type:Sequelize.STRING,
				comment:"反馈标题",
				notNull: true,
			},
			content: {
				type:Sequelize.TEXT,//反馈详情
				comment:"反馈详情"
			},
			state:{
				type:Sequelize.ENUM('get','start','finish'),//反馈状态
				defaultValue:'get',
				comment:"收到/开始/完成",
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		/**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
	}
};
