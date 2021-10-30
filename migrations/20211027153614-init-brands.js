'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		
		return queryInterface.createTable('brands', { 
			id : {
				type: Sequelize.INTEGER(11),
				primaryKey: true, 
				autoIncrement: true
			},
			name:{
				type:Sequelize.STRING,
				comment:"品牌名称",
				notNull:true
			},
			nickName:{
				type:Sequelize.STRING,
				comment:"别称别称",
			},
			nationality:{
				type:Sequelize.STRING,
				comment:"国籍",
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
