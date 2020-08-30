import uCharts from '../u-charts'
import { parseTime } from '../../util'
// import cloneDeep from 'lodash/cloneDeep'

// eslint-disable-next-line no-unused-vars
let lineChart = null
Page({
  data: {
    targetInfo: {},
    progress: {},
    screenWidth: getApp().globalData.screenWidth,
    nowMoney: 0,
    showResult: false,
    showResultType: '',
    loadingDelete: false,
    showDeleteDialog: false,
  },
  onLoad() {
    this.getTargetInfo()
  },
  getTargetInfo() {
    const self = this
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'targetInfo',
      },
      success(res) {
        if (res.result.code === 1) {
          const targetInfo = res.result.data
          const allDate = self.getDates(new Date(targetInfo.targetData.createTime), new Date(targetInfo.targetData.endDate))
          const toFinishDate = self.getDates(new Date(), new Date(targetInfo.targetData.endDate))
          self.setData({
            targetInfo,
            progress: {
              percentage: self.handlePercentage(((allDate.length - toFinishDate.length) / allDate.length).toFixed(2)),
              passDay: allDate.length - toFinishDate.length,
              allDay: allDate.length,
            },
          })
          // 查看这个目标是不是到期了
          if (new Date(targetInfo.targetData.endDate).getTime() < new Date().getTime()) {
            self.setData({
              showResult: true,
              showResultType: 'expired',
            })
          }
          self.renderLineChart(targetInfo.targetData, targetInfo.billList, allDate)
          self.renderProgress({
            percentage: self.handlePercentage(((allDate.length - toFinishDate.length) / allDate.length).toFixed(2)),
            subTitle: '已过',
            id: 'time-progress',
            bgColor: '#D75C6E',
          })
        }
      },
      complete() {
        wx.hideLoading()
      },
    })
  },
  renderLineChart(targetData, billList, allDate) {
    const self = this
    // 处理账单，按每天进行保存
    const formatBillList = {}
    const formatAllDate = allDate.map((item) => parseTime(item, '{y}-{m}-{d}'))
    const lastBillDate = parseTime(billList[billList.length - 1].noteDate, '{y}-{m}-{d}')
    const lastBillDateIndex = formatAllDate.indexOf(lastBillDate)
    let nowMoney = 0
    billList.forEach((bill) => {
      formatAllDate.forEach((day, index) => {
        if (index <= lastBillDateIndex) {
          if (day === parseTime(bill.noteDate, '{y}-{m}-{d}')) {
            if (!formatBillList[day]) formatBillList[day] = 0
            const setMoney = bill.flow === 0 ? formatBillList[day] -= bill.money : formatBillList[day] += bill.money
            // eslint-disable-next-line no-restricted-globals
            if (!isNaN(setMoney)) {
              formatBillList[day] = setMoney
            }
          }
        }
      })
    })
    // 移除最后一个
    // 这里的keys是日期数组
    const keys = Object.keys(formatBillList)
    const seriesData = []
    for (let i = 0; i < formatAllDate.length; i++) {
      if (i <= lastBillDateIndex) {
        if (i === 0) {
          // 第一天的收支情况
          formatBillList[keys[i]] += targetData.startMoney
        } else if (i !== 0 && i !== lastBillDateIndex) {
          formatBillList[keys[i]] += formatBillList[keys[i - 1]]
        }
        if (formatBillList[keys[i]]) {
          seriesData.push(formatBillList[keys[i]])
        }
        if (i === lastBillDateIndex) {
          nowMoney = formatBillList[lastBillDate]
        }
      }
    }
    console.log('>>>.', seriesData, keys)
    self.setData({
      nowMoney,
    })
    if (nowMoney >= targetData.targetMoney) {
      self.setData({
        showResult: true,
        showResultType: 'earn',
      })
    }
    self.renderProgress({
      percentage: self.handlePercentage((nowMoney / targetData.targetMoney).toFixed(2)),
      id: 'miss',
      subTitle: '加油✊',
      bgColor: '#FAACCE',
    })
    lineChart = new uCharts({
      $this: self,
      canvasId: 'linechart',
      type: 'area',
      fontSize: 11,
      legend: {
        show: false,
      },
      dataLabel: false,
      dataPointShape: false,
      enableMarkLine: true,
      background: 'rgba(255, 255, 255, 0)',
      pixelRatio: 1,
      categories: keys,
      padding: [23, 0, 20, 0],
      series: [
        {
          color: '#E9EBF3',
          data: seriesData,
          index: 0,
          legendShape: 'line',
          name: '',
          pointShape: 'circle',
          show: true,
          type: 'line',
          addPoint: true,
        },
      ],
      animation: true,
      xAxis: {
        disableGrid: true,
        type: 'grid',
        gridType: 'dash',
        scrollShow: false,
        scrollAlign: 'left',
        disabled: true,
        gridColor: '#3F4D8D',
        axisLineColor: '#3F4D8D',
        // scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
        // scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
      },
      yAxis: {
        // disabled:true
        gridType: 'solid',
        dashLength: 1,
        gridColor: '#3F4D8D',
        data: [{
          axisLineColor: '#3F4D8D',
          fontColor: '#7D87B5',
          max: targetData.targetMoney,
          min: 0,
        }],
        splitNumber: 5,
      },
      width: getApp().globalData.screenWidth * 0.8,
      height: 200,
      extra: {
        line: {
          type: 'curve',
        },
        area: {
          opacity: 0.3,
          gradient: true,
          addLine: true,
        },
        markLine: {
          data: [{
            value: targetData.targetMoney,
            color: '#4fd69c',
            lineColor: '#4fd69c',
            dashLength: 1,
          }],
          type: 'dash',
        },
      },
    })
    // eslint-disable-next-line no-console
  },
  handlePercentage(percentage) {
    if (percentage >= 1) {
      return 1
    }
    return percentage
  },
  renderProgress(data) {
    const self = this
    // eslint-disable-next-line no-new
    new uCharts({
      $this: self,
      canvasId: data.id,
      type: 'arcbar',
      fontSize: 22,
      dataLabel: true,
      background: 'rgba(255, 255, 255, 0)',
      pixelRatio: 1,
      animation: true,
      series: [{
        data: data.percentage,
        color: '#fff',
      }],
      title: {
        name: `${data.percentage * 100}%`,
        color: '#fff',
        fontSize: 25,
      },
      subtitle: {
        name: data.subTitle,
        color: '#fff',
        fontSize: 15,
      },
      padding: [0, 0, 0, 0],
      width: getApp().globalData.screenWidth * 0.3,
      height: 120,
      extra: {
        arcbar: {
          backgroundColor: data.bgColor,
        },
      },
    })
  },
  getDates(startDate, endDate) {
    const dates = []
    let currentDate = startDate

    function addDays(days) {
      const date = new Date(this.valueOf())
      date.setDate(date.getDate() + days)
      return date
    }
    while (currentDate <= endDate) {
      dates.push(currentDate)
      currentDate = addDays.call(currentDate, 1)
    }
    // 发现少了一天，再推一下
    dates.push(currentDate)
    return dates
  },
  clickPig() {
    wx.vibrateShort()
    wx.showToast({
      title: '加油鸭！❤️',
      icon: 'none',
    })
  },
  onShowDialog() {
    this.setData({
      showDeleteDialog: true,
    })
  },
  confirmDelete() {
    const self = this
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'delete',
      },
      success() {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
        })
        self.setData({
          showDeleteDialog: false,
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
    })
  },
})
