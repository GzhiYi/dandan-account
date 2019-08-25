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
          money: roundFun(money, 2),
          categoryId,
          noteDate: new Date(noteDate),
          description,
          flow: Number(flow), // 金钱流向
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
          money: roundFun(money, 2),
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
      if (res.data.length > 0) {
        const tempCategory = await db.collection("DANDAN_NOTE_CATEGORY").doc(res.data[0].categoryId).field({
          categoryIcon: true,
          categoryName: true,
          _id: true
        }).get();
        // 貌似没有记录的话, 就直接被catch掉了
        if (tempCategory.data != null) {
          res.data[0].category = tempCategory.data;
        }
      }
      
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

roundFun = (value, n) => {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}