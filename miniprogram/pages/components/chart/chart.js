// pages/components/chart/chart.js
import uCharts from '../../u-charts.min.js'
let canvaPie = null
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
    activeMonth: new Date().getMonth(),
    pieData: {
      "series": [{
        "name": "一班",
        "data": 50
      }, {
        "name": "二班",
        "data": 30
      }, {
        "name": "三班",
        "data": 20
      }, {
        "name": "四班",
        "data": 18
      }, {
        "name": "五班",
        "data": 8
      }]
    },
    cWidth: 0,
    cHeight: 0
  },
  ready() {
    this.setData({
      cWidth: wx.getSystemInfoSync().screenWidth,
      cHeight: 500 / 750 * wx.getSystemInfoSync().screenWidth
    })
    this.getServerData()
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
    },
    getServerData() {
      const { pieData, cWidth, cHeight } = this.data
      console.log('ddddd', cWidth, cHeight)
      canvaPie = new uCharts({
        $this: this,
        canvasId: 'pie',
        type: 'pie',
        fontSize: 11,
        legend: { show: true },
        background: '#FFFFFF',
        pixelRatio: 1,
        series: pieData.series,
        animation: true,
        width: cWidth * .83,
        height: cHeight,
        dataLabel: true,
        extra: {
          pie: {
            labelWidth: 15
          }
        },
      });
    },
    touchPie(e) {
      console.log('e', e)
      canvaPie.showToolTip(e, {
        format: function (item) {
          console.log('???', item)
          return item.name + ':' + item.data
        }
      })
    }
  }
})
