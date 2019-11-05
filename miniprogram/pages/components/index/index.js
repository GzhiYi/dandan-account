// pages/components/index/index.js
import { parseTime } from '../../../util'
let globalDefaultCategory = {}
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
    active_date: '今天',
    active_date_time: '',
    loadingCreate: false,
    isEdit: false,
    clickPigNum: 0,
    wordData: null,
    showPayType: false,
    showPayTypeDialog: false,
    payType: '支付宝'
  },
  ready() {
    const now = new Date()
    const date = parseTime(now, '{y}-{m}-{d}')
    this.setData({
      active_date_time: date
    })
    this.getWord()
    function handleDefaultCategory(list) {
      const hour = new Date().getHours()
      let defaultCategory = {}
      if (hour >= 4 && hour < 10) {
        defaultCategory = list.filter(item => item._id === 'food_and_drink_breakfast')[0]
      } else if (hour >= 10 && hour < 15) {
        defaultCategory = list.filter(item => item._id === 'food_and_drink_lunch')[0]
      } else if (hour >= 15 || (hour >= 0 && hour < 4)) {
        defaultCategory = list.filter(item => item._id === 'food_and_drink_dinner')[0]
      }
      globalDefaultCategory = defaultCategory
      return defaultCategory
    }
    const globalDefaultCategoryList = getApp().globalData.defaultCategoryList
    if (globalDefaultCategoryList.length > 0) {
      this.setData({
        selectedCategory: handleDefaultCategory(globalDefaultCategoryList)
      })
    } else {
      getApp().loadDefaultCategoryCallBack = list => {
        // 根据时间对默认选择对分类进行“推荐”
        this.setData({
          selectedCategory: handleDefaultCategory(list)
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getWord() {
      const self = this
      const storeWordData = wx.getStorageSync('word')
      const storeHideWord = wx.getStorageSync('hideWord')
      wx.cloud.callFunction({
        name: 'word',
        data: {
          mode: 'get'
        },
        success(res) {
          const response = res.result
          if (response.code === 1) {
            // 本地缓存信息
            const wordData = response.data
            if (((wordData.word !== storeWordData.word) || new Date() < new Date(wordData.expire)) && wordData.show && storeHideWord.word !== wordData.word) {
              wx.setStorageSync('word', wordData)
              self.setData({
                wordData
              })
            }
            // 无论如何都要设置这个
            self.setData({
              showPayType: response.showPayType
            })
          }
        }
      })
    },
    // 关闭对话通知
    closeTalk(event) {
      wx.setStorageSync('hideWord', this.data.wordData)
      this.setData({
        wordData: null
      })
      wx.showToast({
        title: '已隐藏提示',
        icon: 'none'
      })
    },
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
        getApp().globalData.selectedCategory = dataset.value === 0 ? globalDefaultCategory : null
        this.setData({
          selectedCategory: dataset.value === 0 ? globalDefaultCategory : null
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
        editBill,
        // 某轩的需求
        showPayType,
        payType
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
          description: note ? (showPayType ? `${payType}-${note}` : note) : note,
          flow: active_tab,
          id: isEdit ? editBill._id : ''
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: isEdit ? '😬修改成功' : '😉成功新增一笔账单',
              icon: 'none'
            })
            self.resetStatus()
            self.triggerEvent('reFetchBillList')
            if (active_tab === 0) {
              // 本地记录用户记账高频分类
              const m = wx.getStorageSync('localCategory') || []
              const keys = m.map(item => item._id)
              // 如果本地已有缓存
              const index = keys.indexOf(selectedCategory._id)
              if (index !== -1) {
                m[index]['pickTime'] = ++m[index]['pickTime']
              } else {
                // 如果没有
                m.push({
                  ...selectedCategory,
                  'pickTime': 1
                })
              }
              // em.... 经过storage后的数据类型会从数值类型转为字符串类型
              wx.setStorageSync('localCategory', m.sort((a, b) => Number(b.pickTime) - Number(a.pickTime)))
            }

            self.setData({
              selectedCategory: globalDefaultCategory
            })
          }
        },
        complete() {
          self.setData({
            loadingCreate: false
          })
        }
      })
    },
    // tab.js调用
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
        active_date: '今天',
        loadingCreate: false,
        selectedCategory: globalDefaultCategory,
        isEdit: false
      })
    },
    bindDateChange(event) {
      this.setData({
        active_date_time: event.detail.value,
        active_date: this.converDate(event.detail.value, false)
      })
    },
    clickPig() {
      const self = this
      let { clickPigNum } = self.data
      wx.vibrateShort()
      if (clickPigNum <= 4) {
        clickPigNum++
        const temp = ['！', '！！', '！！！', '！！！！', '！！！！！']
        wx.showToast({
          title: '你再点我' + temp[clickPigNum - 1],
          icon: 'none'
        })
      }
      if (clickPigNum === 5) {
        setTimeout(() => {
          self.setData({
            clickPigNum: 0
          })
          wx.showToast({
            title: '我又出现了 - -',
            icon: 'none'
          })
        }, 5000)
      }
      self.setData({
        clickPigNum
      })
    },
    selectType(event) {
      this.setData({
        payType: event.target.dataset.paytype,
        showPayTypeDialog: false
      })
      this.triggerEvent('hideTab', false)
    },
    onShowPayTypeDialog() {
      this.setData({
        showPayTypeDialog: true
      })
      this.triggerEvent('hideTab', true)
    },
    closeDialog() {
      this.setData({
        showPayTypeDialog: false
      })
      this.triggerEvent('hideTab', false)
    }
  }
})
