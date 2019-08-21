// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id, categoryName, categoryIcon, description, flow,
    type, parentId, isSelectable, } = event;
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
            isSelectable: isSelectable === 'true',
            createTime: db.serverDate(),
            openId: type === "0" ? "SYSTEM" : wxContext.OPENID,
            isDel: false
          }
        });
      return {
        code: 1,
        data: res,
        message: '操作成功'
      }
    }

    if (event.mode === 'deleteById') {
      const res = await db.collection('DANDAN_NOTE_CATEGORY').doc(id)
      .update({
        data: {
          isDel: true,
        }
      });
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
          isDel: false,
        }).get();
      return {
        code: 1,
        data: res,
        message: "操作成功",
      };
    }

  } catch (e) {
    console.error(e);
    return {
      code: -1,
      data: '',
      message: '操作失败'
    };
  }

}
