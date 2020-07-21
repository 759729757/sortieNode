/**
 * Created by CY on 2019-08-22.
 */
var mongoose = require('../mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var magazineSchema = new Schema({
    name:String,
    subTitle:String,//副标题
    describe:String,//述描
    headImg:String,//封面图片(并到 subHeadImg 中，这个不用）
    type:[String],//类型,可多个
    subHeadImg:[String],//详情页的封面图，可以多张
    //内容
    content:[
        Object
    ],

    magazine:[{
        type:{type:String,default:'image'},//默认类型是图片
        url:String,//默认 内容（图片，视频）的链接，默认是 1:2 的全面屏手机
        subUrl:String,// 就是未达标时展示的图片
        subUrl2:String,//备用
        fullUrl:String,//完整的http链接
        videoDirection:'',
        videoShowOfSold:'',
        showControls:{type:Boolean,default:false},//是否显示视频控制条
        autoFull:{type:Boolean,default:false},//是否自动全屏

    }],
    subMagazine:[{ //兼容旧版手机
        type:{type:String,default:'image'},//默认类型是图片
        url:String,//默认 内容（图片，视频）的链接，默认是 1:2 的全面屏手机
        subUrl:String,// 就是未达标时展示的图片
        subUrl2:String,//备用
        fullUrl:String,//完整的http链接

        videoDirection:'',
        videoShowOfSold:'',
        showControls:{type:Boolean,default:false},//是否显示视频控制条
        autoFull:{type:Boolean,default:false},//是否自动全屏

    }],
    sold:Number,//销售数量
    price:{type:Number,default:6},//定价
    rank:{type:Number,default: 0},//排序权重 ，越高越靠前，默认是0 （可用作首页显示）

    magazineNum:'',//用于记录图片文件存放路径，方便后期整理
    putAway:{type:Boolean,default:true}//是否上架


});

// magazineSchema.statics={
//
// };

var Magazine = mongoose.model('magazine', magazineSchema)
Promise.promisifyAll(Magazine)
Promise.promisifyAll(Magazine.prototype)

module.exports = Magazine

