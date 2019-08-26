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
    selectedCategory: String,
    editBill: Object
  },
  data: {
    sum: '',
    note: '',
    active_tab: 0,
    active_category: '吃',
    active_date: '今天',
    categoryList: [],
    active_date_time: '',
    currentActiveDateTime: '',
    loadingCreate: false,
    isEdit: false
  },
  ready() {
    const now = new Date()
    this.setData({
      active_date_time: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      currentActiveDateTime: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    })
  },
  attached() {
    console.log('in attached', this.selectComponent('#list'))
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindInput(event) {
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
      } else {
        // 收入或者支出的tab
        getApp().globalData.selectedCategory = ''
        this.setData({
          selectedCategory: ''
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
        active_tab,
        selectedCategory,
        isEdit,
        editBill
      } = this.data
      if (!/^0{1}([.]\d{1,2})?$|^[1-9]\d*([.]{1}[0-9]{1,2})?$/.test(Number(sum)) || isNaN(Number(sum))) {
        wx.showToast({
          title: '金额输入不正确，最多两位小数',
          icon: 'none'
        })
        return false
      }
      if (Number(sum) === 0) {
        wx.showToast({
          title: '金额不能为0呀！',
          icon: 'none'
        })
        return false
      }
      if (!selectedCategory) {
        wx.showToast({
          title: '未选择分类！',
          icon: 'none'
        })
        return false
      }
      self.setData({
        loadingCreate: true
      })
      wx.cloud.callFunction({
        name: 'account',
        data: {
          mode: isEdit ? 'updateById' : 'add',
          money: sum,
          categoryId: selectedCategory,
          noteDate: active_date_time,
          description: note,
          flow: active_tab,
          id: isEdit ? editBill._id : ''
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: isEdit ? '修改成功' : '成功新增一笔账单',
              icon: 'none'
            })
            getApp().globalData.selectedCategory = ''
            self.resetStatus()
            self.triggerEvent('reFetchBillList')
          }
        },
        complete() {
          self.setData({
            loadingCreate: false
          })
        }
      })
    },
    dectiveEdit() {
      const { editBill } = this.data
      const now = new Date()
      const dayMap = {
        [`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`]: '今天',
        [`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 1}`]: '昨天',
        [`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - 2}`]: '前天',
      }
      this.setData({
        sum: editBill.money,
        note: editBill.description,
        active_tab: editBill.flow,
        selectedCategory: editBill.categoryId,
        active_date: dayMap[`${editBill.noteDate}`],
        active_date_time: editBill.noteDate,
        isEdit: true
      })
    },
    resetStatus() {
      this.setData({
        sum: '',
        note: '',
        active_tab: 0,
        active_category: '吃',
        active_date: '今天',
        categoryList: [],
        active_date_time: this.data.currentActiveDateTime,
        loadingCreate: false,
        isEdit: false,
        selectedCategory: ''
      })
    }
  }
})
