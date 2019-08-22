// pages/category/category.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    billType: 0,
    categoryList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const self = this
    self.setData({
      billType: options.type
    })
    self.getCategoryList(options.type)
  },
  getCategoryList(flow) {
    const self = this
    wx.cloud.callFunction({
      name: 'getCategory',
      data: {
        flow: flow
      },
      success(res) {
        const r = res.result
        if (r.code === 1) {
          let categoryList = []
          r.data.data.forEach(item => {
            if (!item.parentId) {
              item.children = []
              categoryList.push(item)
            }
          })
          if (categoryList.length > 0) {
            categoryList.forEach(item => {
              r.data.data.forEach(one => {
                if (item._id === one.parentId) {
                  item.children.push(one)
                }
              })
            })
          }
          self.setData({
            categoryList
          })
        }
      }
    })
  },
})