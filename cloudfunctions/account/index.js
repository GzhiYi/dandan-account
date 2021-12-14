// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function strip(num, precision = 12) {
  num = Number(num).toFixed(2)
  return +parseFloat(Number(num).toPrecision(precision))
}
// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  // 取参
  const {
    id, money, categoryId, noteDate, description, flow
  } = event
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })

  try {
    // 增加一条记录
    if (event.mode === 'add') {
      const res = await db.collection('DANDAN_NOTE').add({
        data: {
          money: strip(money),
          categoryId,
          noteDate: new Date(noteDate),
          description,
          flow: Number(flow), // 金钱流向
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
      const res = await db.collection('DANDAN_NOTE').doc(id).update({
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

    if (event.mode === 'updateById') {
      const res = await db.collection('DANDAN_NOTE').doc(id).update({
        data: {
          money: strip(money),
          categoryId,
          flow: Number(flow), // 金钱流向
          noteDate: new Date(noteDate),
          description,
          updateTime: db.serverDate()
        }
      })
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }
    // 通过id去获取某笔记录
    if (event.mode === 'getNoteById') {
      const res = await db.collection('DANDAN_NOTE')
        .where({
          _id: id,
          isDel: false
        }).get()
      if (res.data.length > 0) {
        const tempCategory = await db.collection('DANDAN_NOTE_CATEGORY').doc(res.data[0].categoryId).field({
          categoryIcon: true,
          categoryName: true,
          _id: true
        }).get()
        // 貌似没有记录的话, 就直接被catch掉了
        if (tempCategory.data != null) {
          res.data[0].category = tempCategory.data
        }
      }

      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    // 删除分类之后会将分类下的记录分类更新为其他
    if (event.mode === 'deleteByCategoryId') {
      const afterCategoryId = flow == 1 ? 'income_others' : 'others_sub'

      const res = await db.collection('DANDAN_NOTE')
        .where({
          categoryId,
          isDel: false
        }).update({
          data: {
            categoryId: afterCategoryId
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
      data: e,
      message: '操作失败'
    }
  }
}
