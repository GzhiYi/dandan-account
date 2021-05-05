// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,

  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  });
  // const _ = db.command;
  if (event.mode === 'get') {
    const res = await db.collection('DONATE').get()
    return {
      data: res.data,
      code: 1,
      msg: '获取成功',
    }
  }
  if (event.mode === 'add') {
    const {
      name, donateTime, url, word,
    } = event
    const res = await db.collection('DONATE').add({
      data: {
        donateTime,
        name,
        url,
        word,
      },
    })
    return {
      data: res.data,
      code: 1,
      msg: '新增成功',
    }
  }
}
