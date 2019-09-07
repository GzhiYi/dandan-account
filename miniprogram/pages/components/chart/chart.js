// pages/components/chart/chart.js
Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {

  },
  data: {
    count: 0,
    year: '2019',
    months: {
      month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    activeMonth: new Date().getMonth()
  },
  ready() {
    console.log('chart')
  },
  methods: {
    bindYearChange(event) {
      this.setData({
        year: event.detail.value
      })
    },
    selectMonth(event) {
      wx.vibrateShort()
      this.setData({
        activeMonth: event.currentTarget.dataset.month - 1
      })
    }
  }
})
