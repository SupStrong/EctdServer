'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('disks', { 
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
			parentId:{
				type:Sequelize.INTEGER(11),//父级id
				comment:"父级id",
				notNull: true,
			},
			name: {
				type:Sequelize.STRING,
				comment:"文件名",
				notNull: true,
				validate: {
					notEmpty:{
						msg:'文件/文件夹名称不能为空'
					},
					notContains(value){
						if(tool.validateFileName(value)){
							throw '文件/文件夹名称不能包含【\\\\\\\\/:*?\\"<>|】';
						}
					}
				}
			},
			type:{
				type:Sequelize.ENUM('file', 'folder'),//文件还是文件夹
				comment:"文件/文件夹",
				defaultValue: 'folder',
				notNull: true,
			},
			fileType:{
				type:Sequelize.STRING,//文件类型
				comment:"文件类型",
				notNull: true,
			},
			size:{
				type:Sequelize.STRING,//文件类型
				comment:"文件大小",
				defaultValue:'0',
			},
			content:{
				type:Sequelize.TEXT,//文件url，由用户id/disk/文件名组成
				comment:"存储在服务器文件名",
			},
			thumb:{
				type:Sequelize.TEXT,//和content同文件名
				comment:"缩略图",
			},
			extName:{
				type:Sequelize.STRING,//文件类型
				comment:"文件扩展名"
			},
			state:{
				type:Sequelize.ENUM('normal', 'trash','child-trash'),//文件状态,第三个是子目录的回收状态
				comment:"正常/回收",
				defaultValue: 'normal',
			},
			md5:{
				type:Sequelize.STRING,//文件md5
				comment:"文件md5"
			},
			share:{
				type:Sequelize.STRING,//分享码
				comment:"分享码",
				unique: {
					msg:"分享码已被使用"
				},
			},
			sharePass:{
				type:Sequelize.STRING,//分享密码
				comment:"分享密码"
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
