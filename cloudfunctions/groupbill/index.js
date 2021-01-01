// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })

  const {
    id,
    startDate,
    endDate,
    name,
    groupId,
    nickName,
    avatarUrl,
    fakeUserId,
  } = event;
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
  })

  try {
    // 增加一条记录
    if (event.mode === 'add') {
      // 在增加组之前，需要新建一下组的用户信息
      const gUserRes = await db.collection('SHARE_USERS').add({
        data: {
          nickName,
          avatarUrl,
          createTime: db.serverDate(),
          createdBy: wxContext.OPENID,
        },
      })
      const res = await db.collection('SHARE').add({
        data: {
          startDate,
          endDate: endDate ? new Date(endDate) : null,
          name,
          createTime: db.serverDate(),
          createdBy: wxContext.OPENID,
          createdByFakeUser: gUserRes._id,
          isDel: false,
          isStart: false,
        },
      });
      return {
        code: 1,
        data: res,
        message: '操作成功',
      };
    }
    if (event.mode === 'getFakeUserInfo') {
      const query = {
        _id: fakeUserId,
      }
      const res = await db.collection('SHARE_USERS').where(query).get()
      return {
        code: 1,
        data: res.data instanceof Array ? res.data[0] : null,
        message: '操作成功',
      };
    }
    // 获取组信息
    if (event.mode === 'getGroupInfo') {
      const query = {}
      if (groupId) {
        query._id = groupId
      } else {
        query.createdBy = wxContext.OPENID
      }
      const res = await db.collection('SHARE').where(query).get();
      return {
        code: 1,
        data: res.data instanceof Array ? res.data[0] : null,
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
    if (event.mode === 'delete') {
      const res = await db.collection('TARGET')
        .where({
          openId: wxContext.OPENID,
        })
        .update({
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
// eslint-disable-next-line no-undef
