const userModels  = require('../models').user;
const feedBackModels=require('../models').feedback;
const jwt = require('jsonwebtoken');  //用来生成token
const tool=require("../utils/tool");
const captchaPng = require('captchapng');
const sendEmail= require('../utils/email');
const fileHandle =require('../utils/fileHandle');

const expTime=60*60*24;//redis、token单位24小时过期
function errorHandle() {}
function startLogin(res,data) {
	let token='';
	let {name,id,phone,email,account,diskSize} = data; // 要生成token的主题信息
	let tokenFlag=new Date().getTime();
	let tokenKey=tokenFlag+'_'+data.id;
	token = jwt.sign({key:tokenFlag,id}, global.tokenKey, {
		expiresIn: expTime
	});
	return userModels.update({
		loginTime:global.sequelize.fn('now'),
		tokenKey:tokenKey
	},{
		where:{
			id:data.id
		}
	}).then((r)=>{
		if(r[0]){
			res.header('Authorization',token);
			redis.set('token_'+tokenKey, {id,name,phone,email,diskSize},expTime);
			delete data.password;
			resHandle.init(res,{
				data: {id,name,account},
				msg:'登录成功，欢迎回来'+name
			});
			try{
				fileHandle.createFolder('uploads/'+data.id);
			}catch (e) {
				errorHandle(e);
			}
		}else{
			resHandle.error(res,'登录失败，系统错误');
		}
	});
}
function updateInfo(req,res,data){
	userModels.update(data,{
		where:{
			id:req.userInfo.id
		}
	}).then((rs)=>{
		if(rs[0]){
			resHandle.init(res,{
				data:data,
				msg:"个人信息已更新"
			});
		}else{
			resHandle.error(res,'个人信息更新失败');
		}
	}).catch((error)=>{
		resHandle.error(res,error);
	});
}
module.exports={
	login:function (req, res, next) {
		let data=global.getData(req);
		if(!data.username||data.username.length===0){
			return resHandle.error(res,'用户名/手机号/账户不能为空');
		}
		if(!data.password||data.password.length===0){
			return resHandle.error(res,'密码不能为空');
		}
		data.password=tool.sha256(data.password);
		userModels.findOne({
			where: {
				[Op.or]: {
					name: data.username,
					phone: data.username,
					account:data.username
				}
			},
			attributes: { exclude: ['createdAt','updatedAt','sex'] }, //过滤属性
		}).then(function(rs){
			if(rs){
				if(rs.emailCode){
					resHandle.init(res,{
						data:{
							name:rs.name,
							id:rs.id,
						},
						msg:"登录失败，请先验证邮箱"+rs.email,
						code:3
					});
				}else {
					if(rs.password===data.password){
						if(rs.tokenKey){
							redis.set('token_'+rs.tokenKey, {},1);
						}
						startLogin(res, rs);
					}else{
						resHandle.error(res,'登录失败,用户名或密码错误');
					}
				}
			}else{
				resHandle.error(res,'登录失败,用户不存在');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	logout:function(req,res,next){
		if(req.userInfo){
			let tokenKey=req.userInfo.tokenKey;
			res.header('Authorization',false);
			redis.set('token_'+tokenKey, {},1);
			resHandle.init(res,{
				msg:'注销成功'
			});
		}else{
			resHandle.error(res,'未登录，无法注销');
		}
	},
	register:function (req, res, next) {
		let data=global.getData(req);
		if(!data.name||data.name.length===0){
			return resHandle.error(res,'用户名不能为空');
		}
		if(!data.password||data.password.length===0){
			return resHandle.error(res,'密码不能为空');
		}
		if(data.password.indexOf(' ')>-1){
			return resHandle.error(res,'密码不能有空格');
		}
		if(!data.email||data.email.length===0){
			return resHandle.error(res,'邮箱不能为空');
		}
		if(!tool.verifyEmail(data.email)){
			return resHandle.error(res,'邮箱地址不正确');
		}
		if(!data.code||data.code.length===0){
			return resHandle.error(res,'验证码不能为空');
		}
		redis.get('verifyCode').then((rs)=>{
			if(rs&&rs.toString()===data.code.toString()){
				data.password=tool.sha256(data.password);
				let {name,password,email}=data;
				let id=tool.random(10);//10位的用户id
				let account=tool.random(9);//9位的账号
				let sex='1';//男
				let emailCode=tool.random(6);//邮箱验证码
				userModels.create({id,account,name,password,email,sex,emailCode}).then((rs)=>{
					sendEmail({
						type:'register',
						username:name,
						to:email,
						data:[emailCode,id],
					});
					resHandle.init(res,{
						data:{name,account,email,id},
						msg:"注册成功，快去验证邮箱吧",
					});
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			}else{
				return resHandle.error(res,'验证码错误',2);
			}
		});
	},
	forget:function(req,res,next){
		let data=getData(req);
		if(!data.name||data.name.length===0){
			return resHandle.error(res,'用户名不能为空');
		}
		if(!data.email||data.email.length===0){
			return resHandle.error(res,'邮箱不能为空');
		}
		if(!data.code||data.code.length===0){
			return resHandle.error(res,'验证码不能为空');
		}
		redis.get('verifyCode').then((rs)=>{
			if(rs&&rs.toString()===data.code.toString()){
				userModels.findOne({
					where:{
						name:data.name,
						email:data.email
					}
				}).then((rs)=>{
					if(rs){
						let originPassword=tool.random(6).toString();
						let password=tool.sha256(originPassword);
						userModels.update({
							password:password,
						},{
							where:{
								id:rs.id
							}
						}).then((result)=>{
							if(result[0]){
								resHandle.init(res,{
									msg:'我们已经重置了您的密码，请查看'+tool.handleEmail(data.email),
									data:data
								});
								sendEmail({
									type:'forgetPassword',
									to:data.email,
									username:data.name,
									data:originPassword
								});
							}else{
								resHandle.error(res,'我们找到了您的账户，但重置密码失败了');
							}
						}).catch((error)=>{
							resHandle.error(res,error);
						});
					}else{
						resHandle.error(res,'用户不存在');
					}
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			}else{
				return resHandle.error(res,'验证码错误',2);
			}
		});
	},
	verify:function(req,res,next){
		let data=global.getData(req);
		if(!data.verifyCode||data.verifyCode.length===0){
			return resHandle.error(res,'邮箱验证码不能为空');
		}
		if(!data.code||data.code.length===0){
			return resHandle.error(res,'验证码不能为空');
		}
		redis.get('verifyCode').then((rs)=>{
			if(rs&&rs.toString()===data.code.toString()){
				userModels.findOne({
					where:{
						id:data.id,
					}
				}).then((rs)=>{
					if(rs){
						if(rs.emailCode){
							userModels.update({
								emailCode:'',
							},{
								where:{
									id:data.id,
									emailCode:data.verifyCode
								}
							}).then((r)=>{
								if(r[0]){
									resHandle.init(res,{
										data:"",
										msg:"验证成功，快去登录吧",
									});
								}else{
									return resHandle.error(res,'验证失败，请检查信息是否有误');
								}
							}).catch((error)=>{
								resHandle.error(res,error);
							});
						}else{
							return resHandle.error(res,'您已验证邮箱');
						}
					}else{
						return resHandle.error(res,'验证失败，未找到该用户');
					}
				}).catch((error)=>{
					resHandle.error(res,error);
				});
			}else{
				return resHandle.error(res,'验证码错误',2);
			}
		});
	},
	resend:function(req,res,next){
		let data=global.getData(req);
		if(!data.id||data.id.length===0){
			return resHandle.error(res,'重要参数缺失');
		}
		switch (data.type) {
		case 'register':
			userModels.findOne({
				where:{
					id:data.id
				}
			}).then((rs)=>{
				if(rs){
					sendEmail({
						type:'register',
						username:data.name,
						to:rs.email,
						data:[rs.emailCode,data.id]
					});
					resHandle.init(res,{
						data:null,
						msg:"邮件已重新发送到"+rs.email||'[开发者邮箱]',
					});
				}else{
					resHandle.error(res,'发送失败，信息错误');
				}
			}).catch((error)=>{
				resHandle.error(res,error);
			});
			break;
		case 'forget':

			break;
		default:
			resHandle.error(res,'邮件类型有误');
			break;
		}
	},
	verifyCode:function (req, res, nex) {
		let code = parseInt(Math.random() * 9000 + 1000);//有且仅有4个数字
		redis.set('verifyCode',code,60*2);//用于验证接口获取文字码;
		let p = new captchaPng(100, 30, code);//宽100 高30 四位数字
		p.color(0, 0, 0, 0);//底色
		p.color(80, 80, 80, 255);//字体颜色
		p.pindex=1;
		p.pix_size=10;
		let img = p.getBase64();//转换成base64
		let imgBase64 = new Buffer.from(img, 'base64');// 存放在imgbase64
		res.writeHead(200, {
			'Content-Type': 'image/png'
		});
		res.end(imgBase64);
	},
	info:function (req, res, next) {
		let id=req.userInfo!==undefined?req.userInfo.id:req.params.id;
		if(!id){
			return resHandle.error(res,'缺少参数');
		}
		userModels.findOne({
			where: {
				id:id
			},
			attributes: { exclude: ['updatedAt','password','token','loginTime','emailCode','tokenKey'] }, //过滤属性
		}).then(function(data){
			if(data){
				data.email=tool.handleEmail(data.email);
				data.phone=tool.handlePhone(data.phone);
				resHandle.init(res,{
					data:data
				});
			}else{
				resHandle.error(res,'用户不存在');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	update:function(req, res, next){
		let data=global.getData(req);
		if(!data.name||data.name.length===0){
			return resHandle.error(res,'用户名不能为空');
		}
		if(data.name.length>15){
			return resHandle.error(res,'用户名过长');
		}
		if(req.files.avatar){
			let type=fileHandle.getType(req.files.avatar);
			if(type.Exist('png,jpeg,jpg,gif')){
				fileHandle.upload(req.files.avatar,req.userInfo.id+type,'avatar').then(({file, path})=>{
					data.avatar=file;
					if(data.old_avatar){
						fileHandle.delete(path+data.old_avatar);
					}
					let {name,birthDay,sex,sign,avatar}=data;
					updateInfo(req,res,{name,birthDay,sex,sign,avatar});
				}).catch((e)=>{
					return resHandle.error(res,e);
				});
			}else{
				return resHandle.error(res,'头像文件格式错误');
			}
		}else{
			let {name,birthDay,sex,sign}=data;
			updateInfo(req,res,{name,birthDay,sex,sign});
		}
	},
	updatePassword:function(req, res, next){
		let id=req.userInfo.id;
		let data=global.getData(req);
		if(!data.password||data.password.length===0){
			return resHandle.error(res,'请输入原来的密码以验证您的身份');
		}
		if(!data.newPassword||data.newPassword.length===0){
			return resHandle.error(res,'新的密码不能为空');
		}
		if(data.newPassword.indexOf(' ')>-1){
			return resHandle.error(res,'密码不能有空格');
		}
		data.password=tool.sha256(data.password);
		data.newPassword=tool.sha256(data.newPassword);
		if(data.newPassword===data.password){
			return resHandle.error(res,'新旧密码不能一致');
		}
		userModels.findOne({
			where:{
				id:id,
				password:data.password
			}
		}).then((rs)=>{
			if(rs){
				if(rs.id===id){
					userModels.update({
						password:data.newPassword
					},{
						where:{
							id:id
						}
					}).then((result)=>{
						if(result[0]){
							resHandle.init(res,{
								msg:'密码已更改，请牢记您的新密码'
							});
						}else{
							return resHandle.error(res,'密码更新失败');
						}
					}).catch((error)=>{
						resHandle.error(res,error);
					});
				}else{
					return resHandle.error(res,'用户和密码不匹配');
				}
			}else{
				return resHandle.error(res,'原密码有误',2);
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	updateEmail:function(req,res,next){
		let id=req.userInfo.id;
		let name=req.userInfo.name;
		let data=global.getData(req);
		let step=parseInt(data.step||1);
		let oldEmail=req.userInfo.email;
		if(!tool.verifyEmail(data.email)||!tool.verifyEmail(data.oldEmail)){
			return resHandle.error(res,'邮箱地址不正确');
		}
		if(!data.oldEmail||data.oldEmail.length===0){
			return resHandle.error(res,'原邮箱地址不能为空');
		}
		if(oldEmail!==data.oldEmail){
			return resHandle.error(res,'原邮箱地址错误');
		}
		if(!data.email||data.email.length===0){
			return resHandle.error(res,'请输入您新的邮箱地址');
		}
		if(oldEmail===data.email){
			return resHandle.error(res,'新旧邮箱不能一致');
		}
		if(step===1){
			let emailCode=tool.random(6);//邮箱验证码
			sendEmail({
				type:'changeEmail',
				username:name,
				to:data.email,
				data:[data.email,emailCode],
				callback:function (r) {
					if(r){
						let key=id+'_emailCode';
						redis.set(key,emailCode,60*5);
						resHandle.init(res,{
							msg:`邮件已发送至${data.email}，验证码5分钟内有效`
						});
					}else{
						resHandle.error(res,'邮件发送失败');
					}
				}
			});
		}else if(step===2){
			if(!data.code||data.code.length===0){
				return resHandle.error(res,'请输入您新邮箱('+data.email+')收到的验证码');
			}
			redis.get(id+'_emailCode').then((rs)=>{
				if(rs&&rs.toString()===data.code.toString()){
					userModels.update({
						email:data.email
					},{
						where:{
							id:id
						}
					}).then((rs)=>{
						if(rs[0]){
							resHandle.init(res,{
								data:{
									email:tool.handleEmail(data.email)
								},
								msg:'邮箱已更改，下次登录后生效'
							});
						}else{
							return resHandle.error(res,'邮箱修改失败');
						}
					}).catch((error)=>{
						return resHandle.error(res,error);
					});
				}else{
					return resHandle.error(res,'邮箱验证码错误或已过期');
				}
			}).catch((error)=>{
				return resHandle.error(res,error);
			});
		}else{
			return resHandle.error(res,'无法处理您的操作');
		}
	},
	feedBack:function(req,res,next){
		let {userId,email,name}=req.userInfo;
		let data=global.getData(req);
		if(!data.title||data.title.length===0){
			return resHandle.error(res,'请先简单的描述下问题');
		}
		if(!data.content||data.content.length===0){
			return resHandle.error(res,'请详细描述问题');
		}
		if(!data.app||data.app.length===0){
			return resHandle.error(res,'应用名称不能为空');
		}
		if(!data.version||data.version.length===0){
			return resHandle.error(res,'应用版本号不能为空');
		}
		let {title,content,app,version}=data;
		feedBackModels.create({userId,title,content,app,version}).then((rs)=>{
			if(rs){
				sendEmail({
					type:'feedBack',
					username:name,
					to:email,
					data:['收到',data.title],
				});
				resHandle.init(res);
			}else{
				resHandle.error(res,'反馈问题失败');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	errorEmail:function (req,res,next){
		let data=global.getData(req);
		if(!data.id){
			return resHandle.error(res,'缺少重要参数');
		}
		if(!data.password||data.password.length===0){
			return resHandle.error(res,'密码不能为空');
		}
		if(!data.email||data.email.length===0){
			return resHandle.error(res,'邮箱不能为空');
		}
		if(!tool.verifyEmail(data.email)){
			return resHandle.error(res,'邮箱地址不正确');
		}
		data.password=tool.sha256(data.password);
		userModels.findOne({
			where: {
				id:data.id
			},
			attributes: { exclude: ['createdAt','updatedAt','sex'] }, //过滤属性
		}).then(function(rs){
			if(rs){
				if(rs.password===data.password){
					if(rs.emailCode){
						if(rs.email===data.email){
							resHandle.error(res,'新旧邮箱地址一致');
						}else{
							userModels.update({
								email:data.email
							},{
								where:{
									id:data.id
								}
							}).then((result)=>{
								if(result[0]){
									sendEmail({
										type:'register',
										username:rs.name,
										to:data.email,
										data:[rs.emailCode,rs.id],
									});
									resHandle.init(res,{
										data:data.email,
										msg:"我们已经纠正了错误的邮箱，并已重新发送邮件给您"
									});
								}else{
									resHandle.error(res,'邮箱纠正失败');
								}
							}).catch((error)=>{
								resHandle.error(res,error);
							});
						}
					}else{
						resHandle.init(res,{
							data: {},
							msg:"该邮箱已验证,无法在此修改",
							code:3000
						});
					}
				}else{
					resHandle.error(res,'密码错误');
				}
			}else{
				resHandle.error(res,'用户不存在');
			}
		}).catch((error)=>{
			resHandle.error(res,error);
		});
	},
	realToken:function (req,res,next){
		let data=global.getData(req);
		let token=data.token;
		jwt.verify(token, global.tokenKey, (err, decode) => {
			if (err) {
				resHandle.error(res,'登录失效');
			} else {
				let tokenKey=decode.key+'_'+decode.id;
				redis.get('token_'+tokenKey).then((rs)=>{
					if(rs.id===decode.id){
						let userId=rs.id;
						if(!userId){
							resHandle.error(res,'登录验证失败，请重新登录',1000);
							return;
						}
						resHandle.init(res,{
							data:userId
						});
					}else{
						resHandle.error(res,'登录验证失败，请重新登录',1000);
					}
				}).catch(()=>{
					resHandle.error(res,'未登录或登录失效');
				});
			}
		});
	}
};
