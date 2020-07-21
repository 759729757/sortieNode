/**
 * 共用方法放这里
 * */

exports.removeProperty = (object)=>{
    for(prop in object){
        if (object[prop]===''||!object[prop]) {
            delete object[prop]
        }
    }
}

// 判断图片类型
exports.isAssetTypeAnImage = (ext)=> {
    return [
        'png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].
    indexOf(ext.toLowerCase()) !== -1;
};

//获取8位随机码，用于生成购买后的阅读
exports.getRandomCode = function (length) {
    length = length || 8;
    var data = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    var nums = "";
    for (var i = 0; i < length; i++) {
        var r = parseInt(Math.random() * 61);
        nums += data[r];
    }
    return nums;
};
//时间戳+随机数来生成订单号。
exports.getTradeNum = function () {
    var outTradeNo="";  //订单号
    for(var i=0;i<6;i++) //6位随机数，用以加在时间戳后面。
    {
        outTradeNo += Math.floor(Math.random()*10);
    }
    outTradeNo = new Date().getTime() + outTradeNo;  //时间戳，用来生成订单号。
    return outTradeNo;
};

var WXBizDataCrypt = require('./WXBizDataCrypt');//微信解密算法
const config = require('../config');//配置文件
//解析微信数据
exports.decryptData = function (data,iv,sessionKey) {
    var pc = new WXBizDataCrypt(config.appid, sessionKey);
    // console.log('decryptData :',pc.decryptData(data, iv));
    return  pc.decryptData(data , iv)
};

