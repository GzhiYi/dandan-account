Page({
  data: {
    billList: null,
    screenHeight: getApp().globalData.screenHeight,
    statusBarHeight: getApp().globalData.statusBarHeight,
    isSearching: false
  },
  onLoad: function (options) {

  },
  onReady: function () {

  },
  onShow: function () {

  },
  confirmTap(event) {
    const { value } = event.detail
    const self = this
    if (!value || !value.trim()) return

    // 查询操作
    self.setData({
      isSearching: true,
      billList: []
    })
    wx.cloud.callFunction({
      name: 'search',
      data: {
        keyWord: value
      },
      success(res) {
        if (res.result.code === 1) {
          self.setData({
            billList: res.result.data
          })
        }
      },
      fail(error) {
        getApp().showError('查询出错，要不稍后再试😢')
      },
      complete() {
        self.setData({
          isSearching: false
        })
      }
    })
  }
})