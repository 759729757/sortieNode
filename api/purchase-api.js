// 微信支付功能
var crypto = require('crypto');
var xml2js = require('xml2js');
var request = require('request');
var mongoose = require('mongoose');
var Common = require('../utils/common');
const config = require('../config');//配置文件

require('../models/tradeRecord/record');

var Record = mongoose.model('record');
var Magazine = mongoose.model('magazine');

//产生随机数
function randomStr(length) {
    length = length || 32;
    var str = "";
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (var i = 1; i <= length; i++) {
        var random = Math.floor(Math.random() * arr.length);
        str += arr[random];
    }
    return str;
}
//签名算法（把所有的非空的参数，按字典顺序组合起来+key,然后md5加密，再把加密结果都转成大写的即可）
function createSign(obj) {
    var stringA =
        'appid=' + obj.appid +
        '&body=' + obj.body +
        '&mch_id=' + obj.mch_id +
        '&nonce_str=' + obj.nonce_str +
        '&notify_url=' + obj.notify_url +
        '&openid=' + obj.openid +
        '&out_trade_no=' + obj.out_trade_no +
        '&spbill_create_ip=' + obj.spbill_create_ip +
        '&total_fee=' + obj.total_fee +
        '&trade_type=' + obj.trade_type;

    var stringSignTemp = stringA + '&key=' + config.mch_key;
    var hash = crypto.createHash('md5');
    hash.update(stringSignTemp);
    var signValue = hash.digest('hex');
    return signValue.toUpperCase();
}
const jwt = require('jsonwebtoken');  //用来生成token
//发起下单请求
exports.order = async (req,res)=>{

    console.log( '获取请求参数',req.query);
    var openid = req.query.userInfo.openid;
    var nonce_str = randomStr();    //随机数
    var total_fee = Number(req.query.amount) * 100;//订单价格
    var orderno = new Date().getTime()+""+randomStr(10)+"o"+total_fee;	//自定义的商户订单号
    var reqUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder'; //向微信提交订单申请
//签名
//     total_fee = 1;//设置价格为1分，测试用
//     
    let appid =config.appid;
    if(req.query.buyType==='web'){
        // 网页端购买
        appid= config.wechatAppId
    }

    var signoption = {
        appid: appid,//小程序appid
        body: req.query.tradeBody||'Sortie 电子刊',//商品描述
        mch_id: config.mch_id,//商户号
        nonce_str: nonce_str,//随机字符串
        notify_url: 'https://wechat.studiosortie.com/purchaseCallback', //回调地址
        openid: openid,//交易类型是JSAPI的话，此参数必传   可从过code获取openid
        out_trade_no:orderno,//商品订单号
        spbill_create_ip: '119.23.218.4',//因为微信支付需要有回调url，所以没法确定你的公网ip就没法发送订单支付通知给你，所以提供一个解析的正常ip就好
        total_fee: total_fee,//商品价格
        trade_type: 'JSAPI'//交易类型，JSAPI为小程序交易类型
    };
    var sign = createSign(signoption);
//这个顺序要和签名顺序一致
    let formData =
        '<xml>' +
        '<appid>' + signoption.appid + '</appid>' +
        '<body>' + signoption.body + '</body>' +
        '<mch_id>' + signoption.mch_id + '</mch_id>' +
        '<nonce_str>' + signoption.nonce_str + '</nonce_str>' +
        '<notify_url>' + signoption.notify_url + '</notify_url>' +
        '<openid>' + signoption.openid + '</openid>' +
        '<out_trade_no>' + signoption.out_trade_no + '</out_trade_no>' +
        '<spbill_create_ip>' + signoption.spbill_create_ip + '</spbill_create_ip>' +
        '<total_fee>' + signoption.total_fee + '</total_fee>' +
        '<trade_type>' + signoption.trade_type + '</trade_type>' +
        '<sign>' + sign + '</sign>' +
        '</xml>';

//发起请求，获取微信支付的一些必要信息
    request({
        url: reqUrl,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: formData
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // console.log('发送的数据',formData);
            try {
                xml2js.parseString(body, function (error, result) {
                    let reData = result.xml;
                    console.log('统一下单接口返回的解析数据：',reData);
                    let timeStamp = new Date().getTime();

                    var _signtext = "appId="+appid+"&nonceStr=" + reData.nonce_str[0] +
                        "&package=prepay_id=" + reData.prepay_id[0] +
                        "&signType=MD5&timeStamp=" + timeStamp +
                        "&key="+config.mch_key;//商户key一定要补，顺序不要随便调整**
                    var hash = crypto.createHash('md5');
                    hash.update(_signtext);
                    var signValue = hash.digest('hex');
                    var paysign = signValue.toUpperCase();//md5重新加密生成签名**

                    let responseData = {
                        timeStamp: timeStamp,
                        nonceStr: reData.nonce_str[0],
                        package: reData.prepay_id[0],
                        paySign: paysign
                    };
                    //更新记录支付结果
                    //个性化业务处理
                    //创建新订单
                    var query = req.query
                        ,magazine = query.magazine //杂志的id那些
                        ,user = query.userInfo._id //用户id
                        ,readCode = Common.getRandomCode(8) //生成8位阅读码
                    Record.create(
                        {
                            buyer:user,
                            magazine:magazine,
                            amount:query.amount,
                            tradeId:signoption.out_trade_no,
                            readCode:readCode,
                            tradePrice:query.price,
                            tradeCount:query.tradeCount,
                            tradeTime:new Date().valueOf(),
                        },
                        function (err, data) {
                            if(err){
                                console.log('下单失败：',err);
                                res.jsonp({
                                    err:'err'
                                })
                                return ;
                            };
                            res.json({ error_code: 0, result: responseData,out_trade_no:signoption.out_trade_no });
                        }
                    );
                    //个性化业务处理结束

                });
                // res.json({ error_code: 0, result: responseData,out_trade_no:signoption.out_trade_no });
            } catch (e) {
                console.log(e);
                console.log('下单失败：',e);
                    res.jsonp({
                        err:'err'
                    })
                    return ;
            }
        }
    });
}

//微信回调地址
exports.purchaseCallback = async (req,res)=>{
    console.log('微信支付回调：',req.body);
    try {
        //修改订单状态
        var query = req.body.xml;
        if(query.result_code === 'SUCCESS' || query.result_code[0] === 'SUCCESS' ){
            console.log('-------------------已经收到微信支付成功回调！-------------.');
            let tradeId = query.out_trade_no;
            Record.findOneAndUpdate(
                {tradeId:tradeId},
                {
                    isPay:true
                },
                function (err, data) {
                    if(err)next(err);
                    // 增加销量
                    Magazine.findOneAndUpdate({_id:data.magazine},
                        {$inc:{sold:data.tradeCount}},
                        function (err, doc) {});
                }
            );
            var resolve = "<xml>" +
                "<return_code><![CDATA[SUCCESS]]></return_code>" +
                "<return_msg><![CDATA[OK]]></return_msg>" +
                "</xml> ";
            res.header('Content-Type', 'text/xml' );
            res.end(resolve);
        }else {
            res.end(400);

        }
    }catch (e){
        console.log('微信支付回调错误',e);
        res.end(400);
    }
};

