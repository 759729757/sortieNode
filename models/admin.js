var mongoose = require('../mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var AdminSchema = new Schema({
    userName: String,     //登录名
    password: String,     //
    level:{type:Number,default:1},//权限，越高越大

})

var Admin = mongoose.model('admin', AdminSchema)
Promise.promisifyAll(Admin)
Promise.promisifyAll(Admin.prototype)

module.exports = Admin
