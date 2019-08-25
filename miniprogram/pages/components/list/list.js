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
    billList: []
  },

  /**
   * 组件的方法列表
   */
  ready() {
    this.getBillList()
  },
  methods: {
    getBillList() {
      console.log('call this')
      const self = this
      wx.cloud.callFunction({
        name: 'getAccountList',
        data: {},
        success(res) {
          if (res.result.code === 1) {
            self.setData({
              billList: res.result.data.data.reverse()
            })
            console.log(self.data.billList)
          }
        }
      })
    }
  }
})
