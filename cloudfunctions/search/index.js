// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV

  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV

  });
  const { keyWord } = event
  const _ = db.command
  // 获取该用户的分类
  const categoryList = await db.collection("DANDAN_NOTE_CATEGORY")
  .where({
    openId: _.eq(wxContext.OPENID).or(_.eq("SYSTEM")),
    isDel: false
  })
  .get()
  try {
    const result = await db.collection("DANDAN_NOTE")
    .where(_.or([{
        description: db.RegExp({
          regexp: '.*' + keyWord,
          options: 'i',
        })
      },
      {
        money: db.RegExp({
          regexp: keyWord,
          options: 'i',
        })
      }
    ]).and({
      openId: wxContext.OPENID
    }))
    .get()
    return {
      code: 1,
      data: result.data.map(bill => {
        bill.category = categoryList.data.filter(item => item._id === bill.categoryId)[0]
        bill.noteDate = parseTime(bill.noteDate, "{y}-{m}-{d}")
        return bill
      }),
      message: '操作成功',
    }
  } catch (error) {
    return {
      code: -1,
      data: error,
      message: '操作失败',
    }
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