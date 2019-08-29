// pages/components/chart/chart.js
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
    count: 0
  },
  ready() {
    console.log('chart')
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap() {
      let count = this.data.count
      if (count === 10) {
        wx.showToast({
          title: '你好👋',
          icon: 'none'
        })
        count = -1
        wx.vibrateLong()
      } else {
        wx.vibrateShort()
      }
      this.setData({
        count: count + 1
      })
    }
  }
})
