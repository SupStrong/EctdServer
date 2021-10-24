const gm = require('gm');
module.exports=async function (url,fileName,type='picture'){
	if(type==='picture'){
		return new Promise((resolve)=>{
			let thumbUrl=global.thumbUrl+fileName;
			gm(url)
				.resize(80)
				.write(thumbUrl, (err)=>{
					if(err){
						resolve('');
					}else{
						resolve(thumbUrl);
					}
				});
		});
	}else{

	}
};
