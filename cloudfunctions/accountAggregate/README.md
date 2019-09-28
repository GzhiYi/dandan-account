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

### 根据FLOW流向详细聚合数据（函数名：accountAggregate, mode: aggregateAccountInDetail）

| key| 说明 | 是否必填 |
| -------- | ----- | ---- |
| startDate|开始时间, 需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| endDate|结束时间,  需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| flow|金钱流向|是|

---
返回格式:

```
成功
{
    code: 1,
    detailResult: [
        {
            allSum: 152, // 当前菜单的账单的总额
            count: 152, // 当前菜单的账单的条数
            fatherCategoryId: "others",  // 当前菜单的菜单ID
            fatherCategoryName: "杂项", // 当前菜单的菜单名字
            sonCategories: ["others_sub", "a_cid", "b_cid"] // 当前菜单所包含的子菜单ID
        }
    ]
}


失败
{
    code: 0
}
```


---