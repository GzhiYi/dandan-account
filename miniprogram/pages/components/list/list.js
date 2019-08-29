// pages/components/list/list.js
import { parseTime } from '../../../date.js'
Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    tab: String
  },
  data: {
    billList: null,
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false,
    screenHeight: getApp().globalData.screenHeight,
    statusBarHeight: getApp().globalData.statusBarHeight,
    calendarHeight: 0,
    dateRange: null,
    today: ''
  },
  observers: {
    'tab': function(tab) {
      
    }
  },
  ready() {
    const self = this
    const now = new Date()
    self.getBillList(parseTime(now, '{y}-{m}-{d}'), parseTime(now, '{y}-{m}-{d}'), 'index')
    self.setData({
      today: parseTime(now, '{y}-{m}-{d}')
    })
  },
  methods: {
    getBillList(startDate, endDate, fetchFrom, page = 1) {

      const self = this
      if (fetchFrom !== 'index') {
        wx.showLoading({
          title: '加载中...',
        })
      }
      let data = {
        mode: 'getAccountListByTime',
        page,
        limit: 100,
        startDate,
        endDate
      }
      if (self.data.dateRange) {
        data.startDate = self.data.dateRange[0]
        data.endDate = self.data.dateRange[1]
      }
      wx.cloud.callFunction({
        name: 'getAccountList',
        data,
        success(res) {
          if (res.result && res.result.code === 1) {
            self.setData({
              billList: res.result.data.page.data || []
            })
          }
        },
        complete() {
          wx.hideLoading()
        }
      })
    },
    switchTab() {
      this.triggerEvent('switchTab', 'index')
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
        showConfirmDelete: false
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
    },
    onRangePick(event) {
      this.setData({
        dateRange: event.detail
      })
      this.getBillList(event.detail[0], event.detail[1], 'list')
    },
    onControl() {
      const now = new Date()
      const self= this
      self.setData({
        dateRange: null
      })
      self.getBillList(parseTime(now, '{y}-{m}-{d}'), parseTime(now, '{y}-{m}-{d}'), 'list')
    }
  }
})
