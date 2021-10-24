module.exports={
	init:function(res,options){
		options=options||{};
		res.json({
			data:options.data|| {},
			msg:options.msg||"成功",
			code:options.code||0
		});
		return false;
	},
	error:function (res,data,code) {
		if(typeof data ==="object"){
			if(data.errors){
				data= data.errors[0].message;
			}else if(data.parent){
				data='致命错误:'+data.parent.code;
				code=10000;
			}else{
				data=data.toString();
				let msg=data.split(':');
				data=msg.length?msg[1]:data;
			}
		}
		res.json({
			msg:data||'发现了些问题',
			code:parseInt(code)||1
		});
		return false;
	},
	noLogin:function (res,options) {
		res.status(401).json(options);
	}
};
