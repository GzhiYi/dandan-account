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
    // eslint-disable-next-line radix
    if ((`${time}`).length === 10) time = parseInt(time) * 1000
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
      value = `0${value}`
    }
    return value || 0
  })
  return timeStr
}

// 云函数入口函数
exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({
    env
  })
  const db = cloud.database({ env })
  const _ = db.command
  // 先查询库中有没保留这个openId的记录
  const checkRes = await db.collection('SUBSCRIBE').get()
  const sendList = checkRes.data.filter((item) => item.canSubscribe)
  try {
    const startTime = new Date(new Date(new Date().toLocaleDateString()).getTime())
    const endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)
    const tasks = []
    sendList.forEach(async (user) => {
      // 在发送之前查询这个openId在今天是否有进行记账
      const checkBillPromise = db.collection('DANDAN_NOTE')
        .where({
          openId: user.openId,
          noteDate: _.gte(new Date(startTime)).and(_.lte(new Date(endTime)))
        })
        .get()
      tasks.push(checkBillPromise)
    })
    const final = await Promise.all(tasks)
    const sendTasks = []
    for (let i = 0; i < final.length; i++) {
      const tempInLoop = final[i].data
      if (tempInLoop.length === 0) {
        // 今天没记账
        // eslint-disable-next-line no-console
        console.log(`向${sendList[i].openId}发送推送`)
        // eslint-disable-next-line no-await-in-loop
        const sendPromise = cloud.openapi.subscribeMessage.send({
          touser: sendList[i].openId,
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
        sendTasks.push(sendPromise)
      }
    }
    try {
      await Promise.all(sendTasks)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('十有八九是订阅用完了', error)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('订阅信息发送失败！错误', err)
    return {
      code: 0,
      data: null,
      message: '订阅信息发送失败！'
    }
  }
}
