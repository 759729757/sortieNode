﻿var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true }) //服务器
mongoose.Promise = global.Promise
module.exports = mongoose









