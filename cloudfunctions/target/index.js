// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  // 取参
  const {
    id,
    startMoney,
    targetMoney,
    name,
    endDate,
  } = event;
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  });


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
          isDel: false,
        },
      });
      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }

    if (event.mode === 'deleteById') {
      const res = await db.collection('TARGET').doc(id).update({
        data: {
          isDel: true,
        },
      });
      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }
    // 检查是否已有未删除的目标
    if (event.mode === 'check') {
      const res = await db.collection('TARGET').where({
        openId: wxContext.OPENID,
        isDel: false,
      }).get()
      return {
        code: 1,
        data: res.data,
        message: '操作成功',
      };
    }

    // if (event.mode === 'updateById') {
    //   const res = await db.collection('TARGET').doc(id).update({
    //     data: {
    //       money: roundFun(money, 2),
    //       categoryId,
    //       flow: Number(flow), // 金钱流向
    //       noteDate: new Date(noteDate),
    //       description,
    //       updateTime: db.serverDate(),
    //     },
    //   });
    //   return {
    //     code: 1,
    //     data: res,
    //     message: '操作成功',
    //   };
    // }
  } catch (e) {
    return {
      code: -1,
      data: '',
      message: '操作失败',
    }
  }
}

// eslint-disable-next-line no-restricted-properties
roundFun = (value, n) => Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
