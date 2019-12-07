// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({
    env
  })
  const db = cloud.database({ env })
  try {
    // 先查询库中有没保留这个openId的记录
    const checkRes = await db.collection('SUBSCRIBE')
      .where({
        openId: wxContext.OPENID
      })
      .get()
    if (event.mode === 'post') {
      // 如果用户开启
      if (event.type === 'open') {
        if (checkRes.data.length === 0) {
          await db.collection('SUBSCRIBE').add({
            data: {
              openId: wxContext.OPENID,
              canSubscribe: true
            }
          })
        } else {
          const docId = checkRes.data[0]._id
          await db.collection('SUBSCRIBE').doc(docId)
            .update({
              data: {
                canSubscribe: true
              }
            })
        }
      }
      if (event.type === 'close') {
        // 如果关闭
        const docId = checkRes.data[0]._id
        await db.collection('SUBSCRIBE').doc(docId)
          .update({
            data: {
              canSubscribe: false
            }
          })
      }
    }
    if (event.mode === 'get') {
      return {
        code: 1,
        data: checkRes.data[0].canSubscribe
      }
    }
  } catch (error) {
    return {
      code: 1,
      data: JSON.stringify(error)
    }
  }
}