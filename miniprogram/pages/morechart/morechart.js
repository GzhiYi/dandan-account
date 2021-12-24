const dayjs = require('dayjs')
const baseConfig = (chart, type = 'month') => {
  chart.scale('date', {
    type: 'timeCat',
    tickCount: 10
  });
  chart.scale('value', {
    tickCount: 5
  });
  chart.tooltip({
    showCrosshairs: true,
    showTitle: type == 'month',
    offsetY: 20
  });
  chart.legend({
    position: 'bottom'
  })
  chart.line().position('date*value').shape('smooth').color('type', function(val) {
    if (val === '收入') {
      return '#4fd69c';
    } else if (val === '支出') {
      return '#f75676';
    } else if (val === '净收入') {
      return '#ffdd57';
    }
  });
}
Page({
  data: {
    cWidth: 0,
    cHeight: 0,
    date: dayjs().format('YYYY-MM'),
    year: dayjs().format('YYYY'),
    month: dayjs().format('MM'),
    monthChartShow: false,
    initMonthChart: null,
    yearChartShow: false,
    initYearChart: null
  },
  onLoad() {
    this.fillChart()
  },
  fillChart() {
    this.getMonthData()
    this.getYearData()
  },
  getMonthData() {
    const self = this
    const {
      date
    } = this.data
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByMonth',
        date
      },
      success(res) {
        const { categories, series } = res.result.data
        if (res.result.code === 1 && categories) {
          const data = []
          categories.forEach((date, index) => {
            series.forEach(line => {
              data.push({
                "date": date,
                "type": line.name,
                "value": line.data[index]
              })
            })
          })
          self.renderMonthChart(data)
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  renderMonthChart(data) {
    this.setData({
      initMonthChart(F2, config) {
        config.self = this
        const chart = new F2.Chart(config)
        chart.source(data)
        baseConfig(chart)
        chart.axis('date', {
          label: (text) => {
            return {
              text: text.slice(8) + '日'
            }
          }
        })
        chart.render();
        // 注意：需要把chart return 出来
        return chart
      }
    }, () => {
      this.setData({
        monthChartShow: true
      })
    })
  },
  getYearData() {
    const self = this
    const {
      date
    } = this.data
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByYear',
        date: date.split('-')[0]
      },
      success(res) {
        const { categories, series } = res.result.data
        if (res.result.code === 1 && categories) {
          const data = []
          categories.forEach((date, index) => {
            series.forEach(line => {
              data.push({
                "date": date,
                "type": line.name,
                "value": line.data[index]
              })
            })
          })
          self.renderYearChart(data)
        }
      }
    })
  },
  renderYearChart(data) {
    this.setData({
      initYearChart(F2, config) {
        config.self = this
        const chart = new F2.Chart(config)
        chart.source(data)
        baseConfig(chart, 'year')
        chart.axis('date', {
          label: (text) => {
            return {
              text: text.slice(5, 7) + '月'
            }
          }
        })
        chart.render();
        // 注意：需要把chart return 出来
        return chart
      }
    }, () => {
      this.setData({
        yearChartShow: true
      })
    })
  },
  bindDateChange(event) {
    const oldMonth = this.data.month
    const oldYear = this.data.year
    const newMonth = dayjs(event.detail.value).format("MM")
    const newYear = dayjs(event.detail.value).format("YYYY")
    this.setData({
      date: event.detail.value,
      month: newMonth,
      year: newYear
    })

    if (oldMonth !== newMonth) {
      this.setData({
        monthChartShow: false
      })
      this.getMonthData()
    }
    if (oldYear !== newYear) {
      this.setData({
        monthChartShow: false,
        yearChartShow: false
      })
      this.getMonthData()
      this.getYearData()
    }
  }
})
