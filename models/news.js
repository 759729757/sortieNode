var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var NewsSchema = new Schema({
    img_url:String,//图片地址
    title:String,
    date:String,//创建日期
    content:String,//展示的内容
    readNum:{type:Number,default: 0},
    likeNum:{type:Number,default: 0},
    putAway:{type:Boolean,default:false},

});

var News = mongoose.model('news', NewsSchema);
Promise.promisifyAll(News);
Promise.promisifyAll(News.prototype);

module.exports = News;
