const express = require('express');
const router = express.Router();

var alioss = require('./../config/alioss')

// 获取token
router.get('/alioss/getOssToken', function(req, res) {
    console.log('获取阿里云OSS token');
    // res.append('Access-Control-Allow-Origin', '*')
    const result = alioss.getOssToken(req, res)

    if (result) {
        res.jsonp({
            code: 100,
            data: result
        })
    }
});









module.exports = router;
