// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV
  });
  const _ = db.command;
  const { flow } = event;
  try {
    // 先获取系统的分类, 或者某个用户创建的分类
    let query = {
      isDel: false,
      openId: _.eq(wxContext.OPENID).or(_.eq("SYSTEM")),
      flow: Number(flow),
    }
    if (!flow) delete query.flow
    const res = await db.collection("DANDAN_NOTE_CATEGORY")
      .where(query).get();
    let response = []
    res.data.forEach(item => {
      if (!item.parentId) {
        item.children = []
        response.push(item)
      }
    })
    if (response.length > 0) {
      res.data.forEach(item => {
        response.forEach(one => {
          if (one._id === item.parentId) {
            one.children.push(item)
          }
        })
      })
    }
    return {
      code: 1,
      data: response,
      message: '获取分类成功',
    }
  } catch (e) {
    console.error(e);
    return {
      code: -1,
      data: [],
      message: '获取失败'
    }
  }


}