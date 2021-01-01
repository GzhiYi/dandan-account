// miniprogram/pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupInfo: {},
    picName: 'group1',
    timer: null,
    groupId: null, // 这个groupId用于判断是否链接上带有
    fakeUserInfo: {},
    randomAvatar: `https://api.multiavatar.com/${Math.ceil(Math.random() * 12230590464)}.svg`,
    nickName: '',
    isInGroup: false, // 是否已经加入了该组
    showConfirmDialog: false,
    confirmTarget: {},
  },
  onLoad(options) {
    const { groupId } = options
    if (groupId) {
      this.setData({
        groupId: options.groupId,
      })
    }
    this.getGroup(groupId)
    this.scrollBanner()
  },
  onUnload() {
    this.setData({
      timer: null,
    })
  },
  changeAvatar() {
    this.setData({
      randomAvatar: `https://api.multiavatar.com/${Math.ceil(Math.random() * 12230590464)}.svg`,
    })
  },
  scrollBanner() {
    const self = this
    const newTimer = setInterval(() => {
      const { picName } = this.data
      self.setData({
        picName: picName === 'group1' ? 'group2' : 'group1',
      })
    }, 5000)
    self.setData({
      timer: newTimer,
    })
  },
  closeDialog() {
    this.setData({
      showConfirmDialog: false,
    })
  },
  onShowConfirmDialog(data) {
    this.setData({
      confirmTarget: data.currentTarget.dataset.user,
      showConfirmDialog: true,
    })
  },
  confirmJoin() {
    this.closeDialog()
  },
  setGroupInfo(groupInfo) {
    const self = this
    self.setData({
      groupInfo,
    })
    // 在获取到用户信息之后，再获取组长信息
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'getFakeUserInfo',
        fakeUserId: groupInfo.createdByFakeUser,
      },
      success(inRes) {
        if (inRes.result.code === 1) {
          self.setData({
            fakeUserInfo: inRes.result.data,
          })
        }
      },
    })
  },
  getGroup(groupId = null) {
    const self = this
    const data = {
      mode: 'getGroupInfo',
    }
    if (groupId) {
      data.groupId = groupId
    }
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'groupbill',
      data,
      success(res) {
        if (res.result.code === 1) {
          self.setGroupInfo(res.result.data)
        } else if (res.result.code === 2) {
          if (self.data.groupId) {
            wx.showToast({
              title: '你已经在该组啦～',
              icon: 'none',
            })
            self.setData({
              isInGroup: true,
            })
          } else {
            self.setGroupInfo(res.result.data)
          }
        }
      },
      complete() {
        wx.hideLoading()
      },
    })
  },
  onShareAppMessage() {
    const { _id } = this.data.groupInfo
    return {
      title: '来来来，这里可以一起记账！',
      path: `/pages/group/group?groupId=${_id}`,
    }
  },
  onInput(event) {
    this.setData({
      [`${event.target.dataset.target}`]: event.detail.value,
    })
  },
  // 确定加入组内
  confirmIn() {
    const self = this
    const { randomAvatar, nickName } = self.data
    const { _id } = self.data.groupInfo
    if (!nickName) {
      wx.showToast({
        title: '需要填写昵称哦😯',
        icon: 'none',
      })
      return
    }
    if (!_id) {
      wx.showToast({
        title: '未能正确获取组信息，请重新邀请加入',
        icon: 'none',
      })
      return
    }
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'join',
        avatarUrl: randomAvatar,
        nickName,
        joinGroupId: _id,
      },
      success(res) {
        if (res.data.code === 1) {
          wx.showToast({
            title: '加入该组成功，通过Ta通过审核之后将自动开启一起记账',
            icon: 'none',
          })
          this.getGroup()
        }
      },
    })
  },
})
