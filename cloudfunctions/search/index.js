// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })
  const { keyWord } = event
  const _ = db.command
  try {
    const result = await db.collection('DANDAN_NOTE')
      .where(_.or([{
        description: db.RegExp({
          regexp: `.*${keyWord}`,
          options: 'i'
        })
      },
      {
        money: db.RegExp({
          regexp: keyWord,
          options: 'i'
        })
      }
      ]).and({
        openId: wxContext.OPENID,
        isDel: false
      }))
      .orderBy('noteDate', 'desc')
      .orderBy('createTime', 'desc')
      .get()
    return {
      code: 1,
      data: result.data,
      message: '操作成功'
    }
  } catch (error) {
    return {
      code: -1,
      data: error,
      message: '操作失败'
    }
  }
}
