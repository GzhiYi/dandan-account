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
- _id:
- categoryIcon:
- categoryName: 
- createTime: 
- description:
- flow:
- isDel:
- isSelectable:
- openId: 
- parentId: 
- type: 
