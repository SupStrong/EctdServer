const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
	host: '',
	secure: true,
	// 我们需要登录到网页邮箱中，然后配置SMTP和POP3服务器的密码
	auth: {
		user: '',
		pass: ''  //这里是授权密码而不是邮件密码
	}
});
let mailOptions = {
	// 发送邮件的地址
	from: '', // login user must equal to this user
	// 接收邮件的地址
	to: '2665229856@qq.com',  //
	cc:'',
	// 邮件主题
	subject: '',
	// 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
	html: ''
};
function createContent(userName,content){
	return `<table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-family:微软雅黑;border-collapse:collapse;border: 1px solid #eee">
        <tbody>
            <tr bgcolor="#fff" style="color: #38f;">
                <td>CLOUD</td>
            </tr>
            <tr>
                <th></th>
            </tr>
            <tr>
                <td>
                    <p>`+userName+`</p>
                    `+content+`
                    <p></p>
                    <p>如非本人操作，请忽略此邮件<br>系统邮件、请勿回复</p>
                </td>
            </tr>
			<tr>
                <td>
                    <a style="color:#fff;text-decoration: none" href="https://cloud.zjinh.cn/" target="_blank">https://cloud.zjinh.cn/</a>
                </td>
            </tr>
        </tbody>
    </table>`;
}
function initContent(type,userName,data){
	let template={
		register:`<p>欢迎使用 CLOUD<br>这是您注册时发出的注册验证邮件<br>请复制下列代码前往验证页面</p>
		<p>验证码:`+data[0]+`</p>
		<p><a target="_blank" href="https://cloud.zjinh.cn/verify/`+data[1]+`/`+userName+`">验证地址</a></p>`,
		forgetPassword:`<p>系统已处理了您找回密码的请求，并为您设置了新的密码<br>请使用我们提供的新密码登录并及时修改此密码</p>
		<p>密码：`+data+`</p>`,
		forgetAccount:`<p>系统已处理了您找回账号的请求<br>以下是您的登录账号</p>
		<p>账号：`+data+`</p>`,
		changeEmail:`<p>您即将修改绑定邮箱为（`+data[0]+`）<br>以下是您修改绑定邮箱的验证码</p>
		<p>验证码：`+data[1]+`</p>`,
		feedBack:`<p>我们已经`+data[0]+`了您的问题：`+data[1]+`</p>
		<p>感谢您的反馈。问题解决后你将会收到系统回信</p>`,
		feedBackReply:`<p>我们已经解决了您提出的：`+data[1]+`</p>
		<p>感谢您的反馈。</p>`,
	};
	return createContent(userName,template[type]);
}

module.exports=function ({type, username, data, to,callback}) {
	let subjects={
		register:"注册邮箱验证",
		forgetPassword:"密码重置",
		forgetAccount:"账号找回",
		changeEmail:"绑定邮箱验证",
		feedBack:"问题反馈"
	};
	mailOptions.to=to||'2665229856@qq.com';
	mailOptions.subject='CLOUD['+subjects[type]+']';
	mailOptions.html=initContent(type,username,data);
	transporter.sendMail(mailOptions, function (error, info) {
		callback&&callback(!error,info);
	});
};
