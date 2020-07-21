var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var BannerSchema = new Schema({
    img_url:String,//图片地址
    title:String,
    content:String,//展示的内容

    creat_date:String,//创建日期
    update_date:String,
    putAway:{type:Boolean,default:true},

});

var Banner = mongoose.model('banner', BannerSchema);
Promise.promisifyAll(Banner);
Promise.promisifyAll(Banner.prototype);

module.exports = Banner;
