import dayjs from 'dayjs'
const mapFace = {
  greed: '我还能存！',
  kiss: '继续继续',
  cool: '嘿嘿',
  smile: '小存不亏嘻嘻',
  grinning: 'emmm....',
  puke: '吃土了',
  sad: '土都没得吃了'
}
const { importStore } = getApp()
const { create, store } = importStore
create.Page(store, {
  use: ['selectedCategory', 'defaultCategoryList', 'currentMonthData', 'loadingRightIcon', 'editBill'],
  data: {
    active: 'index',
    hideTab: false,
    activeRightIcon: '',
    pieShow: false,
    initChart: null
  },
  computed: {
    activeRightIcon() {
      const currentMonthData = this.currentMonthData
      if (!('flowIn' in currentMonthData) || !('flowOut' in currentMonthData)) return
      const netAssets = (currentMonthData.flowIn.allSum - currentMonthData.flowOut.allSum) || 0
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
      return icon
    }
  },
  onLoad() {
    this.calCalendarHeight()
    const isInUser = wx.getStorageSync('isInUser')
    if (isInUser !== 1) this.registerUser()
  },
  onShow() {
    const index = this.selectComponent('#index')
    index.setRecentCate()
  },
  calCalendarHeight() {
    const query = wx.createSelectorQuery().in(this)
    query.select('.cal-calendar').boundingClientRect(() => {
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
    const now = dayjs().format('YYYY-MM-DD')
    
    const list = this.selectComponent('#list')
    list.getBillList(now, now, 'index')

    const chart = this.selectComponent('#chart')
    chart.getPieChartData(true)
  },
  onEditBill() {
    this.setData({
      active: 'index'
    })
    const index = this.selectComponent('#index')
    index.dectiveEdit()
  },
  onSwitchTab(data) {
    this.setData({
      active: data.detail
    })
  },
  onHideTab(event) {
    this.setData({
      hideTab: event.detail
    })
  },
  onGetNewWord() {
    const index = this.selectComponent('#index')
    index.getWord()
  },
  onSyncCurrentMonthData(event) {
    const currentMonthData = event.detail
    if (!('flowIn' in currentMonthData) || !('flowOut' in currentMonthData)) return
    const netAssets = (currentMonthData.flowIn.allSum - currentMonthData.flowOut.allSum) || 0
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
        title: '( •̀ᄇ• ́)ﻭ✧来记笔账 ❤️',
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
  registerUser() {
    // 首次进入tab页面，需要对用户进行注册
    wx.cloud.callFunction({
      name: 'user',
      data: {
        mode: 'add'
      },
      success(res) {
        if (res.result.code === 1) {
          wx.setStorageSync('isInUser', 1)
        }
      }
    })
  },
  onShareAppMessage() {
    return {
      title: 'o(*￣▽￣*)ブ来试一下这个记账小程序',
      path: '/pages/tab/tab',
      imageUrl: '../../images/dandan-cover.png'
    }
  }
})
