// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: process.env ? (process.env.ENV === 'local' ? 'release-wifo3' : wxContext.ENV) : wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: process.env ? (process.env.ENV === 'local' ? 'release-wifo3' : wxContext.ENV) : wxContext.ENV
  });
  const { mode } = event
  if (mode === 'get') {
    try {
      const res = await db.collection("DANDAN_WORD").get()
      return {
        code: 1,
        data: res.data[0],
        message: '获取成功'
      }
    } catch (error) {
      return {
        code: -1,
        data: {},
        message: '获取失败'
      }
    }
  }
}