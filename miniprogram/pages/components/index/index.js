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
    sum: '',
    note: '',
    active_tab: '支出',
    active_category: '吃',
    active_date: '今天'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindInput(event) {
      console.log(event)
      const { value } = event.detail
      this.setData({
        [`${event.currentTarget.dataset.name}`]: value
      })
    },
    changeTab(event) {
      const { dataset } = event.currentTarget
      this.setData({
        [`active_${dataset.key}`]: dataset.value
      })
    }
  }
})
