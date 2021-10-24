console.success=function(msg){
	console.log('\x1b[32m','[cloud-server] '+msg,'\033[0m');
};
const fs = require('fs'); //用来生成token
const jwt = require('jsonwebtoken'); //用来生成token
const redis = require("./redis");//redis服务
const routerInit=require('./routerInit');//路由初始化
const resHandle = require("./resHandle");//返回数据处理
const getData = require("./getData");//获取请求的数据
const openRoute =require("../routes/openRoute");//免token验证路由
const cors=require("./cors");//设置跨域头方法
/*全局引用*/
global.redis=redis;
global.resHandle=resHandle;
global.getData=getData;
global.tokenKey='xxxxxxxxxxxxxxxxxxxxxxxx';// 这是加密token的key（密钥）
global.serverUrl=false;
global.resourceUrl=false;
global.uploadUrl='uploads/';
global.thumbUrl='thumbs/';
global.diskUrl=global.uploadUrl+'disk/';
String.prototype.Exist = function (substr) {
	if (substr === '|*|') {
		return true;
	}
	let key=substr.split(',');
	for (let i = 0; i < key.length; i++) {
		if (this.indexOf(key[i]) >= 0) {
			return true;
		}
	}
	return false;
};
/*目录权限*/
fs.chmod(global.uploadUrl,777,function (r) {
	if(r){
		console.log('upload folder chmod failed');
	}else{
		console.success('upload folder chmod 777');
	}
});
fs.chmod(global.uploadUrl+'/avatar',777,function (r) {
	if(r){
		console.log('avatar folder chmod failed');
	}else{
		console.success('avatar folder chmod 777');
	}
});
fs.chmod(global.uploadUrl+'/disk',777,function (r) {
	if(r){
		console.log('disk folder chmod failed');
	}else{
		console.success('disk folder chmod 777');
	}
});
fs.chmod(global.thumbUrl,777,function (r) {
	if(r){
		console.log('thumbs folder chmod failed');
	}else{
		console.success('thumbs folder chmod 777');
	}
});
module.exports=function(app){
	app.all('*', function (req, res, next) {
		if(!global.serverUrl){
			let url=process.env.NODE_ENV!=='development'?'https://api.zjinh.cn':req.protocol+'://'+req.hostname+':'+req.app.settings.port;
			global.serverUrl=url;
			global.resourceUrl=url+'/uploads/';
			console.success('run in '+url);
		}
		let origin=req.headers.origin;
		if(cors.verify(origin)){
			cors.set(res,origin);
			if(origin==='app://.'&&req.method!=='OPTIONS'){//验证electron应用
				if(/cloud\.zjinh\.app\./.test(req.get('AppId'))){
					next();
					return;
				}else{
					res.status(403);
					global.resHandle.error(res,'非法应用',403);
				}
				return;
			}
		}else if(!req.get('Referer')&&(req.path.includes('weather')||req.path.includes('user'))){//直接在浏览器地址访问
			res.status(403);
			global.resHandle.error(res,'外部访问',403);
			return;
		}
		next();
	});
	app.use('/',openRoute);
	let routeVerify=[];//需要验证路由是否存在的正则
	//token验证
	app.use((req,res,next)=>{
		let href=req.originalUrl;
		if(href.includes('?')){
			href=href.split('?')[0];
		}
		const method=req.method.toLowerCase();
		let isExist=false;
		if(method!=='options') {
			isExist = routeVerify.some((item) => {//这里需要先验证这些路由是否是存在，避免一些404页面进入token验证
				return new RegExp(item.reg).test(href.slice(item.cPath.length + 1)) && item.method[method];
			});
		}else{
			next();
			return;
		}
		if(isExist) {
			const token = req.get("Authorization"); // 从Authorization中获取token
			if(token) {
				jwt.verify(token, global.tokenKey, (err, decode) => {
					if (err) {
						resHandle.noLogin(res, {
							msg: "未登录,请登录后继续",
							code: 401
						});
					} else {
						let tokenKey=decode.key+'_'+decode.id;
						redis.get('token_'+tokenKey).then((rs)=>{
							if(rs.id===decode.id){
								req.userInfo=rs;
								req.userInfo.tokenKey=tokenKey;
								let userId=req.userInfo.id;
								if(!userId){
									resHandle.noLogin(res, {
										msg: "登录验证失败，缺少关键值，请重新登录",
										code: 401
									});
									return;
								}
								next();
							}else{
								resHandle.noLogin(res, {
									msg: "登录验证失败，请重新登录",
									code: 401
								});
							}
						}).catch(()=>{
							resHandle.noLogin(res, {
								msg: "未登录或登录失效",
								code: 401
							});
						});
					}
				});
			}else{
				resHandle.noLogin(res, {
					msg: "缺少token,请登录后继续",
					code: 401
				});
			}
		}else {
			next();
		}
	});
	routeVerify=routerInit(app);
};
