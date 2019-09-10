// pages/components/chart/chart.js
import { parseTime } from '../../../date.js'
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
      "series": []
    },
    cWidth: 0,
    cHeight: 0,
    activeTab: 'pay',
    screenHeight: getApp().globalData.screenHeight,
    basicData: {}
  },
  ready() {
    this.setData({
      cWidth: wx.getSystemInfoSync().screenWidth - 50,
      cHeight: 500 / 750 * wx.getSystemInfoSync().screenWidth - 50
    })
    
    this.getServerData()
  },
  methods: {
    getFirstAndLastDayByMonth(year, month) {
      if (month < 10) {
        month = `0${month}`
      }
      const d = new Date(`${year}-${month}`)
      const firstDay = d.setDate(1)
      d.setMonth(d.getMonth() + 1)
      const lastDay = d.setDate(d.getDate() - 1)
      const result = [parseTime(firstDay, '{y}-{m}-{d}'), parseTime(lastDay, '{y}-{m}-{d}')]
      return result
    },
    bindYearChange(event) {
      this.setData({
        year: event.detail.value
      })
    },
    selectMonth(event) {
      const self = this
      wx.vibrateShort()
      this.setData({
        activeMonth: event.currentTarget.dataset.month - 1
      }, function() {
        self.getServerData()
      })
    },
    getServerData() {
      const { pieData, cWidth, cHeight, year, activeMonth, activeTab } = this.data
      const self = this
      const firstAndLastArray = self.getFirstAndLastDayByMonth(year, activeMonth + 1)
      wx.showLoading({
        title: '加载数据中...',
      })
      wx.cloud.callFunction({
        name: 'getAccountList',
        data: {
          mode: 'getAccountListByTime',
          limit: 100,
          startDate: firstAndLastArray[0],
          endDate: firstAndLastArray[1]
        },
        success(res) {
          if (res.result && res.result.code === 1) {
            const billList = res.result.data.page.data || []
            const categoryList = JSON.parse(JSON.stringify(getApp().globalData.categoryList))
            if ('pay' in categoryList) {
              self.fillPie(billList, categoryList)
            } else {
              getApp().loadCategoryCallBack = list => {
                self.fillPie(billList, list)
              }
            }
          } else {
            wx.showToast({
              title: '获取账单失败，稍后再试',
              icon: 'none'
            })
            self.setData({
              billList: []
            })
          }
        },
        complete() {
          wx.hideLoading()
        }
      })
    },
    touchPie(e) {
      canvaPie.showToolTip(e, {
        format: function (item) {
          return item.name + ':' + item.data
        }
      })
    },
    changeTab(e) {
      const { tab } = e.currentTarget.dataset
      wx.vibrateShort({})
      this.setData({
        activeTab: tab
      })
    },
    fillPie(billList, categoryList) {
      const self = this
      const { pieData, cWidth, cHeight, year, activeMonth, activeTab } = this.data
      const formatResult = self.handleBillPieData(billList, categoryList)
      canvaPie = new uCharts({
        $this: self,
        canvasId: 'pie',
        type: 'pie',
        fontSize: 11,
        legend: { show: true },
        background: '#FFFFFF',
        pixelRatio: 1,
        series: JSON.parse(JSON.stringify(formatResult[activeTab])),
        animation: true,
        width: cWidth,
        height: cHeight,
        dataLabel: true,
        extra: {
          pie: {
            labelWidth: 15
          }
        },
        legend: {
          show: false
        }
      });
    },
    handleBillPieData(billList, categoryList) {
      const { activeTab } = this.data
      
      const allCategoryList = JSON.parse(JSON.stringify(categoryList))
      const self = this
      // 处理账单和分类的耦合
      const mapFlow = ['pay', 'income']
      billList.forEach(bill => {
        allCategoryList[mapFlow[bill.flow]].forEach(allCate => {
          allCate.children.forEach(childCate => {
            if (childCate._id === bill.categoryId) {
              if (!allCate['data'] && !allCate['count']) {
                allCate['data'] = 0
                allCate['count'] = 0
                allCate['bills'] = []
                allCate['name'] = ''
              }
              allCate['data'] += bill.money
              allCate['count'] += 1
              allCate['bills'].push(bill)
              allCate['name'] = allCate.categoryName
            }
          })
        })
      })
      let pieSeriesData = {
        pay: [],
        income: []
      }
      let basicData = {
        pay: [],
        income:[],
        monthPay: 0,
        monthPayCount: 0,
        monthIncome: 0,
        monthIncomeCount: 0
      }
      mapFlow.forEach(flow => {
        allCategoryList[flow].filter(item => item.bills && item.bills.length > 0).forEach(item => {
          if (item.name && item.data) {
            pieSeriesData[flow].push({
              name: item.name,
              data: item.data
            })
            basicData[flow].push(item)
            if (flow === 'pay') {
              basicData.monthPay += item.data
              basicData.monthPayCount += 1
            }
            if (flow === 'income') {
              basicData.monthIncome += item.data
              basicData.monthIncomeCount += 1
            }
          }
          self.deletePro(item, ['categoryIcon', 'children', 'createTime', 'description', 'isDel', 'isSelectable', 'openId', 'parentId', 'type'])
        })
      })
      self.setData({
        basicData
      })
      getApp().globalData.basicData = basicData
      return pieSeriesData
    },
    deletePro(obj, arr) {
      arr.forEach(item => {
        delete obj[item]
      })

    }
  }
})
