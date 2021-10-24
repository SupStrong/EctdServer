'use strict';
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		name: {
			type:DataTypes.STRING,
			comment:"用户名",
			notNull: true,
			unique: {
				msg:"该用户名已被使用"
			},
			validate: {
				len: {
					args:[3,15],
					msg:'用户名长度在3-15位之间'
				},
				notEmpty:{
					msg:'禁止使用空字符等'
				},
				notSpace(value){
					if(value.indexOf(' ')>-1){
						throw "用户名不能含有空格";
					}
				},
				notContains(value){
					value=value.toLowerCase();
					if(value.Exist('admin,管理员,管理')){
						throw "用户名含有违规字符";
					}
				}
			}
		},
		account: {
			type:DataTypes.STRING,
			comment:"Cloud账户",
			unique: {
				msg:"系统错误，Cloud账户重复"
			},
		},
		password: {
			type:DataTypes.TEXT,
			comment:"密码",
			notNull: true,
			validate:{
				len: {
					args:[5],
					msg:'密码长度过短'
				},
				notEmpty:{
					msg:'禁止使用空格'
				}
			}
		},
		avatar:{
			type:DataTypes.TEXT,
			defaultValue:'normal.jpg',
			comment:"头像",
			get(){
				return global.resourceUrl+'avatar/'+this.getDataValue('avatar');
			}
		},
		phone: {
			type:DataTypes.INTEGER(20),
			comment:"手机号",
			unique: {
				msg:"该手机号已绑定"
			},
		},
		email: {
			type:DataTypes.STRING,
			comment:"邮箱",
			notNull: true,
			unique: {
				msg:"该邮箱已被注册"
			},
			validate:{
				isEmail: {
					msg:"邮箱格式不正确"
				},
			}
		},
		emailCode: {
			type:DataTypes.STRING,//邮箱验证码
			comment:"邮箱验证码"
		},
		sex: {
			type:DataTypes.ENUM('1', '0','2'),//男女,不指定
			comment:"性别（男女,不指定）"
		},
		sign: {
			type:DataTypes.TEXT,//个性签名
			comment:"个性签名"
		},
		birthDay: {
			type:DataTypes.DATE,//生日
			defaultValue: sequelize.fn('now'),
			comment:"生日"
		},
		loginTime: {
			type:DataTypes.DATE,
			comment:"登录时间"
		},
		diskSize:{
			type:DataTypes.INTEGER,
			comment:"网盘大小",
			defaultValue:1073741824,//1GB
		},
		tokenKey:{
			type:DataTypes.STRING,
			comment:"tokenKey",
		}
	}, {});
	user.associate = function(models) {
		// associations can be defined here
	};
	return user;
};
