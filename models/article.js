var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var ArticleSchema = new Schema({
    img_url:String,//图片地址
    poster:String,//封面图片地址
    title:String,
    content:String,//展示的内容
    video:String,//视频
    swiper:[],//图片数组
    creat_date:String,//创建日期
    update_date:String,
    articleType:{type:String,default:'text'},//文章类型 text || video ||swiper
    readNum:{type:Number,default: 0},
    likeNum:{type:Number,default: 0},
    ranking:{type:Number,default: 0},//排序，越大月前
    putAway:{type:Boolean,default:true},

});

var Article = mongoose.model('article', ArticleSchema);
Promise.promisifyAll(Article);
Promise.promisifyAll(Article.prototype);

module.exports = Article;
