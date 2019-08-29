Page({
  data: {
    active: 'index',
    selectedCategory: null,
    editBill: {},
    isEdit: false,
    hideTab: false
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
  onEditBill(event) {
    this.setData({
      editBill: event.detail,
      active: 'index',
      isEdit: true
    })
    const index = this.selectComponent('#index')
    index.dectiveEdit()
  },
  onSwitchTab(data) {
    console.log(data)
    this.setData({
      active: data.detail
    })
  },
  onHideTab(event) {
    this.setData({
      hideTab: event.detail
    })
  },
  onShareAppMessage() {
    return {
      title: '测试'
    }
  }
})