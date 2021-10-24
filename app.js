const ejs = require('ejs');
const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
//const formidable = require('connect-multiparty'); // 引入处理formdata
const app = express();
const cloudServer = require("./utils/index");
const cors=require("./utils/cors");//设置跨域头方法

const fileUpload = require('express-fileupload');

// 页面初始化
let options={
	setHeaders:function (res){
		let origin=res.req.headers.origin;
		if(cors.verify(origin)){
			cors.set(res,origin,'GET');
		}
	}
};
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	next();
});

app.use(express.json());//解析post请求json数据
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({    useTempFiles : true,tempFileDir : '/tmp/'}));
app.use('/uploads',express.static(path.join(__dirname,'uploads'),options));//解析upload目录
app.use('/thumbs',express.static(path.join(__dirname,'thumbs'),options));//解析thumbs目录
app.use('/',express.static(path.join(__dirname,'static')));//static
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));//获取html模板页
app.engine('.html',ejs.renderFile);//渲染html
app.set('view engine', 'html');//输出html
app.use(logger('dev'));//日志

//app.use(formidable());//解析formdata
app.use(cookieParser());//解析cookie
cloudServer(app);
module.exports = app;
