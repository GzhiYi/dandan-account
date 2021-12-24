// pages/components/index/index.js
import dayjs from 'dayjs'

const { importStore } = getApp()
const { create, store } = importStore

let globalDefaultCategory = {}
let subscribeStatus = false // 是否已接受订阅推送
let isShowSubscribeTips = false

create.Component(store, {
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    selectedCategory: Object,
    defaultCategoryList: Array,
    isEdit: Boolean
  },
  use: ['mapCategoryName', 'editBill'],
  data: {
    sum: '',
    note: '',
    active_tab: 0,
    active_date: '今天',
    active_date_time: '',
    loadingCreate: false,
    clickPigNum: 0,
    wordData: null,
    showPayType: false,
    showPayTypeDialog: false,
    payType: '支付宝',
    payTypeList: [],
    specialDay: false,
    showAuthDialog: false,
    nowTime: new Date().getTime(),
    loadingWord: false,
    showTargetTip: false,
    targetTip: '',
    recentCate: []
  },
  observers: {
    defaultCategoryList() {
      const globalDefaultCategoryList = store.data.defaultCategoryList
      if (globalDefaultCategoryList.length > 0) {
        this.setData({
          selectedCategory: this.handleDefaultCategory(globalDefaultCategoryList)
        })
        store.data.selectedCategory = this.handleDefaultCategory(globalDefaultCategoryList)
      }
    },
    isEdit(bool) {
      if (bool) this.dectiveEdit()
    }
  },
  ready() {
    const date = dayjs().format('YYYY-MM-DD')
    this.setData({
      active_date_time: date
    })
    this.getWord()

    // 获取一下订阅消息状态，如果是可以推送消息的话就进行推送授权收集
    this.getUserSucscribeStatus()
    // wx.downloadFile({
    //   url: ''
    // })
    // 移除原有的分类缓存
    if (wx.getStorageSync('localCategory')) {
      wx.removeStorageSync('localCategory')
    }
    this.setRecentCate()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    setRecentCate() {
      // 获取缓存的最近分类，用于显示
      this.setData({
        recentCate: wx.getStorageSync('localCategory2155').slice(0, 8)
      })
    },
    handleDefaultCategory(list) {
      const hour = new Date().getHours()
      let defaultCategory = {}
      if (hour >= 4 && hour < 10) {
        // eslint-disable-next-line prefer-destructuring
        defaultCategory = list.filter((item) => item._id === 'food_and_drink_breakfast')[0]
      } else if (hour >= 10 && hour < 15) {
        // eslint-disable-next-line prefer-destructuring
        defaultCategory = list.filter((item) => item._id === 'food_and_drink_lunch')[0]
      } else if (hour >= 15 || (hour >= 0 && hour < 4)) {
        // eslint-disable-next-line prefer-destructuring
        defaultCategory = list.filter((item) => item._id === 'food_and_drink_dinner')[0]
      }
      globalDefaultCategory = defaultCategory
      return defaultCategory
    },
    getWord() {
      const self = this
      this.setData({
        loadingWord: true
      })
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
            wx.setStorageSync('word', wordData)
            self.setData({
              wordData
            })
            // 无论如何都要设置这个
            self.setData({
              showPayType: response.showPayType,
              payTypeList: response.payTypeList
            })
          }
        },
        complete() {
          self.setData({
            loadingWord: false
          })
        }
      })
    },
    // 关闭对话通知
    closeTalk() {
      wx.setStorageSync('hideWord', this.data.wordData)
      const newWordData = this.data.wordData
      newWordData.word = ''
      this.setData({
        wordData: newWordData
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
      const today = dayjs().format('YYYY-MM-DD')
      const sub1Day = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      const sub2Day = dayjs().subtract(2, 'day').format('YYYY-MM-DD')
      let dayMap = {}
      if (isDate) {
        dayMap = {
          今天: today,
          昨天: sub1Day,
          前天: sub2Day
        }
      } else {
        dayMap = {
          [`${today}`]: '今天',
          [`${sub1Day}`]: '昨天',
          [`${sub2Day}`]: '前天'
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
        store.data.selectedCategory = dataset.value === 0 ? globalDefaultCategory : null
        this.setData({
          selectedCategory: dataset.value === 0 ? globalDefaultCategory : null
        })
      }
    },
    goToCategory() {
      wx.navigateTo({
        url: `/pages/category/category?type=${this.data.active_tab}`
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
        // 某轩的需求
        showPayType,
        payType
      } = this.data
      const { isEdit, editBill } = this.store.data
      let transSum = 0
      if (sum) {
        // hack，欧元键盘不显示.号所以需要进行替换
        transSum = Number(sum.toString().replace(',', '.'))
      }
      // eslint-disable-next-line no-restricted-globals
      if (!/^0{1}([.]\d{1,2})?$|^[1-9]\d*([.]{1}[0-9]{1,2})?$/.test(Number(transSum)) || isNaN(Number(transSum))) {
        wx.showToast({
          title: '金额输入不正确，最多两位小数',
          icon: 'none'
        })
        return false
      }
      if (Number(transSum) === 0) {
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
      // 埋点！增加订阅的机会--!!决定还是在账单成功后再增加一个吧
      if (subscribeStatus && !isShowSubscribeTips) {
        wx.requestSubscribeMessage({
          tmplIds: ['29PkwuWSDZ5qCe_bjIAYE8UPbw4A7HIXL_ZNmNCD__s'],
          success(res) {
            // 如果弹出一次了，就不要再烦人家了
            isShowSubscribeTips = true
            // eslint-disable-next-line no-console
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              // 如果订阅成功，则修改状态
              self.changeStatus('open')
            }
          },
          fail() {
            setTimeout(() => {
              self.setData({
                showAuthDialog: true
              })
            }, 2000)
            self.changeStatus('close')
          }
        })
      }
      self.setData({
        loadingCreate: true
      })
      wx.cloud.callFunction({
        name: 'account',
        data: {
          mode: isEdit ? 'updateById' : 'add',
          money: transSum,
          categoryId: selectedCategory._id,
          noteDate: active_date_time,
          // 有备注的话就显示支付方式，没有的话不显示。
          description: note ? (showPayType && payType ? `${payType}-${note}` : note) : note,
          flow: active_tab,
          id: isEdit ? editBill._id : ''
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: isEdit ? '😬修改成功' : '😉成功新增一笔账单',
              icon: 'none'
            })
            if (!isEdit && self.data.$.myTarget && !self.data.$.myTarget.showTip) {
              self.setData({
                showTargetTip: true,
                // eslint-disable-next-line no-mixed-operators
                targetTip: `${active_tab === 1 ? 'ヽ(✿ﾟ▽ﾟ)ノ' : '(ノへ￣、)'}离存钱目标${active_tab === 1 ? '前进' : '后退'}了${(transSum / self.data.$.myTarget.targetMoney * 100).toFixed(4)}%！`
              })
              setTimeout(() => {
                self.setData({
                  showTargetTip: false,
                  targetTip: ''
                })
              }, 3000)
            }
            self.resetStatus()
            self.triggerEvent('reFetchBillList')
            if (active_tab === 0) {
              // 本地记录用户记账高频分类
              const m = wx.getStorageSync('localCategory2155') || []
              const keys = m.map((item) => item._id)
              // 如果本地已有缓存
              const index = keys.indexOf(selectedCategory._id)
              if (index !== -1) {
                // eslint-disable-next-line no-plusplus
                m[index].pickTime = ++m[index].pickTime
              } else {
                // 如果没有
                m.push({
                  ...selectedCategory,
                  pickTime: 1
                })
              }
              // em.... 经过storage后的数据类型会从数值类型转为字符串类型
              wx.setStorageSync('localCategory2155', m.sort((a, b) => Number(b.pickTime) - Number(a.pickTime)))
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
          self.setRecentCate()
        }
      })
    },
    // tab.js调用
    dectiveEdit() {
      const { editBill, plainCategoryList } = this.store.data
      const matchCategory = plainCategoryList.find((item) => item._id === editBill.categoryId)
      this.setData({
        sum: editBill.money,
        note: editBill.description,
        active_tab: editBill.flow,
        selectedCategory: matchCategory,
        active_date: this.converDate(editBill.noteDate, false),
        active_date_time: editBill.noteDate
      })
    },
    resetStatus() {
      this.setData({
        sum: '',
        note: '',
        active_tab: 0,
        active_date: '今天',
        loadingCreate: false,
        selectedCategory: globalDefaultCategory
      })
      store.data.editBill = {}
      store.data.isEdit = false
    },
    bindDateChange(event) {
      this.setData({
        active_date_time: event.detail.value,
        active_date: this.converDate(event.detail.value, false)
      })
    },
    bindCateChange(event) {
      this.setData({
        selectedCategory: this.data.recentCate[event.detail.value]
      })
    },
    clickPig() {
      const self = this
      let { clickPigNum } = self.data
      wx.vibrateShort()
      if (clickPigNum <= 4) {
        // eslint-disable-next-line no-plusplus
        clickPigNum++
        const temp = ['！', '！！', '！！！', '！！！！', '！！！！！']
        wx.showToast({
          title: `你再点我${temp[clickPigNum - 1]}`,
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
        showPayTypeDialog: false,
        showAuthDialog: false
      })
      this.triggerEvent('hideTab', false)
    },
    // 获取订阅状态
    getUserSucscribeStatus() {
      wx.cloud.callFunction({
        name: 'checkSubscribe',
        data: {
          mode: 'get'
        },
        success(res) {
          if (res.result.code === 1) {
            subscribeStatus = res.result.data
          }
        }
      })
    },
    changeStatus(type) {
      const self = this
      wx.cloud.callFunction({
        name: 'checkSubscribe',
        data: {
          mode: 'post',
          type
        },
        success() { },
        complete() {
          self.getUserSucscribeStatus()
        }
      })
    },
    openSetting() {
      const self = this
      wx.openSetting({
        success() {
          self.setData(({
            showAuthDialog: false
          }))
        }
      })
    }
  }
})
