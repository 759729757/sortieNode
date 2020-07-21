const moment = require('moment')
const mongoose = require('../mongoose')
mongoose.set('useFindAndModify', false);
var multiparty = require('multiparty');
const Common = require('../utils/common');
var fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');  //用来生成token
const config = require('../config');//配置文件

const Article = mongoose.model('article')
const User = mongoose.model('user')
const Banner = mongoose.model('banner')
const About = mongoose.model('about')
const Admin = mongoose.model('admin')
const Magazine = mongoose.model('magazine')
const Record = mongoose.model('record');


/**
 * 管理员登录
 * **/
exports.login = (req, res) => {
    const {
        userName, password
    } = req.body;
    Admin.findOne({
        userName, password
    }).then(result => {
        if (result) {
            let content = {name: result.userName, _id: result._id}; // 要生成token的主题信息
            let secretOrPrivateKey = config.tokenKey;// 这是加密的key（密钥）
            let token = jwt.sign(content, secretOrPrivateKey, {
                expiresIn: 60 * 60 * 24  // 24小时过期
            });
            return res.jsonp({
                code: 200, status: 1,
                mess: '登录成功',
                token: token
            })
        } else {
            return res.jsonp({
                code: 200, status: -1,
                mess: '账号或密码错误',
            })
        }

    }).catch(err => {
        res.jsonp({
            code: -200,
            mess: err.toString()
        })
    })
};

/**
 *上传图片
 */
exports.uploadImage = (req, res) => {
    //生成multiparty对象，并配置上传目标路径
    const _path = './public/images/';
    let magazineNum = req.get('magazineNum');
    let uploadPath = magazineNum ? _path + magazineNum + '/' : _path;
    // fs.existsAsync( path,function(exists){
    //     if(!exists){
    //         console.log("创建新文件夹",magazineNum);
    //        return fs.mkdirAsync(path,function(err){
    //            return  uploadPath;
    //         });
    //     }else {
    //         return  uploadPath;
    //     }
    // });
    var form = new multiparty.Form({
        uploadDir:
        _path
    });

    //上传完成后处理
    form.parse(req, function (err, fields, files) {
        var obj = {};

        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            console.log('parse files: ' + files);
            var inputFile = files.image[0];
            var uploadedPath = inputFile.path;

            res.jsonp({
                code: 200,
                mess: '发布成功',
                data: (uploadedPath.split('\\')).pop()
            })
        }
    });
};


/**
 * 上传banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.uploadBanner = (req, res) => {
    const {
        title,
        content,//展示的内容
        putAway,
    } = req.body;
    //
    const data = {
        title,
        img_url: (req.files.image.path.split('\\')).pop(),
        putAway: putAway,
        content,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    console.log(req.files);
    Banner.createAsync(data)
        .then(result => {
            return res.json({
                code: 200,
                mess: '发布成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
}

/**
 * 更新banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.updateBanner = (req, res) => {
    let {
        _id,
        img_url,//图片地址
        title,
        content,//展示的内容
        putAway,
    } = req.body;
    //
    console.log(req.files)
    var imgUrl = req.files.image.originalFilename && (req.files.image.path.split('\\')).pop();//拿到文件名
    var ext = imgUrl.split('.').pop(); //拿到文件名后缀

    img_url = (Common.isAssetTypeAnImage(ext) && imgUrl) || img_url;
    const data = {
        title,
        content,
        img_url: img_url,
        putAway: putAway,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    Banner.findOneAndUpdateAsync({_id: _id}, data)
        .then(result => {
            return res.json({
                code: 200,
                mess: '发布成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
}
/**
 * 删除banner图片
 * @method
 */
exports.delBanner = (req, res) => {
    const _id = req.query.id;
    Banner.remove({_id})
        .then((result) => {
            res.json({
                code: 200,
                mess: '更新成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
}


/**
 * 添加文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.addItem = (req, res) => {
    console.log(req.body);
    try {
        const {
            poster,
            title,video,swiper,
            content,//展示的内容
            putAway,
            readNum,
            articleType,
            likeNum
        } = req.body;

        console.log('img_url',req.files);
        var imgUrl = req.files && req.files.image && req.files.image.originalFilename && (req.files.image.path.split('\\')).pop();//拿到文件名
        var ext = imgUrl && imgUrl.split('.').pop() || ''; //拿到文件名后缀

        let img_url = (Common.isAssetTypeAnImage(ext) && imgUrl) || '';
        const data = {
            title,poster,video,swiper,
            img_url: img_url,
            putAway: putAway,
            readNum: readNum,
            likeNum: likeNum,
            content, articleType,
            creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
        console.log(req.files);
        Article.create(data)
            .then(result => {
                return res.json({
                    code: 200, status: 1,
                    mess: '发布成功',
                    data: result
                })
            })
            .catch(err => {
                res.json({
                    code: -200,
                    mess: err.toString()
                })
            })
    } catch (e) {
        res.json({
            code: -200,
            mess: err.toString()
        })
    }
}

/**
 * 修改文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.updateItem = (req, res) => {
    let {
        _id,poster,
        title,video,swiper,
        content,//展示的内容
        putAway,
        readNum,
        likeNum,
        articleType
    } = req.body;

    var imgUrl = req.files && req.files.image && req.files.image.originalFilename && (req.files.image.path.split('\\')).pop();//拿到文件名
    var ext = imgUrl && imgUrl.split('.').pop() || ''; //拿到文件名后缀
    let img_url = (Common.isAssetTypeAnImage(ext) && imgUrl) || '';

    const data = {
        title,poster,video,swiper,
        img_url: img_url,
        putAway: putAway,
        readNum: readNum,
        likeNum: likeNum,
        articleType:articleType,
        content,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    Article.findOneAndUpdateAsync({_id: _id}, data)
        .then(result => {
            return res.json({
                code: 200,status: 1,
                mess: '修改成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
};
/**
 * 删除文章
 * @method
 */
exports.delItem = (req, res) => {
    const _id = req.query.id;
    Article.remove({_id})
        .then((result) => {
            res.json({
                code: 200,status:1,
                mess: '删除成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
}

/**
 * 修改关于我的
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.updateAbout = (req, res) => {
    console.log(req.body)
    let {
        _id,
        title,
        content,//展示的内容
        readNum,
        likeNum
    } = req.body;
    //
    const data = {
        title,
        readNum: readNum,
        likeNum: likeNum,
        content,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    About.findOneAndUpdateAsync({_id: _id}, data)
        .then(result => {
            return res.json({
                code: 200,
                mess: '修改成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
};
/***
 * 删除 关于我们
 * */
exports.delAbout = (req, res) => {
    const _id = req.query.id;
    About.remove({_id})
        .then((result) => {
            res.json({
                code: 200,
                mess: '删除成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
};


/**
 * 添加杂志
 * **/
exports.addMagazine = (req, res) => {
    var body = req.body;
    console.log('magazine', body);
    try {
        Magazine.createAsync(body)
            .then(result => {
                return res.json({
                    code: 200,
                    mess: '上传成功',
                    data: result
                })
            })
            .catch(err => {
                res.json({
                    code: -200,
                    mess: err.toString()
                })
            })
    } catch (e) {
        console.log(e)
    }
}
/***
 * 修改杂志
 * **/
exports.updateMagazine = (req, res) => {
    var body = req.body;
    console.log('magazine', body);
    try {
        Magazine.findOneAndUpdateAsync({_id: body._id}, body)
            .then(result => {
                return res.json({
                    code: 200,
                    mess: '上传成功',
                    data: result
                })
            })
            .catch(err => {
                res.json({
                    code: -200,
                    mess: err.toString()
                })
            })
    } catch (e) {
        console.log(e)
    }
}
/**
 * 删除杂志
 * **/
exports.delMagazine = (req, res) => {
    const _id = req.query._id;
    if(!_id){
        res.json({
            code: -200,
            mess:'invalid'
        })
    }
    Magazine.removeAsync({_id: _id })
        .then((result) => { //删除关联数据
            res.json({
                code: 200,
                mess: '删除成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })

}

/**
 * 生成阅读码
 * */
exports.makeReadCode = (req, res) => {
    var query = req.query
        ,readCode = Common.getRandomCode(10); //生成8位阅读码
    Record.create(
        {
            coupon:true,
            magazine:query.magazine,
            amount:0,
            tradeId:'管理员创建',
            readCode:readCode,
            tradePrice:0,
            tradeCount:query.tradeCount,
            tradeTime:new Date().valueOf(),
            isPay:true,
        },
        function (err, data) {
            if(err)next(err);
            res.json({ status: 1, readCode: readCode });
        }
    );
};
/**
 * 获取阅读码
 * */
//分页获取 交易记录
exports.getRecord = (req, res) => {
    var query = req.query;
    var page = query.page || 1,
        limit = query.limit || 10;
    delete query['page'];
    delete query['limit'];
    delete query['userInfo'];

    page --;

    Record.count(query,function (err, amount) {
        Record.find(query)
            .sort({_id:-1})
            .skip(page*limit)
            .limit(limit)
            .populate('buyer magazine')
            .then(data => {
                res.jsonp({
                    status:1,mess:'ok',
                    data:data,
                    total:amount
                })
            }).catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })

    })
};

/**
 * 获取用户
 * **/
exports.fetchUser = (req, res) => {
    var query = req.query;
    var page = query.page || 1,
        limit = query.limit || 10;
    page--;

    delete query['page'];
    delete query['limit'];
    delete query['userInfo'];

    User.count(query, function (err, amount) {
        User.find(query)
            .sort({_id: -1})
            .skip(page * limit)
            .limit(limit)
            .then(result => {
                res.json({
                    code: 200,
                    mess: '获取成功',
                    data: result,
                    amount: amount
                })
            }).catch(err => {
            res.json({
                code: -200,
                mess: err.toString()
            })
        })
    });
}


/**
 * 删除用户
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */

exports.delUser = (req, res) => {
    const _id = req.query.id
    User.find({_id}).then(result => {
        let user = result[0]
        User.removeAsync({"openid": user.openid})
            .then((result) => { //删除关联数据
                res.json({
                    code: 200,
                    mess: '删除成功',
                    data: result
                })
            })
            .catch(err => {
                res.json({
                    code: -200,
                    mess: err.toString()
                })
            })
    })

}

