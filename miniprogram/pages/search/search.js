Page({
  data: {
    billList: [],
    screenHeight: getApp().globalData.screenHeight,
    statusBarHeight: getApp().globalData.statusBarHeight
  },
  onLoad: function (options) {
    const bill = this.data.billList
    for(let i = 0; i < 100; i++) {
      bill.push({
        _id: i + 1,
        category: {
          categoryName: ''
        },
        description: '....',
        flow: 1,
        money: 100,
        note: 'this is fake note.'
      })
      this.setData({
        billList: bill
      })
    }
    this
  },
  onReady: function () {

  },
  onShow: function () {

  },
  confirmTap(event) {
    const { value } = event.detail
    if (!value) return

    // 查询操作
  }
})