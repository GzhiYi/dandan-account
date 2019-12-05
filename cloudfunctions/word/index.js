// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const env = process.env ? (process.env.ENV === 'local' ? 'release-wifo3' : wxContext.ENV) : wxContext.ENV
  cloud.updateConfig({
    env
  })
  // 初始化数据库
  const db = cloud.database({
    env
  });
  const { mode } = event
  if (mode === 'get') {
    try {
      const res = await db.collection("DANDAN_WORD").get()
      const payTypeAuthUsers = ['obBpt5XdwPJAfwnIWEq2FZdDIrBQ']
      return {
        code: 1,
        data: res.data[0],
        showPayType: payTypeAuthUsers.includes(wxContext.OPENID),
        payTypeList: [
          '',
          '支付宝',
          '微信',
          '信用卡',
          '掌上生活',
          '招商银行'
        ],
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
      // 能够进行设置banner的openId列表
      const authUsers = [
        'obBpt5WNBt2DoPFnUQyX5BA0O7L8',
        'obBpt5XdwPJAfwnIWEq2FZdDIrBQ',
        'obBpt5fRcE7ZHHM8pZWTEaUcYj-k'
      ]
      if (!authUsers.includes(wxContext.OPENID)) {
        return {
          code: -1,
          data: null,
          message: '无访问权限'
        }
      }
      const wordId = {
        'release-wifo3': '23fdfcbb-0f0c-4196-9d53-8c1ae616f04b',
        'dandan-zdm86': '9a27f33c-a75f-4495-a04d-0d5f98f51231'
      }
      const res = await db.collection("DANDAN_WORD").doc(wordId[env])
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