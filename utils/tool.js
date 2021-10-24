const sha =require("sha256");
const md5 =require('md5');
module.exports={
	random:function(n) {
		if (n > 21) return null;
		return parseInt((Math.random() + 1) * Math.pow(10,n-1));
	},
	randomStr:function(len) {
		len = len || 32;
		let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		let maxPos = $chars.length;
		let pwd = '';
		for (let i = 0; i < len; i++) {
			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	},
	sha256:sha,
	md5:md5,
	handleEmail:function (email) {
		let reg = /(.{3}).+(.{2}@.+)/g;
		return email?email.replace(reg, "$1****$2"):'未绑定邮箱';
	},
	handlePhone:function (phone) {
		phone=phone?phone.toString():false;
		let phoneReg = /(.{3}).+(.{3}.+)/g;
		return phone?phone.replace(phoneReg, "$1****$2"):'未绑定手机号';
	},
	validateFileName:function(fileName ){
		let reg = new RegExp('[\\\\/:*?\"<>|]');
		return reg.test(fileName);
	},
	verifyEmail:function (email){
		let regex = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
		return regex.test(email);
	},
	deepCopy:function (data){
		return JSON.parse(JSON.stringify(data));
	}
};
