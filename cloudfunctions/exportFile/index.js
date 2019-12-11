// 云函数入口文件
const cloud = require('wx-server-sdk')
const excel = require('excel-export')

cloud.init()
const MAX_LIMIT = 100

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
    a: date.getDay(),
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
    env,
  })
  const db = cloud.database({
    env,
  })
  const cateMap = {}
  try {
    // 查询该用户已有分类
    const getCategoryRes = await cloud.callFunction({
      name: 'getCategory',
      data: {},
    })
    if (getCategoryRes.result.code === 1) {
      const categoryList = getCategoryRes.result.data
      categoryList.forEach((parent) => {
        parent.children.forEach((child) => {
          cateMap[child._id] = child
        })
      })
    }
    // eslint-disable-next-line no-console
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('获取分类失败啦', error)
  }
  // 查询用户的账单
  try {
    const countResult = await db.collection('DANDAN_NOTE')
      .where({
        openId: wxContext.OPENID,
        isDel: false,
      })
      .count()
    const { total } = countResult
    const batchTimes = Math.ceil(total / 100)
    const tasks = []

    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('DANDAN_NOTE')
        .where({
          openId: wxContext.OPENID,
          isDel: false,
        })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    const final = await Promise.all(tasks)
    const rowData = []
    for (let i = 0; i < final.length; i++) {
      const tempInLoop = final[i].data
      for (let j = 0; j < tempInLoop.length; j++) {
        rowData.push([
          parseTime(tempInLoop[j].createTime, '{y}/{m}/{d}/ {h}:{m}:{s}'),
          parseTime(tempInLoop[j].noteDate, '{y}/{m}/{d}/'),
          cateMap[tempInLoop[j].categoryId] ? cateMap[tempInLoop[j].categoryId].categoryName : '杂项',
          tempInLoop[j].flow === 0 ? -tempInLoop[j].money : tempInLoop[j].money,
          tempInLoop[j].description,
        ])
      }
    }
    try {
      // 做数据导出操作
      const conf = {}
      conf.stylesXmlFile = 'styles.xml'
      conf.name = 'mysheet'
      // 设置表格列格式等
      conf.cols = [{
        caption: '创建时间',
        type: 'string',
      }, {
        caption: '消费日期',
        type: 'string',
      }, {
        caption: '分类',
        type: 'string',
      }, {
        caption: '金额',
        type: 'number',
      }, {
        caption: '备注',
        type: 'string',
      }]
      // 设置表格内容
      conf.rows = rowData
      const result = excel.execute(conf)
      Buffer.from(result.toString(), 'binary')
      const uplodaRes = await cloud.uploadFile({
        cloudPath: `download/sheet/单单记账-账单(${wxContext.OPENID.slice(3, 8)}).xlsx`, // excel文件名称及路径，即云存储中的路径
        fileContent: Buffer.from(result.toString(), 'binary'),
      })
      // eslint-disable-next-line no-console
      console.log('uplodaRes', uplodaRes)
      return {
        code: 1,
        data: uplodaRes,
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('导出出错', error)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('查询出错', error)
  }
}
