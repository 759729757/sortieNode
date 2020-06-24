var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var ArticleSchema = new Schema({
    img_url:String,//图片地址
    title:String,
    creat_date:String,//创建日期
    update_date:String,
    content:String,//展示的内容
    readNum:{type:Number,default: 0},
    likeNum:{type:Number,default: 0},
    putAway:{type:Boolean,default:true},

});

var Article = mongoose.model('article', ArticleSchema);
Promise.promisifyAll(Article);
Promise.promisifyAll(Article.prototype);

module.exports = Article;
