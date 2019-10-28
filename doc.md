> 不记录任何用户身份信息；专注记账的目的；账单清晰自然，报表易懂易分析；助你理财之路轻松有意义，小程序【单单记账】。

## 导语

最近发觉自己有记账的需求，想知道自己的钱花在哪了。试用了很多的记账app还有小程序，发现很多都偏离了记账的初衷，而且都会把个人数据存在服务器上，我觉得不放心。
那怎么办？小程序不是支持IOS和安卓端吗？还有不是有云开发服务支持吗？等等，小程序类目也很支持记账这个类目。所以，赶紧动手！

## 界面展示

![cover3.png](https://i.loli.net/2019/10/10/MG8b9rKIdsnFm4c.png)

![cover1.png](https://i.loli.net/2019/10/10/Bem9OGzp8KAgaIS.png)

![cover2.png](https://i.loli.net/2019/10/10/Y7Cmsu3BDvn6F2P.png)

## 页面结构

整个小程序主要的页面结构有：

1. 主页（中间页面）：记账功能，可以很快速的记下一笔账。
2. 历史账单页（左边页面）：查看当天或者任意一天/日期范围内的账单。
3. 图表分析页（右边页面）：查看当月消费图表，便于查看当月或者某个月的收支情况。

## 云开发数据库设计

由于完全不获取用户微信个人信息，所以不需要用到用户表，统一用云开发天然鉴权获取的openId。

目前用到的表有两个：

### 账单表

记录账单的信息。包含的字段有：

- _id:随机生成的账单唯一ID
- categoryId: 对应的分类id
- createTime: 账单的创建时间
- description: 一笔账单的描述
- flow: 0支出，1收入
- isDel: 逻辑删除的标识符
- money: 涉及的金钱数
- noteDate: 记账的时间
- openId: 绑定的用户唯一openId
- updateTime: 账单的更新时间

### 分类表

关联用户创建账单的分类。包含的字段有：
- _id:随机生成的账单唯一ID
- categoryIcon:分类的图标图片
- categoryName:分类名
- createTime: 创建时间
- description: 分类的描述
- flow: 0支出，1收入
- isDel:逻辑删除的标示符
- openId: 绑定的用户唯一openId
- parentId: 父分类的id，如果是父分类，则为空
- type: 0支出，1收入

### 云函数和前端的部分实现

1. 记账页
![cover3.png](https://i.loli.net/2019/10/10/MG8b9rKIdsnFm4c.png)
记账页面是这个记账小程序核心的数据写入页面。也就是写入账单表的页面。保留最基本也是最普遍选择的一些选项，有金额、分类、日期、备注。不需要记录太多的其余数据，事实上，对一个纯记账的工具而言，这些数据足以表现和记录记账。恰恰是足够简洁明了，才能让用户专注记账。

通过调用云函数向账单表数据插入数据：
```javascript
wx.cloud.callFunction({
  name: 'account', // 定义的云函数名
  data: {
    mode: isEdit ? 'updateById' : 'add', // 对于同一个业务对象下的云函数，我通过mode进行区分，减少云函数的个数
    money: sum, // 钱数，无论正负都去正值
    categoryId: selectedCategory._id, // 选择的分类id
    noteDate: active_date_time, // 记账的时间
    description: note, // 记账的备注
    flow: active_tab, // 0支出，1收入
    id: isEdit ? editBill._id : '' // 编辑或者新增
  },
  success(res) {
    if (res.result.code === 1) { // 操作成功后续的操作，最要是更新账单列表和报表数据
      wx.showToast({
        title: isEdit ? '😬修改成功' : '😉成功新增一笔账单',
        icon: 'none'
      })
      self.setData({
        selectedCategory: globalDefaultCategory
      })
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
```

2. 记账记录页
为了更好的体现每天的记账情况，觉得通过日历的方式呈现所选择的某天的记账情况。
![cover2.png](https://i.loli.net/2019/10/10/Y7Cmsu3BDvn6F2P.png)
编写一个日历组件，由于组件的代码量多，就不贴出来，就主要呈现下选择某一天后所调用的云函数，从而看出如何获取到记账数据的。
```javascript
// 计算总数
const totalCount = await db.collection("DANDAN_NOTE")
  .where(basicWhere).count();

// 开始查询
const res = await db.collection("DANDAN_NOTE")
  .where(basicWhere)
  .skip(offset)
  .limit(limit)
  .orderBy("createTime", "desc")
  .get();

// 遍历结果, 获得对应的分类ID, 并且用分类ID获取对应的分类信息
if (categoryInfoMap.size <= 0) {
  const cidList = [];
  for (let note of res.data) {
    cidList.push(note.categoryId)
  }

  const cResult = await cloud.callFunction({
    name: 'category',
    data: {
      mode: 'getCategoriesByIdBatch',
      ids: cidList
    }
  })

  if (cResult.result.code === 1) {
    for (category of cResult.result.data.data) {
      categoryInfoMap.set(category._id, category)
    }
  }
}
```

3. 报表页面
![cover1.png](https://i.loli.net/2019/10/10/Bem9OGzp8KAgaIS.png)
