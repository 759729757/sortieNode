
const moment = require('moment')
const mongoose = require('../mongoose')
const Article = mongoose.model('article')
const User = mongoose.model('user')
const About = mongoose.model('about')
const Banner = mongoose.model('banner')
const Record = mongoose.model('record');
const Magazine = mongoose.model('magazine')


const Base64 = require("js-base64").Base64;
const config = require('../config');//配置文件
const https= require('https');
const jwt = require('jsonwebtoken');  //用来生成token
var Common = require('../utils/common');
var wxSign = require('../utils/sign');

exports.loginByCode = async (req,res)=>{
    var code = req.query.code || false;
    var state = req.query.state||false;
    if (!code){
        res.jsonp({
            status:40001,mess:'缺少必要字段'//缺了code
        });return false;//filtration invalid request
    }
    if(code){
        try {
            console.log('state:',state);
            let appid = config.appid,
            secret = config.appsecret;
            var x='';//wx response;
            if(state === 'web'){
                appid = config.wechatAppId;
                secret = config.wechatAppSecret;
                https.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid="
                    +appid+"&secret="+secret+"&code="+code+"&grant_type=authorization_code",
                    function(res1) {
                        res1.on('data',function(d){
                            x = JSON.parse(d.toString());
                            var openid = x.openid;
                            console.log('微信登录 用户数据',x);
                            if(openid!=undefined){
                                //微信服务号的openid字段为wxopenid
                                User.findOne({wxopenid:openid}, function (err, user) {
                                    if (err)next(err);
                                    // console.log('get wx info:',user);
                                    if(user){
                                        let content = {openid:openid,_id:user._id,session_key:x.session_key,access_token:x.access_token }; // 要生成token的主题信息
                                        let secretOrPrivateKey = config.tokenKey;// 这是加密的key（密钥）
                                        let token = jwt.sign(content, secretOrPrivateKey, {
                                            expiresIn: 60*60*4  // 4小时过期
                                        });
                                        res.jsonp({status:1,mess:'ok',token:token,user:user}) //返回token
                                    }else {
                                        //首次登陆，自动注册用户
                                        User.create({
                                            wxopenid:openid,creat_date:new Date().toLocaleString()
                                        },function (err, doc) {
                                            let content = {openid:openid,_id:doc._id,session_key:x.session_key,access_token:x.access_token}; // 要生成token的主题信息
                                            let secretOrPrivateKey = config.tokenKey;// 这是加密的key（密钥）
                                            let token = jwt.sign(content, secretOrPrivateKey, {
                                                expiresIn: 60*60*4  // 4小时过期
                                            });
                                            res.jsonp({status:1,mess:'register ok',token:token,user:doc}) //返回token
                                        });
                                    }
                                });

                            }else{
                                //did not get openid;
                                console.log("获取不到openid :"+ x.errcode);
                                res.jsonp({status:-1,mess:'no openid'});
                                return false;
                            }
                        })
                    }).on('error', function(e) {
                    //https get fail;
                    console.log("微信登陆失败: " + e.message);
                    res.redirect("login.html");
                });
            }else{
                https.get("https://api.weixin.qq.com/sns/jscode2session?appid="
                    + appid +"&secret="+secret+"&js_code="+code
                    +"&grant_type=authorization_code",
                    function(res1) {
                        res1.on('data',function(d){
                            x = JSON.parse(d.toString());
                            console.log('用户数据',x);
                            var openid = x.openid;
                            // console.log('user info:'+ x.toString(),openid);
                            if(openid!=undefined){
                                //get openid success!
                                User.findOne({openid:openid}, function (err, user) {
                                    if (err)next(err);
                                    // console.log('get wx info:',user);
                                    if(user){
                                        let content = {openid:openid,_id:user._id,session_key:x.session_key}; // 要生成token的主题信息
                                        let secretOrPrivateKey = config.tokenKey;// 这是加密的key（密钥）
                                        let token = jwt.sign(content, secretOrPrivateKey, {
                                            expiresIn: 60*60*4  // 4小时过期
                                        });
                                        res.jsonp({status:1,mess:'ok',token:token,user:user}) //返回token
                                    }else {
                                        //首次登陆，自动注册用户
                                        User.create({
                                            openid:openid,creat_date:new Date().toLocaleString()
                                        },function (err, doc) {
                                            let content = {openid:openid,_id:doc._id,session_key:x.session_key}; // 要生成token的主题信息
                                            let secretOrPrivateKey = config.tokenKey;// 这是加密的key（密钥）
                                            let token = jwt.sign(content, secretOrPrivateKey, {
                                                expiresIn: 60*60*4  // 4小时过期
                                            });
                                            res.jsonp({status:1,mess:'register ok',token:token,user:doc}) //返回token
                                        });
                                    }
                                });
                            }else{
                                //did not get openid;
                                console.log("获取不到openid :"+ x.errcode);
                                res.jsonp({status:-1,mess:'no openid'});
                                return false;
                            }
                        })
                    }).on('error', function(e) {
                    //https get fail;
                    console.log("微信登陆失败: " + e.message);
                    res.jsonp({status:-1,mess:'error,try again'});
                });
            }

        }catch (e) {
            console.log(e)
        }

    }
};

exports.wechatConfig = (req,res)=>{
    var url = req.query.url;
    try {
        if(url){
            console.log('wx_sign:'+wxSign(global.jsapi_ticket, url));
            res.jsonp(wxSign(global.jsapi_ticket, url));
        }else{
            res.jsonp('false');
        }
    }catch (e) {
        console.log('config出错：',e);
    }

};

exports.updatePhone = (req,res)=>{
    var body = req.body;
    // console.log('updateUserInfo',req.query.userInfo.openid);
    const {encryted,iv} = body;
    try {
        let data = Common.decryptData(encryted,iv,req.query.userInfo.session_key);
        // console.log('解密到的信息：',data);
        User.findOneAndUpdate(
            {openid:req.query.userInfo.openid},
            {
                phoneNumber: data.purePhoneNumber || '',
                countryCode:data.countryCode || ''
            },
            function (err, doc) {
                res.jsonp({status:1,mess:'绑定手机号成功',data:doc})
            })
    }catch (e) {
        console.log('出错：',e)
    }
};

exports.updateUserInfo = (req,res)=>{
    var body = req.body;
    // console.log('updateUserInfo',body.userInfo.nickName);
    const {encryted,iv} = body;
    try {
        let data = Common.decryptData(encryted,iv,req.query.userInfo.session_key);
        // console.log('解密到的信息：',data);
        User.findOneAndUpdate(
            {openid:req.query.userInfo.openid},
            {
                unionId: data.unionId || '',
                userInfo:data
            },
            function (err, doc) {
                res.jsonp({status:1,mess:'ok',data:doc})
            })
    }catch (e) {
        console.log('出错：',e)
    }
}

exports.fetchAbout = (req,res)=>{
    var query = req.query;
    About.findOne(query)
        .then(result => {
            return res.json({
                code: 200,
                mess: '查询成功',
                data: result
            })
        })
}

exports.fetchBanner = (req,res)=>{
    var query = req.query;
    Banner.findOne(query)
        .then(result => {
            return res.json({
                code: 200,
                mess: '查询成功',
                data: result
            })
        })
}

exports.fetchNews = (req,res)=>{
    var query = req.query;
    console.log(req.path,'的参数：',req.query)
    var page = query.page || 1,
        limit = query.limit || 10;
    page --;
    delete query['page'];
    delete query['limit'];
    delete query['userInfo'];

    Article.find(query)
        .sort({ranking:-1})
        .skip(page*limit)
        .limit(limit)
        .then(result => {
            return res.json({
                code: 200,status:1,
                mess: '查询成功',
                data: result
            })
        })
};
exports.fetchMagazine = (req,res)=>{
    var query = req.query;
    console.log(req.path,'的参数：',req.query)
    var page = query.page || 1,
        limit = query.limit || 10;
    page --;
    delete query['page'];
    delete query['limit'];
    delete query['userInfo'];
    delete query['token'];

    Magazine.find(query,{magazine:0,content:0})
        .sort({ranking:-1})
        .skip(page*limit)
        .limit(limit)
        .then(result => {
            return res.json({
                code: 200,status:1,
                mess: '查询成功',
                data: result
            })
        })
};
exports.readMgz = (req,res)=>{
    try {
        var query = req.query
            ,magazine = query.magazine
            ,user = query.userInfo._id
            ,readCode = query.readCode;
        var _query = {};


        if(!magazine){
            res.jsonp({status:40001,mess:'lack of info'});
            return false;
        }
        _query.isPay = true;
        _query.magazine = magazine;
        if(readCode){ //有阅读码，优先查询阅读码，不然查询用户购买记录
            _query.readCode = readCode;
        }else{
            // _query.buyer = user;
            _query.$or = [
                {buyer:mongoose.Types.ObjectId(user)},
                {buyer:user},
                {user:user}
            ]
        }
        // console.log(_query,'_query');
        Record.find(_query).sort({readCodeUsed:-1}).populate('magazine').exec(function (err, records) {
            if(err)next(err);
            if(records.length){
                console.log('找到阅读数据',records.length,'条');
                // 找到阅读吗了,表示可以用户购买了这本书或者拥有阅读吗
                for(var i=0;i<records.length;i++){

                    var data=records[i];
                    if(data.user.indexOf(user) != -1 || (data.tradeTime < '1588307736000')){ //在4月29日晚12点之前的订单，因为存在bug（阅读码被别人用了），所以只要在这之前购买的订单都可以直接使用
                        //  用户读过这本书（用户id在阅读吗使用过的数组中）
                        res.jsonp({
                            status:1,mess:'ok',magazine:data.magazine
                        });
                        return;
                    }else {
                        if(data.tradeCount > data.readCodeUsed){
                            //记录用户阅读历史，然后把杂志信息返回前端
                            Record.useRecord(magazine,data.readCode,user,function (err, data) {
                                if(err)next(err);
                                Magazine.findOne({_id:magazine},function (err, data) {
                                    if(err)next(err);
                                    res.jsonp({
                                        status:1,mess:'ok',magazine:data
                                    });
                                })
                            });
                            return;
                        }
                        if( i >= records.length-1 ){
                            //无效阅读吗
                            res.jsonp({
                                status:40100,mess:'lack purchase'
                            });
                            return
                        }

                    }

                }
            }else {
                //    还没购买
                res.jsonp({
                    status:40100,mess:'还没购买'
                })
            }
        })
    }catch (e){
        console.log('阅读杂志出错',e);
        res.jsonp({
            status:0,mess:'请稍后重试'
        });
    }
}
