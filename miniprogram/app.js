//app.js
const Flow = {
  pay: 0,
  income: 1
}
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 获取手机信息以配置顶栏
    wx.getSystemInfo({
      success: res => {
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = 44 + res.statusBarHeight
        this.globalData.screenWidth = res.screenWidth
      }
    })
    // 分类应当全局优先获取
    this.getCategory()
  },
  globalData: {
    statusBarHeight: 0,
    navBarHeight: 0,
    screenWidth: 0,
    categoryList: {},
    selectedCategory: ''
  },
  getCategory() {
    console.log('go fetch category')
    const self = this
    let categoryList = {}
    wx.cloud.callFunction({
      name: 'getCategory',
      data: {},
      success(res) {
        console.log("1", res)
        if (res.result.code === 1) {
          const list = res.result.data
          console.log(list)
          // 分离出支出和收入的分类列表
          categoryList['pay'] = list.filter(item => item.flow === Flow.pay)
          categoryList['income'] = list.filter(item => item.flow === Flow.income)
          self.globalData.categoryList = categoryList
        }
      }
    })
  },
  showLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.showLoading()
  },
  hideLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.hideLoading()
  }
})
