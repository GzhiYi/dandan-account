import dayjs from 'dayjs'
import { strip, debounce } from '../../../util'
// eslint-disable-next-line import/extensions
import uCharts from '../../u-charts.js'

const { importStore } = getApp()
const { create, store } = importStore
let canvasPie = null
let firstFetch = true // 用于判断请求是否为第一次，true为本月数据
let page = 1 // 默认的分页值
let hasNext = false // 是否有下一页
const DEFAULT_LIMIT = 40

create.Component(store, {
  options: {
    styleIsolation: 'shared'
  },
  use: ['sysInfo.screenHeight', 'mapCategoryName'],
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
    fixScroll: true,
    activeParentIndex: 0,
    activeParentCategory: null,
    showParentDialog: false,
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false,
    billList: [],
    billResult: null,
    pieChartData: null,
    categoryList: [],
    loadingBills: -1,
    total: 0,
    pieShow: false,
    initChart: null
  },
  /**
   * hack。修复scroll-x在hidden下不显示的问题。该问题存在于ios。
   */
  observers: {
    tab(tab) {
      this.setData({
        fixScroll: tab === 'chart'
      }, () => {
        this.setData({
          fixScroll: tab === 'chart'
        })
      })
    }
  },
  ready() {
    this.setData({
      cWidth: wx.getSystemInfoSync().screenWidth - 30,
      // eslint-disable-next-line no-mixed-operators
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
      const result = [dayjs(firstDay, 'YYYY-MM-DD'), dayjs(lastDay).format('YYYY-MM-DD')]
      return result
    },
    // 左上角年份变化
    bindYearChange(event) {
      const self = this
      this.setData({
        year: event.detail.value,
        billList: [],
        selectParentCategory: {}
      }, () => {
        self.getPieChartData()
      })
      // 重置请求参数值
      self.resetRequestParam()
    },
    // 选择月份回调
    selectMonth(event) {
      const self = this
      const { month } = event.currentTarget.dataset
      if (month - 1 === self.data.activeMonth) return false
      // 重置请求参数值
      self.resetRequestParam()
      wx.vibrateShort()
      this.setData({
        activeMonth: month - 1,
        billList: [],
        selectParentCategory: {}
      }, () => {
        self.getPieChartData()
      })
    },
    // 获取支出和收入的基本数据
    getPieChartData(isNewBill = false) {
      const {
        year,
        activeMonth,
        activeTab,
        activeParentCategory
      } = this.data
      const self = this
      const firstAndLastArray = self.getFirstAndLastDayByMonth(year, activeMonth + 1)
      // isNewBill，是否为增加账单后重新获取数据
      if (isNewBill) {
        self.setData({
          billList: []
        })
        self.fetchBillList(activeParentCategory)
      }
      store.data.loadingRightIcon = true
      wx.cloud.callFunction({
        name: 'accountAggregate',
        data: {
          mode: 'getPieChartData',
          startDate: firstAndLastArray[0],
          endDate: firstAndLastArray[1]
        },
        success(res) {
          self.setData({
            initChart(F2, config) {
              console.log('F2', F2)
              config.self = self
              const chart = new F2.Chart(config)
              const data = [{
                name: '其他消费',
                y: 6371664,
                const: 'const'
              }, {
                name: '生活用品',
                y: 7216301,
                const: 'const'
              }, {
                name: '通讯物流',
                y: 1500621,
                const: 'const'
              }, {
                name: '交通出行',
                y: 586622,
                const: 'const'
              }, {
                name: '饮食',
                y: 900000,
                const: 'const'
              }]
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
                label1: function label1(d, color) {
                  return {
                    text: debounce.name,
                    fill: color
                  }
                },
                label2: function label2(d) {
                  return {
                    text: `￥${String(Math.floor(d.y * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                    fill: '#808080',
                    fontWeight: 'bold'
                  }
                }
              })

              chart.interval().position('const*y').color('name', ['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864']).adjust('stack')
              chart.render()
              // 注意：需要把chart return 出来
              return chart
            }
          }, () => {
            self.setData({
              pieShow: true
            })
          })
          const { result } = res
          if (result && result.code === 1) {
            const { dataList } = result.detailResult[activeTab === 'pay' ? 'flowOut' : 'flowIn']
            self.setData({
              pieChartData: result.detailResult,
              categoryList: dataList
            })

            if (dataList.length > 0) {
              self.fillPie(result.detailResult)
            }
            if (firstFetch) {
              store.data.currentMonthData = result.detailResult
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
          store.data.loadingRightIcon = false
        }
      })
    },
    reFetch: debounce(function () {
      this.setData({
        billList: []
      })
    }, 300, true),
    resetRequestParam() {
      // eslint-disable-next-line no-unused-expressions
      page = 1
      hasNext = false
      this.setData({
        activeParentCategory: null
      })
    },
    touchPie: debounce(function (e) {
      const self = this
      // 重置请求参数值
      self.resetRequestParam()
      // hack，解决relative定位后canvas无法正常点击的问题
      e.currentTarget.offsetTop += 110
      canvasPie.showToolTip(e, {
        format(item) {
          self.setData({
            activeParentCategory: item,
            billList: [],
            activeParentIndex: item.index
          })
          self.fetchBillList(item)
          wx.vibrateShort()
          return `${item.name} / ${+parseFloat(item.data.toPrecision(12))} / ${strip(item._proportion_.toFixed(2) * 100)}%`
        }
      })
    }, 300, true),
    // 获取该分类下的账单列表，支持分页。
    fetchBillList(item) {
      if (!item) return
      const self = this
      const {
        year,
        activeMonth
      } = self.data
      const firstAndLastArray = self.getFirstAndLastDayByMonth(year, activeMonth + 1)
      self.setData({
        loadingBills: true
      })
      wx.cloud.callFunction({
        name: 'getAccountList',
        data: {
          categoryId: item.categoryId,
          startDate: firstAndLastArray[0],
          endDate: firstAndLastArray[1],
          limit: DEFAULT_LIMIT,
          page
        },
        success(res) {
          const { result } = res
          if (result.code === 1) {
            // 如果返回的计数大于约定的限制数的话，就代表有下一页
            hasNext = result.data.count - (page * DEFAULT_LIMIT) > 0
            if (hasNext) {
              page += 1
            }
            let tempBillList = self.data.billList
            tempBillList = [...tempBillList, ...result.data.page]
            self.setData({
              billList: tempBillList,
              total: result.data.count
            })
          }
        },
        fail() {
          getApp().showError()
        },
        complete() {
          self.setData({
            loadingBills: false
          })
          wx.hideLoading()
        }
      })
    },
    onScrollBottom() {
      if (hasNext) {
        this.fetchBillList(this.data.activeParentCategory)
        wx.showLoading({
          title: '加载中...'
        })
      }
    },
    changeTab(e) {
      const self = this
      const {
        tab
      } = e.currentTarget.dataset
      const {
        pieChartData,
        activeTab
      } = self.data
      if (tab === activeTab) return false
      wx.vibrateShort({})
      self.setData({
        activeTab: tab,
        activeParentIndex: 0,
        activeParentCategory: null,
        billList: [],
        categoryList: pieChartData[tab === 'pay' ? 'flowOut' : 'flowIn'].dataList || []
      }, () => {
        self.fillPie()
      })
    },
    fillPie() {
      const self = this
      const { pieChartData } = this.data
      if (!pieChartData) return
      const { cWidth, cHeight, activeTab } = this.data
      const fillPieData = pieChartData[activeTab === 'pay' ? 'flowOut' : 'flowIn'].dataList.map((bill, index) => {
        bill.data = bill.allSum
        bill.name = bill.categoryName
        bill.index = index
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
      })
    },
    deletePro(obj, arr) {
      arr.forEach((item) => {
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
      wx.vibrateShort()
      // 重置请求参数值
      this.resetRequestParam()
      this.setData({
        activeParentIndex: index,
        showParentDialog: false,
        activeParentCategory: category,
        billList: []
      })
      this.triggerEvent('hideTab', false)
      // 获取账单
      this.fetchBillList(category)
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
      store.data.editBill = editItem
      self.triggerEvent('editBill')
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
