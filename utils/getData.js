module.exports=function (req) {
	let aa={
		GET:'query',
		POST:'body',
		DELETE:'body'
	};
	return req[aa[req.method||'get']]||{};
};
