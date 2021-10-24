const allowOrigin=['app://.'];//允许的域名
module.exports={
	verify(origin){
		return /(zjinh.cn$|zjinhj.cn$)/.test(origin)||allowOrigin.includes(origin)||process.env.NODE_ENV!=='production';
	},
	set(res,origin,method) {
		res.header('Access-Control-Allow-Origin', origin);
		//Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
		res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,AppId');
		res.header('Access-Control-Expose-Headers', 'Authorization');
		res.header('Access-Control-Allow-Methods', method||'*');
		res.header('Access-Control-Max-Age', '600');//10分钟检查一次
	}
};
