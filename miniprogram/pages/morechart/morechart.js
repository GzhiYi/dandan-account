import uCharts from '../u-charts'
import { parseTime } from '../../util'

let lineChartA = null
let lineChartB = null
Page({
  data: {
    cWidth: 0,
    cHeight: 0,
    date: parseTime(new Date(), '{y}-{m}'),
    year: parseTime(new Date(), '{y}'),
    month: parseTime(new Date(), '{m}'),
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
      date,
    } = this.data
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByMonth',
        date,
      },
      success(res) {
        const { categories, series } = res.result.data
        if (res.result.code === 1) {
          lineChartA = new uCharts({
            $this: self,
            canvasId: 'linechart-month',
            type: 'line',
            fontSize: 11,
            legend: true,
            dataLabel: true,
            dataPointShape: true,
            background: '#FFFFFF',
            pixelRatio: 1,
            categories,
            series,
            animation: true,
            enableScroll: true, // 开启图表拖拽功能
            xAxis: {
              disableGrid: false,
              type: 'grid',
              gridType: 'dash',
              itemCount: 4,
              scrollShow: true,
              scrollAlign: 'left',
              // scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
              // scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
            },
            yAxis: {
              // disabled:true
              gridType: 'dash',
              splitNumber: 8,
              min: 10,
              max: 180,
              format: (val) => val, // 如不写此方法，Y轴刻度默认保留两位小数
            },
            width: 385,
            height: 250,
            extra: {
              line: {
                type: 'curve',
              },
            },
          })
        }
      },
    })
  },
  getYearData() {
    const self = this
    const {
      date,
    } = this.data
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByYear',
        date: date.split('-')[0],
      },
      success(res) {
        const { categories, series } = res.result.data
        if (res.result.code === 1) {
          lineChartB = new uCharts({
            $this: self,
            canvasId: 'linechart-year',
            type: 'line',
            fontSize: 11,
            legend: true,
            dataLabel: true,
            dataPointShape: true,
            background: '#FFFFFF',
            pixelRatio: 1,
            categories,
            series,
            animation: true,
            enableScroll: true, // 开启图表拖拽功能
            xAxis: {
              disableGrid: false,
              type: 'grid',
              gridType: 'dash',
              itemCount: 4,
              scrollShow: true,
              scrollAlign: 'left',
              // scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
              // scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
            },
            yAxis: {
              // disabled:true
              gridType: 'dash',
              splitNumber: 8,
              min: 10,
              max: 180,
              format: (val) => val, // 如不写此方法，Y轴刻度默认保留两位小数
            },
            width: 385,
            height: 250,
            extra: {
              line: {
                type: 'curve',
              },
            },
          })
        }
      },
    })
  },
  touchLineA(e) {
    lineChartA.scrollStart(e);
  },
  moveLineA(e) {
    lineChartA.scroll(e);
  },
  touchEndLineA(e) {
    lineChartA.scrollEnd(e);
    // 下面是toolTip事件，如果滚动后不需要显示，可不填写
    lineChartA.showToolTip(e, {
      format(item, category) {
        return `${category} ${item.name}:${item.data}`
      },
    });
  },
  touchLineB(e) {
    lineChartB.scrollStart(e);
  },
  moveLineB(e) {
    lineChartB.scroll(e);
  },
  touchEndLineB(e) {
    lineChartB.scrollEnd(e);
    // 下面是toolTip事件，如果滚动后不需要显示，可不填写
    lineChartB.showToolTip(e, {
      format(item, category) {
        return `${category} ${item.name}:${item.data}`
      },
    });
  },
  bindDateChange(event) {
    const oldMonth = this.data.month
    const oldYear = this.data.year
    const newMonth = parseTime(event.detail.value, '{m}')
    const newYear = parseTime(event.detail.value, '{y}')
    this.setData({
      date: event.detail.value,
      month: newMonth,
      year: newYear,
    })

    if (oldMonth !== newMonth) {
      this.getMonthData()
    }
    if (oldYear !== newYear) {
      this.getYearData()
    }
  },
})
