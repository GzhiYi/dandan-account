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
          self.setData({
            groupInfo: res.result.data,
          })
          // 在获取到用户信息之后，再获取组长信息
          wx.cloud.callFunction({
            name: 'groupbill',
            data: {
              mode: 'getFakeUserInfo',
              fakeUserId: res.result.data.createdByFakeUser,
            },
            success(inRes) {
              if (inRes.result.code === 1) {
                self.setData({
                  fakeUserInfo: inRes.result.data,
                })
              }
            },
          })
        }
      },
      complete() {
        wx.hideLoading()
      },
    })
  },
  onShareAppMessage() {
    const { _id } = this.data.groupInfo
    console.log('log', `/pages/group/group?groupId=${_id}`)
    return {
      title: '来来来，这里可以一起记账！',
      path: `/pages/group/group?groupId=${_id}`,
    }
  },
})
