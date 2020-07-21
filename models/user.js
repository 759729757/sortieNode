var mongoose = require('../mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var UserSchema = new Schema({
    openid: String,     //小程序唯一标识
    wxopenid:String,    //微信服务号唯一标识

    unionId:String,    //全局唯一标识
    nickName:String,    //昵称
    userInfo:Object,    //用户信息

    phoneNumber: String,     //手机号
    countryCode:String,//区号

    update_date:String, //更新时间
    creat_date:String,  //创建时间
    address:Object,     //地址
    coupon:Array        //优惠券
})

var User = mongoose.model('user', UserSchema)
Promise.promisifyAll(User)
Promise.promisifyAll(User.prototype)

module.exports = User
