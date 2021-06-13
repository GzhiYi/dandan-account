/**
 * 每天统计每个用户的记账基本数据，包含字段：
1. 日期
2. 支出
3. 收入
4. 净资产
5. 记账次数
6. 用户openId
 */
const cloud = require('wx-server-sdk')

cloud.init()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async () => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })
  const _ = db.command
  const queryAll = async (collectName, queryParams) => {
    const resultNum = await db.collection(collectName).count()
    const { total } = resultNum
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection(collectName).where({
        ...queryParams,
      }).skip(i * MAX_LIMIT).limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => ({
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }))
  }
  const calNote = (noteList) => {
    if (!noteList) {
      return {
        pay: 0,
        income: 0,
        netIncome: 0,
        noteLength: 0,
      }
    }
    let pay = 0
    let income = 0
    noteList.forEach((note) => {
      if (note.flow === 0) {
        pay += note.money
      }
      if (note.flow === 1) {
        income += note.money
      }
    })
    return {
      pay,
      income,
      netIncome: income - pay,
      noteTime: noteList.length,
    }
  }
  const userData = await queryAll('USERS')
  const userList = userData.data
  const endDate = new Date()
  const startDate = new Date().setDate(new Date().getDate() - 1)
  if (userList instanceof Array) {
    for (let i = 0; i < userList.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const noteData = await queryAll('DANDAN_NOTE', {
        openId: userList[i].openId,
        noteDate: _.gt(new Date(startDate)).and(_.lte(endDate)),
        isDel: false,
      })
      if (noteData.data && noteData.data.length) {
        const {
          pay, income, netIncome, noteTime,
        } = calNote(noteData.data)
        // eslint-disable-next-line no-await-in-loop
        await db.collection('STAT').add({
          data: {
            date: new Date(),
            pay,
            income,
            netIncome,
            noteTime,
            openId: wxContext.OPENID,
          },
        })
      }
    }
  }
  return {
    code: 1,
    msg: '写入STAT成功',
    data: null,
  }
}
