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
  const _ = db.command;

  const {
    startDate,
    endDate,
    name,
    groupId,
    nickName,
    avatarUrl,
    fakeUserId,
    joinGroupId, // 要申请加入的组ID
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
      // 添加组
      const res = await db.collection('SHARE').add({
        data: {
          startDate,
          endDate: endDate ? new Date(endDate) : null,
          name,
          createTime: db.serverDate(),
          createdBy: wxContext.OPENID,
          createdByFakeUser: gUserRes._id,
          isDel: false,
          relateUsers: [{
            userId: gUserRes._id,
            openId: wxContext.OPENID,
            valid: true, // 是否已同意申请，由于是创建者，所以默认为true，只有同意了进组才可以关联账单
          }], // 该组关联的用户
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
      let matchUser = []
      const resData = res.data[0]
      // 处理relative的信息填充
      const tasks = []
      resData.relateUsers.forEach((user) => {
        const pro = db.collection('SHARE_USERS').where({
          _id: user.userId,
        }).get()
        tasks.push(pro)
      })
      const final = await Promise.all(tasks)
      resData.relateUsers = resData.relateUsers.map((user, index) => ({
        ...user,
        ...final[index].data[0],
      }))
      resData.isMyGroup = resData.createdBy === wxContext.OPENID
      if (resData) {
        matchUser = resData.relateUsers.filter((item) => item.openId === wxContext.OPENID)
        if (matchUser.length) {
          return {
            code: 2,
            data: res.data instanceof Array ? resData : null,
            message: '操作成功',
          };
        }
      }
      return {
        code: 1,
        data: res.data instanceof Array ? resData : null,
        message: '操作成功',
      };
    }
    // 检查是否已经有创建组了
    if (event.mode === 'check') {
      const res = await db.collection('SHARE').where({
        'relateUsers.openId': _.in([wxContext.OPENID]),
        isDel: false,
      }).get()
      if (res.data && res.data[0]) {
        res.data[0].isMyGroup = res.data[0].createdBy === wxContext.OPENID
      }
      return {
        code: 1,
        data: res.data,
        message: '操作成功',
      };
    }
    if (event.mode === 'delete') {
      const res = await db.collection('SHARE').doc(groupId).update({
        data: {
          isDel: true,
        },
      });
      return {
        code: 1,
        data: res.data,
        message: '操作成功',
      };
    }
    // 离开组，并不是删除组
    if (event.mode === 'drop') {
      const groupInfo = await db.collection('SHARE').where({
        _id: groupId,
        isDel: false,
      }).get();
      const oldRelateUsers = groupInfo.data[0].relateUsers
      // 找出不是该openId的userlist
      const newRelateUsers = oldRelateUsers.filter((user) => user.openId !== wxContext.OPENID)
      const res = await db.collection('SHARE').doc(groupId).update({
        data: {
          relateUsers: newRelateUsers,
        },
      })
      return {
        code: 1,
        data: res.data instanceof Array ? res.data[0] : null,
        message: '操作成功',
      }
    }
    // 确定加入组内
    if (event.mode === 'join') {
      const userRes = await db.collection('SHARE_USERS').where({
        createdBy: wxContext.OPENID,
      }).get()
      let gUserRes = null
      if (!userRes.data.length) {
        // 在加入组内之前，需要在组用户上添加一条记录
        gUserRes = await db.collection('SHARE_USERS').add({
          data: {
            nickName,
            avatarUrl,
            createTime: db.serverDate(),
            createdBy: wxContext.OPENID,
          },
        })
      } else {
        // eslint-disable-next-line prefer-destructuring
        gUserRes = userRes.data[0]
      }
      // 更新该组关联用户的表信息
      // 获取旧的组信息
      const groupInfo = await db.collection('SHARE').where({
        _id: joinGroupId,
        isDel: false,
      }).get();
      const oldRelateUsers = groupInfo.data[0].relateUsers
      oldRelateUsers.push({
        userId: gUserRes._id,
        openId: wxContext.OPENID,
        valid: false, // 是否已同意申请，由于是创建者，所以默认为true，只有同意了进组才可以关联账单
      })
      const res = await db.collection('SHARE').doc(joinGroupId).update({
        data: {
          relateUsers: oldRelateUsers,
        },
      })
      return {
        code: 1,
        data: res.data instanceof Array ? res.data[0] : null,
        message: '操作成功',
      };
    }
    // 组长确认加入成员进入组内
    if (event.mode === 'confirmAdd') {
      // 获取旧的组信息
      const groupInfo = await db.collection('SHARE').where({
        _id: groupId,
        isDel: false,
      }).get();
      const oldRelateUsers = groupInfo.data[0].relateUsers
      oldRelateUsers.forEach((user) => {
        if (user.userId === fakeUserId) {
          user.valid = true
        }
      })
      // 修改目标用户的valid为true
      const res = await db.collection('SHARE').doc(groupId).update({
        data: {
          relateUsers: oldRelateUsers,
        },
      })
      return {
        code: 1,
        data: res.data instanceof Array ? res.data[0] : null,
        message: '操作成功',
      };
    }
  } catch (e) {
    return {
      code: -1,
      data: e,
      message: '操作失败',
    }
  }
}

// eslint-disable-next-line no-restricted-properties
roundFun = (value, n) => Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
// eslint-disable-next-line no-undef
