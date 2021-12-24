// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function getPureDate(time) {
  // eslint-disable-next-line no-extend-native
  Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h)
    return this
  }
  const date = new Date(time).addHours(8)
  return date.toLocaleDateString()
}
// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  // 初始化数据库
  const db = cloud.database({ env })
  const _ = db.command
  const {
    id,
    startMoney,
    targetMoney,
    name,
    endDate
  } = event
  cloud.updateConfig({ env })

  try {
    // 增加一条记录
    if (event.mode === 'add') {
      const res = await db.collection('TARGET').add({
        data: {
          startMoney: roundFun(startMoney, 2),
          targetMoney: roundFun(targetMoney, 2),
          name,
          endDate: new Date(endDate),
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          openId: wxContext.OPENID,
          isDel: false
        }
      })
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    if (event.mode === 'deleteById') {
      const res = await db.collection('TARGET').doc(id).update({
        data: {
          isDel: true
        }
      })
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }
    // 检查是否已有未删除的目标
    if (event.mode === 'check') {
      const res = await db.collection('TARGET').where({
        openId: wxContext.OPENID,
        isDel: false
      }).get()
      return {
        code: 1,
        data: res.data,
        message: '操作成功'
      }
    }

    // 获取目标的数据
    if (event.mode === 'targetInfo') {
      const MAX_LIMIT = 100
      const targetBaseInfo = await db.collection('TARGET').where({
        openId: wxContext.OPENID,
        isDel: false
      }).get()
      if (targetBaseInfo.data.length) {
        const targetData = targetBaseInfo.data[0]
        // 获取开始时间到结束时间的所有账单数
        const sameParam = {
          openId: wxContext.OPENID,
          isDel: false,
          noteDate: _.gte(new Date(`${getPureDate(targetData.createTime)} 00:00:00`)).and(_.lte(new Date(`${getPureDate(targetData.endDate)} 23:59:59`)))
        }
        const countResult = await db.collection('DANDAN_NOTE')
          .where(sameParam)
          .count()
        const {
          total
        } = countResult
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('DANDAN_NOTE')
            .where(sameParam)
            .skip(i * MAX_LIMIT).limit(MAX_LIMIT)
            .get()
          tasks.push(promise)
        }
        const billList = await Promise.all(tasks)
        const returnBillList = []
        billList.forEach((bill) => {
          bill.data.forEach((inBill) => {
            returnBillList.push(inBill)
          })
        })
        return {
          code: 1,
          data: {
            targetData,
            billList: returnBillList
          },
          message: '获取成功'
        }
      }
      return {
        code: -1,
        data: '',
        message: '未设置目标'
      }
    }
    if (event.mode === 'delete') {
      console.log('删除id', event.id)
      const res = await db.collection('TARGET').doc(event.id)
        .update({
          data: {
            isDel: true
          }
        })
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }
  } catch (e) {
    return {
      code: -1,
      data: '',
      message: '操作失败'
    }
  }
}

// eslint-disable-next-line no-restricted-properties
roundFun = (value, n) => Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
// eslint-disable-next-line no-undef
