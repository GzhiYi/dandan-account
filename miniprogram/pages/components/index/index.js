// pages/components/index/index.js
const Flow = {
  pay: 0,
  income: 1
}
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
    sum: '',
    note: '',
    active_tab: 0,
    active_category: '吃',
    active_date: '今天',
    categoryList: [],
    active_date_time: ''
  },
  ready() {
    const now = new Date()
    this.setData({
      active_date_time: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    })
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
      if (/date/.test(dataset.key)) {
        const now = new Date()
        const dayMap = {
          '今天': `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
          '昨天': `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 1}`,
          '前天': `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 2}`,
        }
        this.setData({
          active_date_time: dayMap[`${dataset.value}`]
        })
      }
    },
    goToCategory() {
      wx.navigateTo({
        url: `/pages/category/category?type=${this.data.active_tab}`,
      })
    },
    submitForm() {
      const self = this
      const {
        sum,
        note,
        active_date_time,
        active_tab
      } = this.data
      wx.cloud.callFunction({
        name: 'account',
        data: {
          mode: 'add',
          money: sum,
          categoryId: 'others',
          noteDate: active_date_time,
          description: note,
          flow: active_tab
        },
        success(res) {
          console.log('res', res)
          if (res.result.code === 1) {
            wx.showToast({
              title: '成功新增一笔账单',
              icon: 'none'
            })
            self.setData({
              sum: '',
              note: ''
            })
          }
        }
      })
    }
  }
})
