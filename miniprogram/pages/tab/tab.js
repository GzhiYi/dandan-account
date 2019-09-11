import { parseTime } from '../../date.js'
Page({
  data: {
    active: 'chart',
    selectedCategory: null,
    editBill: {},
    isEdit: false,
    hideTab: false
  },
  onLoad() {
    this.calCalendarHeight()
  },
  onShow() {
    const { selectedCategory } = getApp().globalData
    if (selectedCategory) {
      this.setData({
        selectedCategory
      })
    }
  }, 
  calCalendarHeight() {
    const query = wx.createSelectorQuery().in(this)
    query.select('.cal-calendar').boundingClientRect(function (rect) {
      // self.setData({
      //   calendarHeight: rect.height
      // })
      console.log('rect', rect)
    }).exec()
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
    const chart = this.selectComponent('#chart')
    const now = new Date()
    list.getBillList(parseTime(now, '{y}-{m}-{d}'), parseTime(now, '{y}-{m}-{d}'), 'index')
    chart.getServerData('index')
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
      title: '猪猪邀你测试下',
      path: '/pages/tab/tab',
      imageUrl: 'https://images.vrm.cn/2019/08/29/pig.png'
    }
  }
})