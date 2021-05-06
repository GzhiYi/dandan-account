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

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
