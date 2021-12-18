const { importStore } = getApp()
const { create, store } = importStore
create.Component(store, {
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    billList: {
      type: Array,
      value: []
    },
    loading: {
      type: Number
    }
  },
  use: ['sysInfo.screenHeight', 'mapCategoryName'],
  /**
   * 组件的初始数据
   */
  data: {
    showMenuDialog: false,
    showConfirmDelete: false,
    editItem: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 列表滚动到底部触发该事件
    onScrollBottom() {
      console.log('reach bottom')
    },
    showMenu(event) {
      const { bill } = event.currentTarget.dataset
      console.log('bill', bill)
      this.setData({
        editItem: bill,
        showMenuDialog: true
      })
      store.data.showTabbar = false
    },
    closeDialog() {
      this.setData({
        showMenuDialog: false,
        editItem: {}
      })
      store.data.showTabbar = true
    },
    editBill() {
      const self = this
      const { editItem } = self.data
      self.setData({
        showMenuDialog: false
      })
      store.data.showTabbar = true
      store.data.editBill = editItem
      store.data.activeTab = 'index'
      store.data.isEdit = true
      this.triggerEvent('onEdit')
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
                editItem: {},
                showConfirmDelete: false
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
