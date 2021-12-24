import { strip } from '../../util'
import dayjs from 'dayjs'
// import cloneDeep from 'lodash/cloneDeep'
const { importStore } = getApp()
const { create, store } = importStore
const baseProgressConfig = (chart, target, text) => {
  chart.axis(false);
  chart.tooltip(false);
  chart.coord('polar', {
    transposed: true,
    innerRadius: 0.8,
    radius: 1
  });
  chart.guide().arc({
    start: [ 0, 0 ],
    end: [ 1, 99.98 ],
    top: false,
    style: {
      lineWidth: 12,
      stroke: 'rgba(255,255,255, 0.3)'
    }
  });
  chart.guide().text({
    position: [ '50%', '50%' ],
    content: text,
    style: {
      fill: '#fff',
      fontSize: 16
    }
  });
  chart.interval()
    .position('x*y')
    .color([ '#fff'])
    .size(12)
    .animate({
      appear: {
        duration: 1200,
        easing: 'cubicIn'
      }
    });
}
create.Page(store, {
  use: ['sysInfo'],
  data: {
    targetInfo: {},
    progress: {},
    nowMoney: 0,
    showResult: false,
    showResultType: '',
    loadingDelete: false,
    showDeleteDialog: false,
    timeProgressShow: false,
    initTimeProgress: null,
    moneyProgressShow: false,
    initMoneyProgress: null,
    initLineChart: null,
    lineChartShow: false
  },
  computed: {
    screenWidth() {
      return this.sysInfo.screenWidth
    }
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
        mode: 'targetInfo'
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
              allDay: allDate.length
            }
          })
          // 查看这个目标是不是到期了
          if (new Date(targetInfo.targetData.endDate).getTime() < new Date().getTime()) {
            self.setData({
              showResult: true,
              showResultType: 'expired'
            })
          }
          self.renderLineChart(targetInfo.targetData, targetInfo.billList, allDate)
          self.renderProgress({
            percentage: self.handlePercentage(((allDate.length - toFinishDate.length) / allDate.length).toFixed(2)),
            subTitle: '已过',
            id: 'time-progress',
            bgColor: '#D75C6E'
          })
        }
      },
      fail() {
        wx.showToast({
          title: '获取目标失败，请重试。',
          icon: 'none'
        })
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  renderLineChart(targetData, billList, allDate) {
    const self = this
    // 处理账单，按每天进行保存
    const formatBillList = {}
    const formatAllDate = allDate.map((item) => dayjs(item).format('YYYY-MM-DD'))
    const lastBillDate = dayjs(billList[billList.length - 1].noteDate).format('YYYY-MM-DD')
    const lastBillDateIndex = formatAllDate.indexOf(lastBillDate)
    let nowMoney = 0
    billList.forEach((bill) => {
      formatAllDate.forEach((day, index) => {
        if (index <= lastBillDateIndex) {
          if (day === dayjs(bill.noteDate).format('YYYY-MM-DD')) {
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
    self.setData({
      nowMoney
    })
    if (nowMoney >= targetData.targetMoney) {
      self.setData({
        showResult: true,
        showResultType: 'earn'
      })
    }
    self.renderProgress({
      percentage: self.handlePercentage((nowMoney / targetData.targetMoney).toFixed(2)),
      id: 'miss',
      subTitle: '加油✊',
      bgColor: '#FAACCE'
    })
    const { startMoney, createTime, targetMoney } = self.data.targetInfo.targetData
    this.setData({
      initLineChart(F2, config) {
        config.self = this
        const chart = new F2.Chart(config)
        const lineData = [{
          date: dayjs(createTime).format('YYYY-MM-DD'),
          value: startMoney
        }]
        let lastValue = startMoney
        billList.forEach(bill => {
          const billValue = bill.flow === 0 ? -bill.money : bill.money
          const noteDate = dayjs(bill.noteDate).format('YYYY-MM-DD')
          const matchLineData = lineData.findIndex(l => l.date === noteDate)
          if (matchLineData !== -1) {
            lineData[matchLineData].value =  strip(lineData[matchLineData].value + billValue)
            lastValue = lineData[matchLineData].value
          } else {
            lineData.push({
              date: noteDate,
              value: strip(lastValue + billValue)
            })
            lastValue = lastValue + billValue
          }
        })
        chart.source(lineData)
        chart.tooltip({
          showCrosshairs: true,
          showTitle: true,
          offsetY: 20
        });
        chart.line().position('date*value').shape('smooth');
        chart.axis('date', {
          label: (text) => {
            return {
              text: ''
            }
          }
        })
        chart.axis('value', {
          position: 'left',
          label: {
            fill: '#CFFFFE',
            fillOpacity: 0.5,
            fontSize: 9,
            fontWeight: 300
          },
          grid: {
            stroke: '#3F4D8D'
          }
        });
        chart.area().position('date*value').style({
          fill: 'l(-90) 0.03:rgba(216,216,216,0.10) 1:#6E6CD8',
          fillOpacity: 1
        });
        chart.guide().line({
          start: [ 'min', targetMoney ],
          end: [ 'max', targetMoney ],
          style: {
            stroke: '#4fd69c',
            lineWidth: 1,
            lineCap: 'round'
          }
        });
        chart.render();
        // 注意：需要把chart return 出来
        return chart
      }
    }, () => {
      this.setData({
        lineChartShow: true
      })
    })
  },
  handlePercentage(percentage) {
    if (percentage >= 1) {
      return 1
    }
    return percentage
  },
  renderProgress(data) {
    if (data.id === 'time-progress') {
      this.setData({
        initTimeProgress(F2, config) {
          const chart = new F2.Chart(config);
          const pieData = [{
            x: '1',
            y: strip(data.percentage * 100)
          }];
          chart.source(pieData, {
            y: {
              max: 100,
              min: 0
            }
          });
          baseProgressConfig(chart, 'time', `${strip(data.percentage * 100)}%\n${data.subTitle}`)
          chart.render();
          // 注意：需要把chart return 出来
          return chart
        }
      }, () => {
        this.setData({
          timeProgressShow: true
        })
      })
    }
    if (data.id === 'miss') {
      this.setData({
        initMoneyProgress(F2, config) {
          const chart = new F2.Chart(config);
          const pieData = [{
            x: '1',
            y: data.percentage * 100
          }];
          chart.source(pieData, {
            y: {
              max: 100,
              min: 0
            }
          });
          baseProgressConfig(chart, 'money', `${data.percentage * 100}%\n${data.subTitle}`)
          chart.render();
          // 注意：需要把chart return 出来
          return chart
        }
      }, () => {
        this.setData({
          moneyProgressShow: true
        })
      })
    }
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
      icon: 'none'
    })
  },
  onShowDialog() {
    this.setData({
      showDeleteDialog: true
    })
  },
  closeDialog() {
    this.setData({
      showDeleteDialog: false
    })
  },
  confirmDelete() {
    const self = this
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'delete',
        id: self.data.targetInfo.targetData._id
      },
      success() {
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
        getApp().checkHasTarget()
        self.setData({
          showDeleteDialog: false
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
})
