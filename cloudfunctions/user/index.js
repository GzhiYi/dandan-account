/**
 * 该云函数只做用户openId的收集，不关联用户账单。
*/
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  });
  if (event.mode === 'add') {
    db.collection('USERS').add({
      data: {
        openId: wxContext.OPENID,
        appId: wxContext.APPID,
        unionId: wxContext.UNIONID,
        createTime: new Date(),
      },
    })
    return {
      code: 1,
      msg: '注册成功',
      data: null,
    }
  }
  return {
    event,
    openId: wxContext.OPENID,
    appId: wxContext.APPID,
    unionId: wxContext.UNIONID,
  }
}
