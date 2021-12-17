export default {
  data: {
    sysInfo: {},
    categoryList: [],
    defaultCategoryList: [],
    myTarget: {},
    myGroup: {},
    plainCategoryList: [],
    selectedCategory: '', // 选择的分类
    mapCategoryName: {},
    currentMonthData: {},
    loadingRightIcon: false,
    pickDateListSumResult: [0, 0],
    editBill: {}
  },
  // 无脑全部更新，组件或页面不需要声明 use
  // updateAll: true,
  debug: true,
}
