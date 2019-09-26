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
  if (mode == 'update') {
    try {
      const { word, expire } = event
      console.log('word', word, expire)
      const authUsers = ['obBpt5WNBt2DoPFnUQyX5BA0O7L8']
      if (!authUsers.includes(wxContext.OPENID)) {
        return {
          code: -1,
          data: null,
          message: '无访问权限'
        }
      }
      const res = await db.collection("DANDAN_WORD").doc('23fdfcbb-0f0c-4196-9d53-8c1ae616f04b')
      .update({
        data: {
          word,
          show: true,
          expire
        }
      })
      return {
        code: 1,
        data: null,
        message: '更新成功'
      }
    } catch (error) {
      return {
        code: -1,
        data: error,
        message: '更新失败'
      }
    }
  }
}