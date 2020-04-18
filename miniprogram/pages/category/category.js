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
    showConfirmDelete: false,
    showBannerDialog: false,
    word: '',
    loadingSetting: false,
    localCategory: [],
    isEdit: false,
    wordExpired: null,
    bannerurl: '',
    bannerExpired: null,
    loadingBannerUrl: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const self = this
    billType = options.type
    self.getCategoryList(options.type)
    if (Number(options.type) === 0) {
      self.setData({
        localCategory: wx.getStorageSync('localCategory').slice(0, 8),
      })
    }
  },
  getCategoryList(flow) {
    this.setData({
      categoryList: getApp().globalData.categoryList[`${flow === '0' ? 'pay' : 'income'}`],
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
      showAddDialog: true,
    })
  },
  showMenu(event) {
    const self = this
    const { category } = event.currentTarget.dataset
    self.setData({
      editItem: category,
      showMenuDialog: true,
    })
  },
  closeDialog() {
    this.setData({
      showAddDialog: false,
      showMenuDialog: false,
      showConfirmDelete: false,
      showBannerDialog: false,
    })
  },
  confirmAddCategory() {
    const self = this
    const { addCategoryName, addCategory } = self.data
    if (!addCategoryName) {
      wx.showToast({
        title: '未填写子分类名呀！',
        icon: 'none',
      })
      return false
    }
    self.setData({
      loadingAdd: true,
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
        isSelectable: true,
      },
      success(res) {
        if (res.result.code === 1) {
          wx.showToast({
            title: '添加成功',
            icon: 'none',
          })
          self.setData({
            showAddDialog: false,
            addCategoryName: '',
          })
          self.getLatestCategory()
        }
      },
      complete() {
        self.setData({
          loadingAdd: false,
        })
      },
    })
  },
  getLatestCategory() {
    const self = this
    getApp().getCategory()
    getApp().loadCategoryCallBack = () => {
      self.getCategoryList(billType)
    }
  },
  bindInput(event) {
    const { value } = event.detail
    this.setData({
      [`${event.currentTarget.dataset.name}`]: value,
    })
  },
  deleteCategory() {
    const self = this
    const { editItem } = self.data
    wx.vibrateShort()
    if (!self.data.showConfirmDelete) {
      self.setData({
        showConfirmDelete: !self.data.showConfirmDelete,
      })
    } else {
      self.setData({
        loadingDelete: true,
      })
      wx.cloud.callFunction({
        name: 'category',
        data: {
          mode: 'deleteByIdAndFlow',
          id: editItem._id,
          flow: editItem.flow,
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: '删除成功',
              icon: 'none',
            })
            self.closeDialog()
            shouldUpdateBill = true // 删除分类成功的话必须更新账单
            getApp().globalData.selectedCategory = null
            self.getLatestCategory()
          } else {
            wx.showToast({
              title: '删除失败，再试试？',
              icon: 'none',
            })
          }
        },
        fail() {
          wx.showToast({
            title: '删除失败，再试试？',
            icon: 'none',
          })
        },
        complete() {
          self.setData({
            loadingDelete: false,
          })
        },
      })
    }
  },
  onShowBanner() {
    const self = this
    self.setData({
      showBannerDialog: true,
    })
  },
  onUnload() {
    if (shouldUpdateBill) {
      try {
        getCurrentPages()[0].onReFetchBillList()
      } catch (err) {
        wx.showToast({
          title: '更新账单失败，可能要重启小程序哦。',
          icon: 'none',
        })
      }
    }
  },
  confirmUpdateBanner() {
    const self = this
    const { word, wordExpired } = this.data
    if (!word) {
      wx.showToast({
        title: '未填写话术',
        icon: 'none',
      })
      return
    }
    self.setData({
      loadingSetting: true,
    })
    wx.cloud.callFunction({
      name: 'word',
      data: {
        mode: 'update',
        word,
        expire: wordExpired ? new Date(wordExpired.replace(/-/g, '/')).getTime() : +new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      },
      success(res) {
        if (res.result.code === 1) {
          self.closeDialog()
          self.setData({
            word: '',
          })
          wx.showToast({
            title: '设置成功',
            icon: 'none',
          })
          getCurrentPages()[0].onGetNewWord()
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none',
          })
        }
      },
      fail() {
        wx.showToast({
          title: '操作失败',
          icon: 'none',
        })
      },
      complete() {
        self.setData({
          loadingSetting: false,
        })
      },
    })
  },
  confirmUpdateBannerUrl() {
    const self = this
    const { bannerurl, bannerExpired } = this.data
    self.setData({
      loadingBannerUrl: true,
    })
    wx.cloud.callFunction({
      name: 'word',
      data: {
        mode: 'updateBannerUrl',
        bannerurl,
        urlExpire: bannerExpired ? new Date(bannerExpired.replace(/-/g, '/')).getTime() : +new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
      },
      success(res) {
        if (res.result.code === 1) {
          self.closeDialog()
          self.setData({
            bannerurl: '',
          })
          wx.showToast({
            title: '设置成功',
            icon: 'none',
          })
          getCurrentPages()[0].onGetNewWord()
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none',
          })
        }
      },
      fail() {
        wx.showToast({
          title: '操作失败',
          icon: 'none',
        })
      },
      complete() {
        self.setData({
          loadingBannerUrl: false,
        })
      },
    })
  },
  changeEdit() {
    const { isEdit } = this.data
    wx.vibrateShort()
    this.setData({
      isEdit: !isEdit,
    })
  },
  bindWordDateChange(event) {
    this.setData({
      wordExpired: event.detail.value,
    })
  },
  bindUrlDateChange(event) {
    this.setData({
      bannerExpired: event.detail.value,
    })
  },
})
