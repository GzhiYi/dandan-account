// 云函数入口文件
const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')

cloud.init()

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
  const checkRes = await db.collection('SUBSCRIBE').where({
    canSubscribe: true
  }).get()
  const sendList = checkRes.data
  try {
    // 今天的开始和结束时间
    const todayStr = dayjs().format('YYYY-MM-DD')
    const startTime = `${todayStr} 00:00:00`
    const endTime = `${todayStr} 23:59:59`
    if (sendList.length > 0) {
      // 判断已订阅列表中的用户今日是否有记账
      const checkAccountTodayRes = await db.collection('DANDAN_NOTE')
        .where({
          openId: _.in(sendList.map((user) => user.openId)),
          noteDate: _.gte(new Date(startTime)).and(_.lte(new Date(endTime)))
        })
        .get()
      const canSendList = Array.from(new Set(checkAccountTodayRes.data.map((item) => item.openId)))
      const sendTask = []
      canSendList.forEach((item) => {
        const reqTask = cloud.openapi.subscribeMessage.send({
          touser: item,
          page: 'pages/tab/tab',
          data: {
            time1: {
              value: dayjs().format('YYYY年MM月DD日')
            },
            phrase2: {
              value: '记得记账哦'
            }
          },
          templateId: '29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'
        })
        sendTask.push(reqTask)
      })
      await Promise.all(sendTask)
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
