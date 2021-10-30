'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('samples', {  
			id : {
				type: Sequelize.INTEGER(11),
				primaryKey: true, 
				autoIncrement: true
			},
			name:{
				type:Sequelize.STRING,
				comment:"商品名称",
				notNull:true
			},
			nickName:{
				type:Sequelize.STRING,
				comment:"别称",
			},
			brandName:{
				type:Sequelize.STRING,
				comment:"品牌名称"	
			},
			content: {
				type:Sequelize.STRING,
				comment:"含量",
			},
			classify:{
				type:Sequelize.STRING,
				comment:"分类",
			},
			nationality:{
				type:Sequelize.STRING,
				comment:"国籍",
				notNull: true,
			},
			price:{
				type:Sequelize.INTEGER,
				comment:"价格",
			},
			effect:{
				type:Sequelize.TEXT,
				comment:"功效",
			},
			detail:{
				type:Sequelize.STRING,
				comment:"详情"
			},
			image:{
				type:Sequelize.STRING,
				comment:"图片",
				notNull: true,
			},
			
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
