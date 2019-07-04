const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


//zl:自己引用的库
const formidable=require('formidable');
const fs=require('fs');
const jwt=require('./tools/jwt');
require('./tools/dateFormat');
const loopMkdir=require('./tools/loopMkdir');
const UnFile=require('./tools/UnFile');

//路由
// const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const goodsRouter = require('./routes/goods');
const billRouter = require('./routes/bill');
const customRouter = require('./routes/custom');
const addressRouter = require('./routes/address');
const goodsImgRouter=require('./routes/goodsImg');
const goodsTypeRouter=require('./routes/goodsType');
const cartRouter=require('./routes/cart');
const orderRouter=require('./routes/order');
const orderGoodsRouter=require('./routes/orderGoods');
const storeRouter=require('./routes/store');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//日志输出库
//dev为:method :url :status :response-time ms - :res[content-length]
//short为:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
//tiny为:method :url :status :res[content-length] - :response-time ms
app.use(logger('dev'));
//将错误代码为400以上的错误日志存储起来
app.use(logger('common', {
  skip: function (req, res) { return res.statusCode < 400 },
  stream: fs.createWriteStream(path.join(__dirname, '错误日志.log'), { flags: 'a' })
}));


app.use(cookieParser());

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname+'/upload'));

//解析post请求模块
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// zl:将form表单提交的数据提取到req.body中
app.use((req,res,next)=>{
  if (req.get('content-type') && req.get('content-type').includes('multipart/form-data')){
    const form = new formidable.IncomingForm();
    let fsPath='./upload/img'+(new Date()).Format('/yyyy/MM/dd');
    // mac与windows不同
    // loopMkdir('.'+fsPath);     //windows
    loopMkdir(fsPath);
    form.uploadDir=path.resolve(__dirname,fsPath);
    form.keepExtensions=true;
    // form.encoding='utf-8';
    form.parse(req,(err,params,file)=>{
      if (err) {
        console.log(err);
        res.json({ok:-1,msg:"表单提交错误"});
      }else {
        for (let k in params) {
          if (['undefined','null'].indexOf(params[k])>=0){
            delete params[k]
          }
        }
        let fileAddr={};
        for (let k in file){
          // windows系统与mac系统有所不同，当用windows系统时用这句话
          // let filePath=file[k].path.replace(/.*?\\upload/,'').replace(/\\/g,'/');
          let filePath=file[k].path.replace(/.*?\/upload/,'');
          fileAddr[k]=filePath;
          if (['img','imgUrl'].indexOf(k)===-1){
            console.log('此处过滤了不被允许的文件字段'+[k]+'，并自动将不合法文件删除');
            UnFile(filePath);
          }
        }
        Object.assign(req.body,params,fileAddr);
        next()
      }
    });
  } else {
    next()
  }

});



app.all('*',(req,res,next)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Content-Type, Access-Control-Allow-Headers, Access-Control-Request-Headers, Access-Control-Request-Method, Authorization, X-Requested-With, User-Agent, Referer, Origin");
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

app.all('*',(req,res,next)=>{
  console.log(req.path,req.method);
  console.log('req.body:',req.body);
  console.log('req.query',req.query);
  let {path,method}=req;
  if (!((path==='/user'&&method==='POST')||(path==='/user/login'&&method==='POST'))){
    let obj=jwt.decode(req.headers.authorization);
    if (obj.ok===1){
      req.phone=obj.phone;
      req.userId=obj.id;
      req.userType=obj.type;
      next()
    } else {
      res.json(obj)
    }
  }else {next()}
});

// app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/goods', goodsRouter);
app.use('/custom', customRouter);
app.use('/bill', billRouter);
app.use('/address', addressRouter);
app.use('/goodsImg', goodsImgRouter);
app.use('/goodsType', goodsTypeRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/orderGoods', orderGoodsRouter);
app.use('/store', storeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

