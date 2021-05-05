const { importStore } = getApp()
const { create, store } = importStore
create.Page(store, {

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
    showLeaveDialog: false,
    showDeleteDialog: false,
    confirmTarget: {},
    loadingAdd: false,
  },
  onLoad(options) {
    const { groupId } = options
    if (groupId) {
      this.setData({
        groupId: options.groupId,
      })
    }
    const { myGroup } = store.data
    this.getGroup(groupId || myGroup._id)
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
      showLeaveDialog: false,
      showDeleteDialog: false,
    })
  },
  onShowConfirmDialog(data) {
    this.setData({
      confirmTarget: data.currentTarget.dataset.user,
      showConfirmDialog: true,
    })
  },
  // 确认用户加入组内
  confirmJoin() {
    const self = this
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'confirmAdd',
        fakeUserId: self.data.confirmTarget._id,
        groupId: self.data.groupInfo._id,
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '已同意',
            icon: 'none',
          })
          self.getGroup(self.data.groupInfo._id)
        }
      },
      fail() {
        wx.showToast({
          title: '操作失败，请重试或客服联系',
          icon: 'none',
        })
      },
      complete() {
        self.closeDialog()
      },
    })
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
  dropGroup() {
    this.setData({
      showLeaveDialog: true,
    })
  },
  onShowDeleteDialog() {
    this.setData({
      showDeleteDialog: true,
    })
  },
  confirmDelete() {
    const { _id } = this.data.groupInfo
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'delete',
        groupId: _id,
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '删除成功',
            icon: 'none',
          })
          getApp().checkHasGroup()
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      },
    })
  },
  // 离开该组
  confirmDrop() {
    const { _id } = this.data.groupInfo
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'drop',
        groupId: _id,
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '你已离开该组啦，相聚将在未来。',
            icon: 'none',
          })
          getApp().checkHasGroup()
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
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
    self.setData({
      loadingAdd: true,
    })
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'join',
        avatarUrl: randomAvatar,
        nickName,
        joinGroupId: _id,
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '加入该组成功，在Ta通过审核之后将自动开启一起记账',
            icon: 'none',
          })
          self.getGroup(self.data.groupInfo._id)
        } else {
          wx.showToast({
            title: '加入组失败，请重试或联系客服。',
            icon: 'none',
          })
        }
      },
      complete() {
        self.setData({
          loadingAdd: false,
        })
      },
    })
  },
})
