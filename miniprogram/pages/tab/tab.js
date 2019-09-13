import { parseTime } from '../../date.js'
const mapFace = {
  'greed': '我还能存！',
  'kiss': '继续继续',
  'cool': '嘿嘿',
  'smile': '小存不亏嘻嘻',
  'grinning': 'emmm....',
  'puke': '吃土了',
  'sad': '土都没得吃了'
}
Page({
  data: {
    active: 'chart',
    selectedCategory: null,
    editBill: {},
    isEdit: false,
    hideTab: false,
    currentMonthData: {},
    activeRightIcon: 'tongue'
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
  onSyncCurrentMonthData(event) {
    const currentMonthData = event.detail
    const netAssets = currentMonthData.netAssets
    let icon = 'tongue'
    if (netAssets > 5000) {
      icon = 'greed'
    } else if (netAssets >= 4000 && netAssets < 5000) {
      icon = 'cool'
    } else if (netAssets >= 3000 && netAssets < 4000) {
      icon = 'kiss'
    } else if (netAssets >= 0 && netAssets < 3000) {
      icon = 'smile'
    } else if (netAssets >= -1000 && netAssets < 0) {
      icon = 'grinning'
    } else if (netAssets >= -3000 && netAssets < -1000) {
      icon = 'puke'
    } else {
      icon = 'sad'
    }
    this.setData({
      currentMonthData,
      activeRightIcon: icon
    })
  },
  showIconName(event) {
    console.log('event', event)
    const { active } = event.currentTarget.dataset

    wx.vibrateShort()
    if (active === 'chart') {
      wx.showToast({
        title: mapFace[this.data.activeRightIcon],
        icon: 'none'
      })
    }
    if (active === 'index') {
      wx.showToast({
        title: '记笔账吧 ❤️',
        icon: 'none'
      })
    }
    if (active === 'list') {
      wx.showToast({
        title: '要养成理财记账习惯哦',
        icon: 'none'
      })
    }
  },
  onShareAppMessage() {
    return {
      title: '猪猪邀你测试下',
      path: '/pages/tab/tab',
      imageUrl: 'https://images.vrm.cn/2019/08/29/pig.png'
    }
  }
})