// pages/components/index/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    sum: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindInput(event) {
      console.log(event)
      const { value } = event.detail
      this.setData({
        sum: value
      })
    }
  }
})
