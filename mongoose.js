var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/wechat-mall', { useNewUrlParser: true }) //服务器
mongoose.Promise = global.Promise
module.exports = mongoose









