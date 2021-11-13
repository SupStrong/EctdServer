'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('imgtexts', { 
			id : {
				type: Sequelize.INTEGER(11),
				primaryKey: true, 
				autoIncrement: true
			},
			categoryId : {
				type: Sequelize.INTEGER(11),
				comment:"分类id",
				notNull:true
			},
			name:{
				type:Sequelize.STRING,
				comment:"文案",
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
