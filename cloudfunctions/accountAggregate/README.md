### 聚合记账数据
---

### 按开始时间与结束时间聚合金钱（函数名：accountAggregate, mode: aggregateAccountByDateRange）

| key| 说明 | 是否必填 |
| -------- | ----- | ---- |
| startDate|开始时间, 需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| endDate|结束时间,  需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|

---
返回格式:

```
成功
{
    code: 1,
    sumResult: [
        {
            _id: 0, // _id代表flow
            allSum: 147,    // 当前flow账单总金钱
            count: 147  // 当前flow账单条数
        },
        {
            _id: 0,
            allSum: 248,
            count: 248
        }
    ]
}


失败
{
    code: 0
}
```


---

### 获取饼图数据, mode: getPieChartData）

| key| 说明 | 是否必填 |
| -------- | ----- | ---- |
| startDate|开始时间, 需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| endDate|结束时间,  需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|

---
返回格式:

```
成功
{
    code: 1,
    detailResult: {
        flowIn: {   // 流入
            allSum: 100,    // 流入总金额
            dataList: [
                {
                    categoryId: "others",
                    categoryName: "杂项",
                    allSum: 50,
                    flow: 1
                },
                {
                    categoryId: "b_others",
                    categoryName: "另一个杂项",
                    allSum: 50,
                    flow: 1
                },
            ]
        },
        flowOut: {  // 流出
            allSum: 30,    // 流出总金额
            dataList: [
                {
                    categoryId: "out1",
                    categoryName: "流出1",
                    allSum: 10,
                    flow: 0
                },
                {
                    categoryId: "out2",
                    categoryName: "流出1",
                    allSum: 20,
                    flow: 0
                },
            ]
        }
    }
}


失败
{
    code: 0
}
```


---