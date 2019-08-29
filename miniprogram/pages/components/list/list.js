// pages/components/list/list.js
Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    billList: null,
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false,
    screenHeight: getApp().globalData.screenHeight,
    statusBarHeight: getApp().globalData.statusBarHeight,
    calendarHeight: 0
  },

  /**
   * 组件的方法列表
   */
  ready() {
    const self = this
    self.getBillList()
    console.log('gogo', this.data.statusBarHeight)
    const query = wx.createSelectorQuery().in(this)
    query.select('.cal-calendar').boundingClientRect(function (rect) {
      console.log('*****', rect)
      self.setData({
        calendarHeight: rect.height
      })
    }).exec()
  },
  attached() {
    
  },
  methods: {
    getBillList(page = 1) {
      const self = this
      wx.cloud.callFunction({
        name: 'getAccountList',
        data: {
          page,
          limit: 20
        },
        success(res) {
          if (res.result && res.result.code === 1) {
            self.setData({
              billList: res.result.data.page.data
            })
          }
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
