let billType = 0
let shouldUpdateBill = false

Page({
  data: {
    categoryList: [],
    showAddDialog: false,
    addCategory: {}, // 要增加的父级分类
    addCategoryName: '',
    loadingAdd: false,
    loadingDelete: false,
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    billType = options.type
    self.getCategoryList(options.type)
  },
  getCategoryList(flow) {
    this.setData({
      categoryList: getApp().globalData.categoryList[`${flow === '0' ? 'pay' : 'income'}`]
    })
  },
  selectCategory(event) {
    const { category } = event.currentTarget.dataset
    getApp().globalData.selectedCategory = category
    wx.navigateBack()
  },
  showDialog(event) {
    const { target } = event.currentTarget.dataset
    this.setData({
      addCategory: target,
      showAddDialog: true
    })
  },
  showMenu(event) {
    const self = this
    const { category } = event.currentTarget.dataset
    self.setData({
      editItem: category,
      showMenuDialog: true
    })
  },
  closeDialog() {
    this.setData({
      showAddDialog: false,
      showMenuDialog: false,
      showConfirmDelete: false
    })
  },
  confirmAddCategory() {
    const self = this
    const { addCategoryName, addCategory } = self.data
    if (!addCategoryName) {
      wx.showToast({
        title: '未填写子分类名呀！',
        icon: 'none'
      })
      return falsee
    }
    self.setData({
      loadingAdd: true
    })
    wx.cloud.callFunction({
      name: 'category',
      data: {
        mode: 'add',
        categoryName: addCategoryName,
        categoryIcon: '',
        description: addCategoryName,
        flow: addCategory.flow,
        type: 1,
        parentId: addCategory._id,
        isSelectable: true
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '添加成功',
            icon: 'none'
          })
          let lastFlow = addCategory.flow
          self.setData({
            showAddDialog: false,
            addCategoryName: ''
          })
          self.getLatestCategory()
        }
      },
      complete() {
        self.setData({
          loadingAdd: false
        })
      }
    })
  },
  getLatestCategory() {
    const self = this
    getApp().getCategory()
    getApp().loadCategoryCallBack = list => {
      self.getCategoryList(billType)
    }
  },
  bindInput(event) {
    const { value } = event.detail
    this.setData({
      [`${event.currentTarget.dataset.name}`]: value
    })
  },
  deleteCategory() {
    const self = this
    const { editItem } = self.data
    wx.vibrateShort()
    if (!self.data.showConfirmDelete) {
      self.setData({
        showConfirmDelete: !self.data.showConfirmDelete
      })
    } else {
      self.setData({
        loadingDelete: true
      })
      wx.cloud.callFunction({
        name: 'category',
        data: {
          mode: 'deleteByIdAndFlow',
          id: editItem._id,
          flow: editItem.flow
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: '删除成功',
              icon: 'none'
            })
            self.closeDialog()
            shouldUpdateBill = true // 删除分类成功的话必须更新账单
            getApp().globalData.selectedCategory = null
            self.getLatestCategory()
          } else {
            wx.showToast({
              title: '删除失败，再试试？',
              icon: 'none'
            })
          }
        },
        fail() {
          wx.showToast({
            title: '删除失败，再试试？',
            icon: 'none'
          })
        },
        complete() {
          self.setData({
            loadingDelete: false
          })
        }
      })
    }
  },
  onUnload() {
    if (shouldUpdateBill) {
      try {
        getCurrentPages()[0].onReFetchBillList()
      }
      catch (err) {
        wx.showToast({
          title: '更新账单失败，可能要重启小程序哦。',
          icon: 'none'
        })
      }
    }
  }
})