'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('templateAlls', {
			id : {
				type: Sequelize.INTEGER(11),
				primaryKey: true, 
				autoIncrement: true
			},
			swiperBanner:{
				type:Sequelize.STRING(5000),
				comment:"轮播数据",
				notNull:true
			},
			imgToData:{
				type:Sequelize.STRING(5000),
				comment:"填充图片",
				notNull:true
			},
			currentSwiper:{
				type:Sequelize.STRING(500),
				comment:"当前文件夹",
				notNull:true
			},
			newSwiperBanner:{
				type:Sequelize.STRING(3000),
				comment:"所有数据",
				notNull:true
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
