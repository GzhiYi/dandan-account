// pages/components/index/index.js
import { parseTime } from '../../../date.js'
const Flow = {
  pay: 0,
  income: 1
}
Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    selectedCategory: Object,
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
    isEdit: false,
    pickDate: ''
  },
  ready() {
    const now = new Date()
    const date = parseTime(now, '{y}-{m}-{d}')
    this.setData({
      active_date_time: date,
      currentActiveDateTime: date,
      pickDate: date
    })
  },
  attached() {
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
    converDate(date, isDate = true) {
      const yesterday = new Date().setDate(new Date().getDate() - 1)
      const yeyesterday = new Date().setDate(new Date().getDate() - 2)
      let dayMap = {}
      if (isDate) {
        dayMap = {
          '今天': parseTime(new Date(), '{y}-{m}-{d}'),
          '昨天': parseTime(yesterday, '{y}-{m}-{d}'),
          '前天': parseTime(yeyesterday, '{y}-{m}-{d}'),
        }
      } else {
        dayMap = {
          [`${parseTime(new Date(), '{y}-{m}-{d}')}`]: '今天',
          [`${parseTime(yesterday, '{y}-{m}-{d}')}`]: '昨天',
          [`${parseTime(yeyesterday, '{y}-{m}-{d}')}`]: '前天',
        }
      }
      return dayMap[date] || ''
    },
    changeTab(event) {
      const { dataset } = event.currentTarget
      this.setData({
        [`active_${dataset.key}`]: dataset.value
      })
      if (/date/.test(dataset.key)) {        
        this.setData({
          active_date_time: this.converDate(dataset.value)
        })
      } else {
        // 收入或者支出的tab
        getApp().globalData.selectedCategory = null
        this.setData({
          selectedCategory: null
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
          categoryId: selectedCategory._id,
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
      this.setData({
        sum: editBill.money,
        note: editBill.description,
        active_tab: editBill.flow,
        selectedCategory: editBill.category,
        active_date: this.converDate(editBill.noteDate, false),
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
    },
    bindDateChange(event) {
      this.setData({
        active_date_time: event.detail.value,
        active_date: this.converDate(event.detail.value, false)
      })
    }
  }
})
