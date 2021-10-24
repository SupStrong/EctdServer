let redis = require("redis");
const config=require("../config/redis-config.json")[process.env.NODE_ENV || 'development'];
const redis_client = redis.createClient({host:config.host,port:config.port,ttl:3*1000,auth_pass:config.password});
console.success('redis init');
redis_client.on('ready',function(){
	console.success('redis connected to '+config.host+':'+config.port);
});
redis_client.on("error",function(err){
	console.log(err);
});
redis = {
	set:function(key,value,exp){
		value = JSON.stringify(value);
		return redis_client.set(key,value,'EX',exp!==undefined?exp:60);
	},
	get: async function(key){
		return new Promise((resolve)=>{
			redis_client.get(key,function(err,res){
				return resolve(JSON.parse(res));
			});
		});
	}
};
module.exports = redis;
