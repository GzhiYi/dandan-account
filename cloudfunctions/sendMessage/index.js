// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({
    env
  })
  const db = cloud.database({ env })
  const _ = db.command
  // 先查询库中有没保留这个openId的记录
  const checkRes = await db.collection('SUBSCRIBE').get()
  const sendList = checkRes.data.filter(item => item.canSubscribe)
  try {
    sendList.forEach(async user => {
      try {
        const startTime = new Date(new Date(new Date().toLocaleDateString()).getTime())
        const endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)
        // 在发送之前查询这个openId在今天是否有进行记账
        const checkBill = await db.collection('DANDAN_NOTE')
          .where({
            openId: wxContext.OPENID,
            noteDate: _.gte(new Date(startTime)).and(_.lte(new Date(endTime)))
          })
          .get()
        // 如果账单数量为0，则说明今天没记到帐啦。
        if (checkBill.data.length === 0) {
          await cloud.openapi.subscribeMessage.send({
            touser: user.openId,
            page: 'pages/tab/tab',
            data: {
              time1: {
                value: parseTime(new Date(), '{y}年{m}月{d}日')
              },
              phrase2: {
                value: '记得记账哦'
              }
            },
            templateId: '29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'
          })
        }
      } catch (error) {
        // 如果出现错误，十有八九是因为订阅信息的量消耗完了。
        // 重置是否推送为false
        // 出现推送失败也不要重置为false，这不符合逻辑
        console.error('error。十有八九是因为订阅信息的量消耗完了',)
        // const docId = checkRes.data[0]._id
        // await db.collection('SUBSCRIBE').doc(docId)
        //   .update({
        //     data: {
        //       canSubscribe: false
        //     }
        //   })
      }
    })
    
  } catch (err) {
    return {
      code: 0,
      data: null,
      message: '订阅信息发送失败！'
    }
  }
}