import { strip, debounce, parseTime } from '../../../util'
import uCharts from '../../u-charts.js'
let canvasPie = null
let resultBillList = []
let resultCategoryList = []
let firstFetch = true // 用于判断请求是否为第一次，true为本月数据
let currentMonthBasicData = {}

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    tab: {
      type: String
    }
  },
  data: {
    year: new Date().getFullYear().toString(), // 不转为字符串IOS将从1年开始
    months: {
      month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    activeMonth: new Date().getMonth(),
    cWidth: 0,
    cHeight: 0,
    activeTab: 'pay',
    screenHeight: getApp().globalData.screenHeight,
    basicData: {},
    fixScroll: true,
    activeParentIndex: 0,
    activeParentCategory: null,
    showParentDialog: false,
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false,
    billList: undefined,
    billResult: null,
    pieChartData: null,
    categoryList: []
  },
  /**
   * hack。修复scroll-x在hidden下不显示的问题。该问题存在于ios。
   */
  observers: {
    'tab': function (tab) {
      this.setData({
        fixScroll: tab === 'chart'
      })
    }
  },
  ready() {
    this.setData({
      cWidth: wx.getSystemInfoSync().screenWidth - 30,
      cHeight: 500 / 750 * wx.getSystemInfoSync().screenWidth - 50
    })
    this.getPieChartData()
  },
  methods: {
    // 获取选择月份的第一天和最后一天
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
    // 左上角年份变化
    bindYearChange(event) {
      const self = this
      this.setData({
        year: event.detail.value
      }, function() {
        self.getPieChartData()
      })
    },
    // 选择月份回调
    selectMonth(event) {
      const self = this
      const { month } = event.currentTarget.dataset
      if (month - 1 === self.data.activeMonth) return false
      wx.vibrateShort()
      this.setData({
        activeMonth: month - 1
      }, function() {
        self.getPieChartData()
      })
    },
    // 获取支出和收入的基本数据
    getPieChartData() {
      const {
        year,
        activeMonth,
        activeTab
      } = this.data
      const self = this
      const firstAndLastArray = self.getFirstAndLastDayByMonth(year, activeMonth + 1)
      if (!firstFetch) {
        wx.showLoading({
          title: '加载数据中'
        })
      }
      wx.cloud.callFunction({
        name: 'accountAggregate',
        data: {
          mode: 'getPieChartData',
          startDate: firstAndLastArray[0],
          endDate: firstAndLastArray[1]
        },
        success(res) {
          const { result } = res
          if (result && result.code === 1) {
            const dataList = result.detailResult[activeTab === 'pay' ? 'flowOut' : 'flowIn']['dataList']
            self.setData({
              pieChartData: dataList.length === 0 ? null : result.detailResult,
              categoryList: dataList
            })
            if (dataList.length > 0) {
              self.fillPie(result.detailResult)
            }
            if (firstFetch) {
              self.triggerEvent('currentMonthData', JSON.parse(JSON.stringify(result.detailResult)))
              // 将第一次获取改为false
              firstFetch = false
            }
          } else {
            getApp().showError()
            // 请求失败还是要把数据重置，避免误导
            self.setData({
              pieChartData: null
            })
          }
        },
        fail(error) {
          getApp().showError(JSON.stringify(error))
          // 请求失败还是要把数据重置，避免误导
          self.setData({
            pieChartData: null
          })
        },
        complete() {
          wx.hideLoading()
        }
      })
    },
    reFetch: debounce(function () {
      this.setData({
        billList: []
      })
    }, 300),
    touchPie(e) {
      const self = this
      // hack，解决relative定位后canvas无法正常点击的问题
      e.currentTarget.offsetTop += 110
      console.log('e', e)
      canvasPie.showToolTip(e, {
        format: function (item) {
          self.setData({
            activeParentCategory: item,
            activeParentIndex: item.index
          })
          self.fetchBillList(item)
          return item.name + ' | ' + item.data + ' | ' + strip(item._proportion_.toFixed(2) * 100) + '%'
        }
      })
    },
    // 获取该分类下的账单列表，支持分页。
    fetchBillList(item) {
      console.log(`请求分类${item.categoryName}下的账单`)
    },
    changeTab(e) {
      const {
        tab
      } = e.currentTarget.dataset
      if (tab === this.data.activeTab) return false
      const self = this
      wx.vibrateShort({})
      this.setData({
        activeTab: tab,
        activeParentIndex: 0
      }, function () {
        self.fillPie()
      })
    },
    fillPie() {
      const self = this
      const pieChartData = this.data.pieChartData
      const { cWidth, cHeight, activeTab } = this.data
      const fillPieData = pieChartData[activeTab === 'pay' ? 'flowOut' : 'flowIn']['dataList'].map((bill, index) => {
        bill['data'] = bill.allSum
        bill['name'] = bill.categoryName
        bill['index'] = index
        return bill
      })
      
      canvasPie = new uCharts({
        $this: self,
        canvasId: 'pie',
        type: 'pie',
        fontSize: 11,
        background: '#FFFFFF',
        pixelRatio: 1,
        series: JSON.parse(JSON.stringify(fillPieData)),
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
              allCate['data'] += strip(bill.money)
              allCate['data'] = strip(allCate['data'])
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
        monthIncomeCount: 0,
        netAssets: 0
      }
      mapFlow.forEach(flow => {
        allCategoryList[flow].filter(item => item.bills && item.bills.length > 0).forEach((item, index) => {
          if (item.name && item.data) {
            pieSeriesData[flow].push({
              name: item.name,
              data: item.data,
              originData: item,
              index: index
            })
            basicData[flow].push(item)
            if (flow === 'pay') {
              basicData.monthPay += item.data
              basicData.monthPay = strip(basicData.monthPay)
              basicData.monthPayCount += 1
            }
            if (flow === 'income') {
              basicData.monthIncome += item.data
              basicData.monthIncome = strip(basicData.monthIncome)
              basicData.monthIncomeCount += 1
            }
          }
          self.deletePro(item, ['categoryIcon', 'children', 'createTime', 'description', 'isDel', 'isSelectable', 'openId', 'parentId', 'type'])
        })
      })
      // 计算净资产
      basicData.netAssets = strip(basicData.monthIncome - basicData.monthPay)
      self.setData({
        basicData,
        // 处理选择的父子分类
        activeParentCategory: basicData[activeTab].length > 0 ? basicData[activeTab][0] : {}
      })
      if (firstFetch) {
        currentMonthBasicData = basicData
        firstFetch = false
      }
      currentMonthBasicData.netAssets = basicData.netAssets
      self.triggerEvent('currentMonthData', JSON.parse(JSON.stringify(self.data.billResult)))
      
      return pieSeriesData
    },
    deletePro(obj, arr) {
      arr.forEach(item => {
        delete obj[item]
      })
    },
    onShowDialog(event) {
      if (event.currentTarget.dataset.type === 'parent') {
        this.setData({
          showParentDialog: true
        })
      }
      this.triggerEvent('hideTab', true)
    },
    selectParentCategory(event) {
      const { category, index } = event.currentTarget.dataset
      this.setData({
        activeParentCategory: category,
        activeParentIndex: index,
        showParentDialog: false
      })
      this.triggerEvent('hideTab', false)
    },
    showMenu(event) {
      const self = this
      const { bill } = event.currentTarget.dataset
      self.setData({
        editItem: bill,
        showMenuDialog: true
      })
      self.triggerEvent('hideTab', true)
    },
    closeDialog() {
      this.setData({
        showMenuDialog: false,
        showConfirmDelete: false,
        showParentDialog: false
      })
      this.triggerEvent('hideTab', false)
    },
    editBill() {
      const self = this
      const { editItem } = self.data
      self.setData({
        showMenuDialog: false
      })
      this.triggerEvent('hideTab', false)
      self.triggerEvent('editBill', editItem)
    },
    deleteBill() {
      const self = this
      const { editItem } = self.data
      if (!self.data.showConfirmDelete) {
        self.setData({
          showConfirmDelete: !self.data.showConfirmDelete
        })
        wx.vibrateShort()
      } else {
        self.closeDialog()
        wx.vibrateShort()
        wx.cloud.callFunction({
          name: 'account',
          data: {
            mode: 'deleteById',
            id: editItem._id
          },
          success(res) {
            if (res.result.code === 1) {
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              })
              self.setData({
                editItem: {}
              })
              self.triggerEvent('reFetchBillList')
            } else {
              wx.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              })
            }
          }
        })
      }
    }
  }
})
