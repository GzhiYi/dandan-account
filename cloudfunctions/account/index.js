// 云函数入口文件
const cloud = require('wx-server-sdk')
const COMM = require('../../comm/comm.js');

cloud.init()

// 初始化数据库
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 取参
  const { id, money, categoryId, noteDate, description, flow } = event;
  // 增加一条记录
  if (event.mode === 'add') {
    db.collection('DANDAN_NOTE').add({
      data: { 
        money,
        categoryId,
        noteDate,
        description,
        flow, // 金钱流向
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        openId: wxContext.OPENID,
        isDel: false,
      },
      success: (res) => {
        console.log(res);
        return ({
          code: COMM.SUCCESS_CODE,
          data: res,
          message: COMM.SUCCESS_MESSAGE,
        })
      },
      fail: (error) => {
        console.error(error);
        return ({
          code: COMM.ERROR_CODE,
          data: '',
          message: COMM.ERROR_CODE,
        })
      }
    });
  }

  if (event.mode === 'deleteById') {
    db.collection('DANDAN_NOTE').doc(id).update({
      data: {
        isDel: true,
      },
      success: (res) => {
        console.log(res);
        return ({
          code: COMM.SUCCESS_CODE,
          data: res,
          message: COMM.SUCCESS_MESSAGE,
        })
      },
      fail: (error) => {
        console.error(error);
        return ({
          code: COMM.ERROR_CODE,
          data: '',
          message: COMM.ERROR_CODE,
        })
      }
    })
  }


}