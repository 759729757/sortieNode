const moment = require('moment')
const mongoose = require('../mongoose')
var multiparty = require('multiparty');


const Article = mongoose.model('article')
const User = mongoose.model('User')
const Banner = mongoose.model('banner')


/**
 *上传图片
 */
exports.uploadImage = (req,res)=>{
    //生成multiparty对象，并配置上传目标路径
    const uploadPath = '../public/images/';
    var form = new multiparty.Form({uploadDir: uploadPath});

    //上传完成后处理
    form.parse(req, function(err, fields, files) {
        var obj ={};

        var filesTmp = JSON.stringify(files,null,2);
        if(err){
            console.log('parse error: ' + err);
        }
        else {
            console.log('parse files: ' + filesTmp);
            var inputFile = files.inputFile[0];
            var uploadedPath = inputFile.path;
            var dstPath = uploadPath + inputFile.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    console.log('rename error: ' + err);
                    res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
                    res.end("{'status':200, 'message': '上传失败！'}");
                } else {
                    console.log('rename ok');
                    res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
                    res.end("{'status':400, 'message': '上传成功！'}");
                }
            });
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

exports.uploadBanner = (req,res) => {

     //生成multiparty对象，并配置上传目标路径
    const form = new multiparty.Form({uploadDir: './file/banner'});

    form.parse(req,(err, fields, files)=>{
        if(err){
            console.log(err);
        }else{
            var inputFile = files.inputFile[0];
            let data = {
                img_url:inputFile.path,        //图片地址
                href:fields.href[0],           //跳转地址
                name:fields.name[0],           //名称
                is_show:fields.is_show[0],       //是否显示
                effective:fields.effective[0].split(','),       //有效期
            }
            return Banner.createAsync(data).then(result => {
                res.json({
                    code: 200,
                    message: '添加成功',
                    data: result
                })
            }).catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
                })
            })
        }
    })
}

/**
 * 更新banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */

exports.updateBanner = (req,res) => {

    //生成multiparty对象，并配置上传目标路径
   const form = new multiparty.Form({uploadDir: './file/banner'});

   form.parse(req,(err, fields, files)=>{
       if(err){
           console.log(err);
       }else{
           var inputFile = files.inputFile[0];
           let data = {
               img_url:inputFile.path,        //图片地址
               href:fields.href[0],           //跳转地址
               name:fields.name[0],           //名称
               is_show:fields.is_show[0],       //是否显示
               effective:fields.effective[0].split(','),       //有效期
           }
           return Banner.createAsync(data).then(result => {
               res.json({
                   code: 200,
                   message: '添加成功',
                   data: result
               })
           }).catch(err => {
               res.json({
                   code: -200,
                   message: err.toString()
               })
           })
       }
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
    const {
        img_url,//图片地址
        title,
        content,//展示的内容
        putAway,readNum,likeNum
    } = req.body ;
    //
    var imgUrl = req.files.image.path;
    console.log(imgUrl);
    const data = {
        title,
        img_url:(req.files.image.path.split('\\')).pop(),
        putAway:putAway,readNum:readNum,likeNum:likeNum,
        content,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    console.log(req.files);
    Article.createAsync(data)
    .then(result => {
        return res.json({
            code: 200,
            message: '发布成功',
            data: result
        })
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
}



/**
 * 删除文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.delItem = (req, res) => {
    const _id = req.query.id
    Article.updateAsync({ _id }, { is_delete: 1 })
        .then((result) => {
            res.json({
                code: 200,
                message: '更新成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
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
    User.find({_id}).then(result=>{
        let user = result[0]
        User.removeAsync({"openid":user.openid})
        .then((result) => { //删除关联数据
            res.json({
                code: -200,
                message: '删除成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
    })

}

