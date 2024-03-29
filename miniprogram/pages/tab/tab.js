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
  use: [
    'selectedCategory',
    'defaultCategoryList',
    'currentMonthData',
    'loadingRightIcon',
    'editBill',
    'showTabbar',
    'activeTab',
    'isEdit'
  ],
  data: {
    activeRightIcon: '',
    pieShow: false,
    initChart: null,
    isRenderPie: false
  },
  computed: {
    activeRightIcon() {
      const { currentMonthData } = this
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
  renderChart(event) {
    const list = event.detail
    if (!list || !list.length) {
      this.setData({
        pieShow: false,
        initChart: null
      })
      return
    }
    const newChartData = list.map((item) => ({
      name: item.categoryName,
      id: item.categoryId,
      y: item.allSum,
      const: 'const'
    }))
    if (this.data.initChart) {
      const wxF2 = this.selectComponent('#f2-pie')
      wxF2.chart.changeData(newChartData)
      return
    }
    const self = this
    this.setData({
      initChart(F2, config) {
        config.self = this
        const chart = new F2.Chart(config)
        const data = newChartData
        chart.source(data)
        chart.coord('polar', {
          transposed: true,
          radius: 0.75
        })
        chart.legend(false)
        chart.axis(false)
        chart.tooltip(false)
        chart.pieLabel({
          sidePadding: 40,
          activeShape: true,
          label1: function label1(d, color) {
            return {
              text: d.name,
              fill: color
            }
          },
          label2: function label2(d) {
            return {
              text: `${String(Math.floor(d.y * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
              fill: '#808080',
              fontWeight: 'bold'
            }
          },
          onClick: function onClick(ev) {
            const chartPage = self.selectComponent('#chart')
            if (ev.data && ev.data.id) {
              wx.vibrateShort()
              chartPage.setPageData({
                billList: [],
                pickCategoryId: ev.data.id
              })
              chartPage.fetchBillList({
                categoryId: ev.data.id
              })
            }
          }
        })

        chart.interval().position('const*y').color('name', ['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']).adjust('stack')
        chart.render()
        self.setData({
          isRenderPie: true
        })
        // 注意：需要把chart return 出来
        return chart
      }
    }, () => {
      this.setData({
        pieShow: true
      })
    })
  },
  onShow() {
    const index = this.selectComponent('#index')
    index.setRecentCate()
    const { shouldFetchList, isEdit } = store.data
    if (shouldFetchList) {
      this.onReFetchBillList()
      store.data.shouldFetchList = false
    }
  },
  calCalendarHeight() {
    const query = wx.createSelectorQuery().in(this)
    query.select('.cal-calendar').boundingClientRect(() => {
    }).exec()
  },
  goTo(event) {
    const { active } = event.currentTarget.dataset
    this.setData({
      scale: active
    })
    store.data.activeTab = active
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
  onGetNewWord() {
    const index = this.selectComponent('#index')
    index.getWord()
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
