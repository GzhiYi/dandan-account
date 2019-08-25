Page({
  data: {
    active: 'index',
    selectedCategory: ''
  },
  onLoad() {
  },
  onShow() {
    const { selectedCategory } = getApp().globalData
    if (selectedCategory) {
      this.setData({
        selectedCategory
      })
    }
  }, 
  goTo(event) {
    const { active } = event.currentTarget.dataset
    this.setData({
      active,
      scale: active
    })
    wx.vibrateShort()
    const self = this
    setTimeout(() => {
      self.setData({
        scale: null
      })
    }, 200)
  },
  onReFetchBillList() {
    const list = this.selectComponent('#list')
    list.getBillList()
  },
  onShareAppMessage() {
    return {
      title: '测试'
    }
  }
})