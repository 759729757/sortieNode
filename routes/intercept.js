const mongoose = require('../mongoose')
const jwt = require('jsonwebtoken');  //用来生成token
const config = require('../config');//配置文件

exports.admin = (req, res, next)=>{ //验证管理员权限
    // console.log(req.body)
    let token = req.get("Authorization"); // 从Authorization中获取token
    // console.log('token',token);
    let secretOrPrivateKey = config.tokenKey; // 这是加密的key（密钥）
    jwt.verify(token, secretOrPrivateKey, (err, decode)=> {
        if (err) {  //  时间失效的时候 || 伪造的token
            console.log('token 无效');
            // res.status(401);
            res.jsonp({'status':10010,mess:"invalid token!"});
        } else {
            // console.log('token:',decode);
            req.query.userInfo = decode;
            // console.log(decode);
            next();
        }
    })
}

exports.user = (req, res, next)=>{ //验证用户是否登录
    const token = req.query.token || req.body.token || req.get("Authorization");
    let secretOrPrivateKey = config.tokenKey; // 这是加密的key（密钥）
    // console.log('token ',token);
    jwt.verify(token, secretOrPrivateKey, (err, decode)=> {
        if (err) {  //  时间失效的时候 || 伪造的token
            console.log('token 无效');
            // res.status(401);
            res.jsonp({'status':10010,mess:"invalid token!"});
        } else {
            console.log('token:',decode);
            req.query.userInfo = decode;
            // console.log(decode);
            next();
        }
    })
}
