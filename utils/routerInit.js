const fs = require('fs');
const createError = require('http-errors');
let routes = {};
let files = fs.readdirSync(__dirname+'/../routes');
let reg = /([\S]+)\.js$/i;
files.forEach(function(val){
	let matchs = reg.exec(val);
	if(matchs && matchs.index >= 0){
		routes[matchs[1]] = require('../routes/'+ val);
	}
});

module.exports=function(app){
	let keys = Object.keys(routes);
	let result=[];
	keys.forEach(function(k){
		let cPath = '';
		if(routes[k].cPath){
			cPath = routes[k].cPath;//cPath为路由对应的路径，在路由文件里配置，默认为路由文件名
		}else{
			cPath = k;
		}
		if(cPath!=='openRoute') {
			app.use('/' + cPath, routes[k]);
			result=routes[k].stack.reduce((a,b)=>{
				a.push({
					cPath:cPath,
					reg:b.regexp,
					method:b.route.methods
				});
				return a;
			},result);
		}
	});
	console.success('router init complete');
	// 捕获404并处理
	app.use(function(req, res, next) {
		next(createError(404));
	});
	// 错误处理
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		let port=req.app.settings.port;
		let url=req.method+":"+req.hostname+(port===80?'':':'+port)+req.path;
		err.status=err.status || 500;
		res.locals.message = req.app.get('env') !== 'production'?err.message:'Error';
		res.locals.error = req.app.get('env') !== 'production' ? {error:err,url:url} : {error:{status:err.status},url:url};
		// 渲染错误页面
		res.status(err.status);
		if(req.method==='GET'){
			res.type('html');
			res.render('error');
		}else {
			global.resHandle.error(res,res.locals.message,err.status);
		}
	});
	console.success('router catch ready');
	return result;
};
