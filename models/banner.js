var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var BannerSchema = new Schema({
    img_url:String,//图片地址
    content:String,//展示的内容
    putAway:{type:Boolean,default:false},

});

var Banner = mongoose.model('banner', BannerSchema);
Promise.promisifyAll(Banner);
Promise.promisifyAll(Banner.prototype);

module.exports = Banner;
