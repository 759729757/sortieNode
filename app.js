var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const wxchat = require('./utils/wechat')
require("body-parser-xml")(bodyParser);//微信支付解析xml

//引入mongodb文件
require('./models/user');
require('./models/banner');
require('./models/order');
require('./models/article');
require('./models/about');
require('./models/admin');
require('./models/magazine');
require('./models/tradeRecord/record');



var indexRouter = require('./routes/index');
var Tools = require('./routes/tools');
// var usersRouter = require('./routes/users');



var app = express();
//解析微信支付
app.use(bodyParser.xml({
  limit: "1MB",
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  },
  verify: function(req, res, buf, encoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  }
}));

//接受跨域
app.all('*', function(req, res, next) {
  //get
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");

  //post
  res.header("Access-Control-Allow-Headers", "Content-Type, x-xsrf-token,Authorization");
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS,PUT');
  next();
});

app.use(bodyParser.json());//数据JSON类型
// app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.use('/tools', Tools);
app.use('/', indexRouter);
// app.use('/users', usersRouter);

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

wxchat.get_wx_accesstoken();//微信自动更新accesstoken

module.exports = app;
