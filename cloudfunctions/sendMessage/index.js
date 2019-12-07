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
  // 先查询库中有没保留这个openId的记录
  const checkRes = await db.collection('SUBSCRIBE').get()
  const sendList = checkRes.data.filter(item => item.canSubscribe)
  try {
    sendList.forEach(async user => {
      try {
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
      } catch (error) {
        console.log('error', error)
      }
    })
    
  } catch (err) {
    console.log(err)
    return {
      code: 0,
      data: null,
      message: '订阅信息发送失败！'
    }
  }
}