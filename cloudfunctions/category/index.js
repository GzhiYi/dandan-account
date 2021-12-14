// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
  cloud.updateConfig({ env })
  // 初始化数据库
  const db = cloud.database({ env })
  const {
    id,
    categoryName,
    categoryIcon,
    description,
    flow,
    type,
    parentId,
    isSelectable,
    ids,
    OPENID
  } = event

  const _ = db.command

  try {
    if (event.mode === 'add') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .add({
          data: {
            categoryName,
            categoryIcon,
            description,
            flow: Number(flow),
            type: Number(type),
            parentId,
            isSelectable,
            createTime: db.serverDate(),
            openId: String(type) === '0' ? 'SYSTEM' : wxContext.OPENID,
            isDel: false
          }
        })
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    if (event.mode === 'deleteByIdAndFlow') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY').doc(id)
        .update({
          data: {
            isDel: true
          }
        })
      // 删除分类会将所有旧分类更新为其他
      if (res.stats.updated > 0) {
        const afterCategoryId = flow == 1 ? 'income_others' : 'others_sub'
        const updateRes = await db.collection('DANDAN_NOTE')
          .where({
            categoryId: id,
            isDel: false
          }).update({
            data: {
              categoryId: afterCategoryId
            }
          })

        return {
          code: 1,
          data: updateRes,
          message: '操作成功'
        }
      }

      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    if (event.mode === 'getCategoryById') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          _id: id,
          isDel: false
        }).get()
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    if (event.mode === 'getCategoriesByIdBatch') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          _id: _.in(ids),
          isDel: false
        }).get()

      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    // Deprecated: 目录在同一个父分类下数量太多, 官方文档GET默认取一百条, 这是个挺坑的东西
    // 根据父分类ID获取子分类ID
    if (event.mode === 'getCategoriesByParentCID') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          parentId: id,
          isDel: false
        }).get()
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    // 根据父分类ID获取系统分类
    if (event.mode === 'getCategoriesByParentCIDAndSystem') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          type: 0,
          parentId: id,
          isDel: false
        }).limit(300).get()
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    // 根据父分类ID获取某个用户定义的分类
    if (event.mode === 'getCategoriesByParentCIDAndOpenId') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          openId: (OPENID || wxContext.OPENID),
          type: 1,
          parentId: id,
          isDel: false
        }).limit(300).get()
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }
    return {
      code: -1,
      data: [],
      message: '没有方法匹配'
    }
  } catch (e) {
    return {
      code: -1,
      data: '',
      message: '操作失败'
    }
  }
}
