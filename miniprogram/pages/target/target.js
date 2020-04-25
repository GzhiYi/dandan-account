// miniprogram/pages/target/target.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetInfo: {},
    progress: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getTargetInfo()
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
  getTargetInfo() {
    const self = this
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'targetInfo',
      },
      success(res) {
        if (res.result.code === 1) {
          const targetInfo = res.result.data
          const allDate = self.getDates(new Date(targetInfo.targetData.createTime), new Date(targetInfo.targetData.endDate))
          const toFinishDate = self.getDates(new Date(), new Date(targetInfo.targetData.endDate))
          self.setData({
            targetInfo,
            progress: {
              percentage: toFinishDate.length / allDate.length,
              passDay: toFinishDate.length,
              allDay: allDate.length,
            },
          })
        }
      },
    })
  },
  getDates(startDate, endDate) {
    const dates = []
    let currentDate = startDate

    function addDays(days) {
      const date = new Date(this.valueOf())
      date.setDate(date.getDate() + days)
      return date
    }
    while (currentDate <= endDate) {
      dates.push(currentDate)
      currentDate = addDays.call(currentDate, 1)
    }
    return dates
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
})
