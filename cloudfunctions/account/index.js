// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 初始化数据库
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 取参
  const { id, money, categoryId, noteDate, description, flow } = event;

  try {
    // 增加一条记录
    if (event.mode === 'add') {
      const res = await db.collection('DANDAN_NOTE').add({
        data: {
          money,
          categoryId,
          noteDate: new Date(noteDate),
          description,
          flow, // 金钱流向
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          openId: wxContext.OPENID,
          isDel: false,
        }
      });
      return {
        code: 1,
        data: res,
        message: "操作成功",
      };
    }

    if (event.mode === 'deleteById') {
      const res = await db.collection('DANDAN_NOTE').doc(id).update({
        data: {
          isDel: true,
        }
      });
      return {
        code: 1,
        data: res,
        message: "操作成功",
      };
    }

    if (event.mode === 'updateById') {
      const res = await db.collection('DANDAN_NOTE').doc(id).update({
        data: {
          money,
          categoryId,
          noteDate: new Date(noteDate),
          description,
          updateTime: db.serverDate(),
        }
      });
      return {
        code: 1,
        data: res,
        message: "操作成功",
      };
    }

    if (event.mode === 'getNoteById') {
      const res = await db.collection('DANDAN_NOTE')
      .where({
        _id: id,
        isDel: false,
      }).get();
      console.log(res);
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
      message: '操作失败',
    }
  }

}