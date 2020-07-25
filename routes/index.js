const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({uploadDir: './public/images/'});
const intercept = require('../routes/intercept');
const bodyParser = require('body-parser');

require("body-parser-xml")(bodyParser);//微信支付解析xml
const jsonParser = bodyParser.json();

// const homeApi = require('../api/home-api.js')
const adminApi = require('../api/admin-api.js');
const publicApi = require('../api/public-api.js')
const purchase = require('../api/purchase-api')
// const orderApi = require('../api/order-api.js')

// // ------- 管理 -------
// router.get('/v1/admin/delUser', intercept.admin,adminApi.delUser) //删除用户
//管理员登录
router.post('/admin/login',adminApi.login)

//上传图片
router.post('/admin/uploadImg',bodyParser.json(),adminApi.uploadImage);

// banner
router.get('/fetchBanner',publicApi.fetchBanner); //关于我们
router.get('/admin/delBanner', intercept.admin,adminApi.delBanner) //删除Banner
router.post('/admin/addBanner',multipartMiddleware,adminApi.uploadBanner) //添加Banner
router.post('/admin/updateBanner',multipartMiddleware,adminApi.updateBanner) //修改Banner

//杂志相关
router.get('/fetchMagazine',publicApi.fetchMagazine); //
router.get('/readMgz',intercept.user,publicApi.readMgz); //阅读杂志
router.get('/admin/delMagazine',intercept.admin,adminApi.delMagazine); //删除
router.post('/admin/magazine',intercept.admin,adminApi.addMagazine); //添加杂志
router.post('/admin/updateMagazine',intercept.admin,adminApi.updateMagazine); //修改杂志
router.get('/admin/makeReadCode',intercept.admin,adminApi.makeReadCode); //生成阅读码
router.get('/admin/getRecord',intercept.admin,adminApi.getRecord); //生成阅读码

//新闻
router.get('/fetchNews',publicApi.fetchNews); //
router.get('/admin/delNews', intercept.admin,adminApi.delItem) //删除新闻
router.post('/admin/addNews',multipartMiddleware,adminApi.addItem) //添加新闻
router.post('/admin/updateNews',multipartMiddleware,adminApi.updateItem) //修改新闻

//关于我们
router.get('/fetchAbout', intercept.admin,publicApi.fetchAbout); //关于我们
router.post('/updateAbout',adminApi.updateAbout); //更新关于我们
router.get('/delAbout',intercept.admin, adminApi.delAbout); //删除Banner

//用户相关
router.get('/admin/fetchUser', intercept.admin,adminApi.fetchUser); //用户相关

router.get('/loginByCode', publicApi.loginByCode);
router.post('/updateUserInfo',intercept.user, publicApi.updateUserInfo );
router.post('/updatePhone',intercept.user, publicApi.updatePhone );


//微信支付相关
router.get('/wxPurchase',intercept.user,purchase.order ); //发起订单请求
router.post('/purchaseCallback',purchase.purchaseCallback );//微信支付成功回调

//公共
router.get('/commit/config', publicApi.wechatConfig );



router.get('*', (req, res) => {
    res.json({
        code: -200,
        message: '没有找到该接口'
    })
})
router.post('*', (req, res) => {
    res.json({
        code: -200,
        message: '没有找到该接口'
    })
})

module.exports = router
