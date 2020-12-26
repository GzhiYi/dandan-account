// miniprogram/pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupInfo: {},
    picName: 'group1',
    timer: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getGroup()
    this.scrollBanner()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.setData({
      timer: null,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

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
  getGroup() {
    const self = this
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'get',
      },
      success(res) {
        if (res.result.code === 1) {
          self.setData({
            groupInfo: res.result.data,
          })
        }
      },
    })
  },
  onShareAppMessage() {
    return {
      title: '来来来，这里可以一起记账！',
      path: '/pages/tab/tab',
    }
  },
})
