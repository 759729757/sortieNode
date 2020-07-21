var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var AboutSchema = new Schema({
    title:String,
    content:String,//展示的内容
    creat_date:String,//创建日期
    update_date:String,
    readNum:{type:Number,default: 0},
    likeNum:{type:Number,default: 0},
});

var About = mongoose.model('about', AboutSchema);
Promise.promisifyAll(About);
Promise.promisifyAll(About.prototype);

module.exports = About;
