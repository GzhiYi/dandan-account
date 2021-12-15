import { strip } from '../../util'

const { importStore } = getApp()
const { create, store } = importStore
let isNotifyReset = false
create.Page(store, {
  use: ['sysInfo.screenHeight', 'sysInfo.statusBarHeight'],
  data: {
    billList: null,
    isSearching: false,
    word: '',
    isFocus: true,
    keyword: '',
    isSearched: false
  },
  confirmTap() {
    const { keyword } = this.data
    const self = this
    if (!keyword || !keyword.trim()) return

    // 查询操作
    self.setData({
      isSearching: true,
      billList: []
    })
    wx.cloud.callFunction({
      name: 'search',
      data: {
        keyWord: keyword
      },
      success(res) {
        if (res.result.code === 1) {
          const billList = res.result.data
          let income = 0
          let pay = 0
          billList.forEach((bill) => {
            if (Number(bill.flow) === 0) pay += bill.money
            if (Number(bill.flow) === 1) income += bill.money
          })
          self.setData({
            billList,
            isSearched: true,
            word: `关键字 ${keyword} 搜索结果：收入共：${strip(income)}，支出共：${strip(pay)}`
          })
        }
      },
      fail() {
        getApp().showError('查询出错，要不稍后再试😢')
      },
      complete() {
        self.setData({
          isSearching: false
        })
      }
    })
  },
  onInputChange(event) {
    const { value } = event.detail
    const { word } = this.data
    // 做判断，如果输入文字并且还没搜索出结果就提示重置
    if (value && word !== '点猪重置输入哦～' && !isNotifyReset) {
      this.setData({
        word: '点猪重置输入哦～',
        isSearched: false
      })
      isNotifyReset = true
    }
    this.setData({
      keyword: value
    })
  },
  resetSearch() {
    this.setData({
      keyword: '',
      word: '',
      isFocus: true
    })
  }
})
