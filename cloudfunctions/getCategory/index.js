// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { flow, } = event;

  try {
    // 先获取系统的分类, 或者某个用户创建的分类
    const res = await db.collection("DANDAN_NOTE_CATEGORY")
      .where({
        isDel: false,
        openId: _.eq(wxContext.OPENID).or(_.eq("SYSTEM")),
        flow: Number(flow),
      }).get();
    return {
      code: 1,
      data: res,
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