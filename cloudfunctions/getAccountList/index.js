/* eslint-disable no-undef */
// 云函数入口文件
const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  /**
   * 获取账单列表
   * @param {String} categoryId 分类id
   * @param {String} startDate 开始日期
   * @param {String} endDate 结束日期
   * @param {Number} page 页码，必填
   * @param {Number} limit 每页数量，必填
   * @param {String} mode 请求接口
   */
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })
  const _ = db.command
  // page: 当前页数
  // limit: 当前页面加载的个数
  const {
    page,
    limit,
    startDate,
    endDate,
    categoryId
  } = event
  if (!page || !limit) {
    return {
      code: 0,
      msg: 'page or limit is empty'
    }
  }
  try {
    // 分页偏移量公式: (page - 1) * limit
    // 计算偏移量
    const offset = (page - 1) * limit
    const basicWhere = {
      isDel: false,
      openId: _.eq(wxContext.OPENID),
      noteDate: _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    }
    // 如果有分类id, 则按照分类id划定分类范围
    let matchCategoryList = [] // 每一笔NOTE都是取用子类的，所以只需要找出子类就好
    if (categoryId) {
      // 查询开始和结束时间内，分类为categoryId以及该categoryId下子分类的所有账单
      // 1. 查询账单应当包含的分类id，用数组表示
      const matchCategoryRes = await db.collection('DANDAN_NOTE_CATEGORY').where({
        isDel: false,
        openId: _.in([wxContext.OPENID, 'SYSTEM']),
        parentId: categoryId
      }).get()
      matchCategoryList = matchCategoryRes.data
      basicWhere.categoryId = _.in(matchCategoryList.map((item) => item._id))
    }
    // 计算总笔数
    const totalCountRes = await db.collection('DANDAN_NOTE').where(basicWhere).count()
    // 2. 查询账单
    const noteRes = await db.collection('DANDAN_NOTE')
      .where(basicWhere)
      .skip(offset)
      .limit(limit)
      .orderBy('noteDate', 'desc')
      .orderBy('createTime', 'desc')
      .get()
    const noteList = noteRes.data
    noteList.forEach((note) => {
      note.noteDate = dayjs(note.noteDate).format('YYYY-MM-DD')
    })
    console.log('查看返回账单', noteList, totalCountRes)
    return {
      code: 1,
      data: {
        page: noteList,
        count: totalCountRes.total,
        rangeResult: [],
        monthResult: []
      },
      message: '获取记录成功'
    }
  } catch (e) {
    return {
      code: -1,
      data: {
        page: [],
        count: 0
      },
      message: `获取记录失败，e：${e}`
    }
  }
}

// 补全账单内容
// function completeInfo(note, category) {
//   // 转换日期格式
//   // eslint-disable-next-line no-use-before-define
//   note.noteDate = parseTime(note.noteDate, '{y}-{m}-{d}')

//   // 貌似没有记录的话, 就直接被catch掉了
//   if (category !== undefined) {
//     note.category = category
//   }
// }

// function parseTime(time, cFormat) {
//   if (arguments.length === 0) {
//     return null
//   }
//   const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
//   let date
//   if (typeof time === 'object') {
//     date = time
//   } else {
//     // eslint-disable-next-line radix
//     if ((`${time}`).length === 10) time = parseInt(time) * 1000
//     date = new Date(time)
//   }
//   const formatObj = {
//     y: date.getFullYear(),
//     m: date.getMonth() + 1,
//     d: date.getDate(),
//     h: date.getHours(),
//     i: date.getMinutes(),
//     s: date.getSeconds(),
//     a: date.getDay()
//   }
//   const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
//     let value = formatObj[key]
//     if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
//     if (result.length > 0 && value < 10) {
//       value = `0${value}`
//     }
//     return value || 0
//   })
//   return timeStr
// }

// function doHandleMonth() {
//   const myDate = new Date()
//   const tMonth = myDate.getMonth()

//   let m = tMonth + 1
//   if (m.toString().length === 1) {
//     m = `0${m}`
//   }
//   return m
// }

// function doHandleYear() {
//   const myDate = new Date()
//   const tYear = myDate.getFullYear()

//   return tYear
// }
