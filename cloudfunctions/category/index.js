// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  });
  const {
    id, categoryName, categoryIcon, description, flow,
    type, parentId, isSelectable, ids,
  } = event;

  const _ = db.command;

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
            isDel: false,
          },
        });
      return {
        code: 1,
        data: res,
        message: '操作成功',
      }
    }

    if (event.mode === 'deleteByIdAndFlow') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY').doc(id)
        .update({
          data: {
            isDel: true,
          },
        });

      if (res.stats.updated > 0) {
        // 这样就是异步删除了8?
        let afterCategoryId = 'others_sub'
        if (Number(flow) === 1) {
          afterCategoryId = 'income_others'
        }
        const updateRes = await db.collection('DANDAN_NOTE')
          .where({
            categoryId: id,
            isDel: false,
          }).update({
            data: {
              categoryId: afterCategoryId,
            },
          });

        return {
          code: 1,
          data: updateRes,
          message: '操作成功',
        };
      }

      return {
        code: 1,
        data: res,
        message: '操作成功',
      }
    }

    if (event.mode === 'getCategoryById') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          _id: id,
          isDel: false,
        }).get();
      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }

    if (event.mode === 'getCategoriesByIdBatch') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          _id: _.in(ids),
          isDel: false,
        }).get();

      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }

    // 根据父分类ID获取子分类ID
    if (event.mode === 'getCategoriesByParentCID') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY')
        .where({
          parentId: id,
          isDel: false,
        }).get();
      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }
  } catch (e) {
    return {
      code: -1,
      data: '',
      message: '操作失败',
    };
  }
}
