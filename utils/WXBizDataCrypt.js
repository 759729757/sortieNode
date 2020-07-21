var crypto = require('crypto')


function WXBizDataCrypt(appId, sessionKey) {
  this.appId = 'wxaa8730bf8449a279'
  this.sessionKey = '2f2c02aa2d02d3a137fe66b0b4bc38d7'
}


WXBizDataCrypt.prototype.decryptData = function (__encryptedData, __iv) {
  // base64 decode
  var sessionKey = new Buffer(this.sessionKey, 'base64'),
  encryptedData = new Buffer(__encryptedData, 'base64'),
  iv = new Buffer(__iv, 'base64')
  // var _sessionKey = Buffer.from(this.sessionKey, 'utf-8'),
  // _encryptedData = Buffer.from(__encryptedData, 'utf-8'),
  // _iv = Buffer.from(__iv, 'utf-8');
  //
  // var sessionKey = _sessionKey.toString('base64'),
  //     encryptedData = _encryptedData.toString('base64'),
  //     iv = _iv.toString('base64');

  try {
     // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true)
    var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    decoded += decipher.final('utf8')

    decoded = JSON.parse(decoded)

  } catch (err) {
    throw new Error('Illegal Buffer')
  }

  if (decoded.watermark.appid !== this.appId) {
    throw new Error('Illegal Buffer')
  }

  return decoded
}
var pc = new WXBizDataCrypt();
console.log(pc.decryptData("yIV/g3VFuWWdfTFG9pkSN4Qo087shrzdvq6nBr9e9RNoIKIRVK2K5kYOUIvGWtG1f36YedSiu7uQAoN36/eJDrkS8lMRNSU/xKyM0MrQmE2EC79TqsyG9SU2J5tN2jaGJtqrxNppNbL5AHbyfiiYc+uXI2/+t0pVRWG49iir7ZNLzKU5CaZWxN7vVX32uDeRFcljroYMFuH1GqekOMM4JBQKpPiG80jcQXrXvHtl86QPeATXUqRyfXUH4+HldoXWptOyFsD8pch3UQzicOTnVEFIGtCzsGiOZsvq09ScBgNazmVcjI8mLaUbv3+pSpyYkL49Lxrfd2xu//bhvWKhVwiugW8Ll9IdbOOrjZYN4NITS63d37tlxk7ew5RAlMCzyEtQwlWQFzAgRPapA/nrFRst6mYvfpXk3cmO6w3iWdbf1DIROicZOyhfCkuUAFB8PIrceyzmbi7aRu69CbogaZKzOr9sYPMQthKtejySD84=",'JM0YbW6r0GEmWclhPamudg=='))
// module.exports = WXBizDataCrypt
