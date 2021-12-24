/**
 * 每天统计每个用户的记账基本数据，包含字段：
1. 日期
2. 支出
3. 收入
4. 净收入
5. 记账次数
6. 用户openId
 */
const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')
const request = require('request')

cloud.init()
const MAX_LIMIT = 100
function strip(num, precision = 12) {
  return +parseFloat(num.toPrecision(precision))
}
function notify(title, content) {
  // eslint-disable-next-line global-require
  const { bark } = require('./token')
  if (bark) {
    request(`https://api.day.app/${bark}/${encodeURI(title)}/${encodeURI(content)}`)
  }
}
// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'dandan-zdm86' : wxContext.ENV
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })
  const _ = db.command
  // 有openId则表示只更新某个人的统计记录
  const { openId, noteDate } = event
  // 传入日期的开始和结束时间
  // 由于是定时任务，所以需要减少一天
  const todayStr = openId ? dayjs(noteDate).format('YYYY-MM-DD') : dayjs(noteDate).subtract(1, 'day').format('YYYY-MM-DD')
  const startTime = `${todayStr} 00:00:00`
  const endTime = `${todayStr} 23:59:59`
  const isToday = dayjs().format('YYYY-MM-DD') === todayStr
  if (!noteDate) {
    return {
      code: 0,
      msg: '未传入日期',
      data: null
    }
  }
  // 如果是更新某个人的统计数据，并且日期等于今天，则不更新
  if (openId && isToday) {
    return {
      code: 0,
      msg: '今天等定时任务统计',
      data: null
    }
  }
  // 由于性能有限，现在默认只统计自然日的数据，后面再把其他数据跑回来
  const queryAll = async (collectName, queryParams) => {
    const resultNum = await db.collection(collectName).where(queryParams).count()
    const { total } = resultNum
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection(collectName).where({
        ...queryParams
      }).skip(i * MAX_LIMIT).limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => ({
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }))
  }
  const calNote = (noteList, openIdList) => {
    let index = -1
    const addData = []
    while (++index < openIdList.length) {
      const oneOpenId = openIdList[index]
      const noteListByOpenId = noteList.filter((note) => note.openId === oneOpenId)
      let pay = 0
      let income = 0
      let netAsset = 0
      let payCount = 0
      let incomeCount = 0
      noteListByOpenId.forEach((note) => {
        // 支出
        if (note.flow === 0) {
          pay += note.money
          payCount += 1
        } else {
          income += note.money
          incomeCount += 1
        }
      })
      netAsset = income - pay
      addData.push({
        openId: oneOpenId,
        noteDate,
        pay: strip(pay),
        income: strip(income),
        netAsset: strip(netAsset),
        payCount,
        incomeCount,
        createTime: new Date(), // 写入时间
        updateTime: new Date() // 更新时间
      })
    }
    return addData
  }
  const params = {
    noteDate: _.gte(new Date(startTime)).and(_.lte(new Date(endTime))),
    isDel: false
  }
  if (openId) {
    params.openId = openId
  }
  const noteListRes = await queryAll('DANDAN_NOTE', params)
  const noteList = noteListRes.data
  // get openId from noteList
  const openIdList = Array.from(new Set(noteList.map((note) => note.openId)))
  const addData = calNote(noteList, openIdList)
  // 有openId，则只更新该用户该天的统计数据
  if (openId) {
    const oldRes = await db.collection('STAT').where({
      openId,
      noteDate: _.eq(todayStr)
    }).get()
    // 更新该条记录
    const updateData = addData[0]
    delete updateData.createTime
    try {
      if (oldRes.data.length) {
        await db.collection('STAT').doc(oldRes.data[0]._id).update({
          data: updateData
        })
      }
    } catch (error) {
      notify('更新统计数据失败', error.toString.slice(0, 100))
    }
  } else {
    // 插入今日统计数据
    try {
      await db.collection('STAT').add({
        data: addData
      })
    } catch (error) {
      notify('写入统计数据失败', error.toString.slice(0, 100))
    }
  }
  return {
    code: 1,
    msg: '写入STAT成功',
    data: null
  }
}
