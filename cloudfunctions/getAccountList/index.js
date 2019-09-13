// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 50;


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: process.env.ENV === 'release' ? 'release-wifo3' : wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: process.env.ENV === 'release' ? 'release-wifo3' : wxContext.ENV
  });
  const _ = db.command;
  // page: 当前页数
  // limit: 当前页面加载的个数
  let { page, limit, startDate, endDate } = event;
  page = Number.parseInt(page);
  limit = Number.parseInt(limit);
  if (!Number.isInteger(page)) {
    page = DEFAULT_PAGE;
  }
  if (!Number.isInteger(limit)) {
    limit = DEFAULT_LIMIT;
  }

  if (page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE;
  }
  if (limit <= 0) {
    limit = DEFAULT_LIMIT
  }
  // 限制最大加载条数
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }
  try {
    // 分页偏移量公式: (page - 1) * limit
    // 计算偏移量
    let offset = (page - 1) * limit;

    const basicWhere = {
      isDel: false,
      openId: _.eq(wxContext.OPENID),
    }

    // 主页, 基本列表查询
    if (event.mode === 'normal') {
    } else if (event.mode === 'getAccountListByTime') {
      basicWhere.noteDate = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    }
    // 计算总数
    const totalCount = await db.collection("DANDAN_NOTE")
      .where(basicWhere).count();

    // 总数为0, 直接返回
    if (totalCount.total <= 0) {
      return {
        code: 1,
        data: {
          page: [],
          count: totalCount.total,
        },
        message: '获取记录成功',
      }
    }

    // 开始查询
    const res = await db.collection("DANDAN_NOTE")
      .where(basicWhere)
      .skip(offset)
      .limit(limit)
      .orderBy("createTime", "desc")
      .get();

    // 遍历结果, 获取对应的菜单
    for (let note of res.data) {
      await getCategory(note, db);
    }

    // 获取所选时间内的收入和支出
    const aggregateResult = await cloud.callFunction({
      name: 'accountAggregate',
      data: {
        mode: 'aggregateAccountByDateRange',
        startDate: startDate,
        endDate: endDate,
        OPENID: wxContext.OPENID
      }
    })

    const currentTimePre = doHandleYear() + "-" + doHandleMonth() + "-";
    // 获取当月内的收入和支出
    const monthAggregateResult = await cloud.callFunction({
      name: 'accountAggregate',
      data: {
        mode: 'aggregateAccountByDateRange',
        startDate: currentTimePre + "01",
        endDate: currentTimePre + "31",
        OPENID: wxContext.OPENID
      }
    });

    return {
      code: 1,
      data: {
        page: res,
        count: totalCount.total,
        rangeResult: aggregateResult.result.sumResult,
        monthResult: monthAggregateResult.result.sumResult
      },
      message: '获取记录成功',
    }
  } catch (e) {
    console.error(e);
    return {
      code: -1,
      data: {
        page: [],
        count: 0,
      },
      message: '获取记录失败'
    }
  }

}

async function getCategory(note, db) {

  note.noteDate = parseTime(note.noteDate, "{y}-{m}-{d}")

  const tempCategory = await db.collection("DANDAN_NOTE_CATEGORY").doc(note.categoryId).field({
    categoryIcon: true,
    categoryName: true,
    _id: true
  }).get();
  // 貌似没有记录的话, 就直接被catch掉了
  if (tempCategory.data != null) {
    note.category = tempCategory.data;
  }
}

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

function doHandleMonth() {
  var myDate = new Date();
  var tMonth = myDate.getMonth();

  var m = tMonth + 1;
  if (m.toString().length == 1) {
    m = "0" + m;
  }
  return m;
}

function doHandleYear() {
  var myDate = new Date();
  var tYear = myDate.getFullYear();

  return tYear;
}