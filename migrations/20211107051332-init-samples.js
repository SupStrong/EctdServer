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
			brandId:{
				type:Sequelize.STRING,
				comment:"品牌id"	
			},
			content: {
				type:Sequelize.STRING,
				comment:"含量",
			},
			categoryId:{
				type:Sequelize.STRING,
				comment:"分类id",
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
