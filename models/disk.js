'use strict';
const tool=require("../utils/tool");
module.exports = (sequelize, DataTypes) => {
	const disk = sequelize.define('disk', {
		userId:{
			type:DataTypes.INTEGER(11),//用户id
			comment:"用户id",
			notNull:true
		},
		parentId:{
			type:DataTypes.INTEGER(11),//父级id
			comment:"父级id",
			notNull: true,
		},
		name: {
			type:DataTypes.STRING,
			comment:"文件名",
			notNull: true,
			validate: {
				notEmpty:{
					msg:'文件/文件夹名称不能为空'
				}
			}
		},
		type:{
			type:DataTypes.ENUM('file', 'folder'),//文件还是文件夹
			comment:"文件/文件夹",
			defaultValue: 'folder',
			notNull: true,
		},
		fileType:{
			type:DataTypes.STRING,//文件类型
			comment:"文件类型",
			notNull: true,
		},
		size:{
			type:DataTypes.STRING,//文件类型
			comment:"文件大小",
			defaultValue:'0',
		},
		content:{
			type:DataTypes.TEXT,//文件url，由用户id/disk/文件名组成
			comment:"存储在服务器文件名",
		},
		thumb:{
			type:DataTypes.TEXT,//和content同文件名
			comment:"缩略图",
		},
		extName:{
			type:DataTypes.STRING,//文件类型
			comment:"文件扩展名"
		},
		state:{
			type:DataTypes.ENUM('normal', 'trash','child-trash'),//文件状态,第三个是子目录的回收状态
			comment:"正常/回收",
			defaultValue: 'normal',
		},
		md5:{
			type:DataTypes.STRING,//文件md5
			comment:"文件md5"
		},
		share:{
			type:DataTypes.STRING,//分享码
			comment:"分享码",
			unique: {
				msg:"分享码已被使用"
			},
		},
		sharePass:{
			type:DataTypes.STRING,//分享密码
			comment:"分享密码"
		},
		parentName:{
			type:DataTypes.STRING,//分享密码
			comment:"父级名称"
		}
	}, {});
	disk.associate = function(models) {
		// associations can be defined here
	};
	return disk;
};
