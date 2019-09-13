# 访问
![扫码_搜索联合传播样式-标准色版.png](https://i.loli.net/2019/09/12/7L5QH9Pk2aODtJb.jpg)

`欢迎star && fork。`

# 函数文档

<details>

<summary>记账</summary>

### 新增一笔账单（函数名：account, mode: add）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| money|金钱, 限制到小数位后连点, 如100.00|是|
| categoryId|分类ID|是|
| noteDate|此记录的时间,具体到日期, 可用Date格式,格式: 2019-8-21|是|
| description|记录的描述|否|
| flow|金钱的流向, 0-支出, 1-收入|是|



### 修改一笔账单（函数名：account, mode: updateById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|
| money|金钱, 限制到小数位后连点, 如100.00|否|
| categoryId|分类ID|否|
| noteDate|此记录的时间,具体到日期, 可用Date格式,格式: 2019-8-21|是|| id|id|否|
| description|记录的描述|否|



### 删除一笔账单（函数名：account, mode: deleteById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|



### 获取一笔账单（函数名：account, mode: getNoteById）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| id|id|是|


### 根据菜单ID删除账单（函数名：account, mode: deleteByCategoryId）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| categoryId|菜单ID, categoryId|是|

</details>

<details>

<summary>获取分类列表</summary>

### 获取分类列表（函数名：getCategory）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| flow|金钱的流向, 0-支出, 1-收入|是|

</details>

<details>
<summary>获取记账记录列表(分页)</summary>

### 普通获取记账记录列表（函数名：getAccountList, mode: normal）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| page|当前页数, 大于等于1|是|
| limit|一次显示多少条, 大于0, 小于50|是|


### 普通获取记账记录列表（函数名：getAccountList, mode: getAccountListByTime）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| page|当前页数, 大于等于1|是|
| limit|一次显示多少条, 大于0, 小于50|是|
| startDate|开始时间|是|
| endDate|结束时间|是|





</details>


<details>

<summary>聚合记账数据</summary>

### 按开始时间与结束时间聚合金钱（函数名：accountAggregate, mode: aggregateAccountByDateRange）

| key| 说明 | 是否必填 |
| -------- | ----- | ---- |
| startDate|开始时间, 需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| endDate|结束时间,  需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|

### 根据FLOW流向详细聚合数据（函数名：accountAggregate, mode: aggregateAccountInDetail）

| key| 说明 | 是否必填 |
| -------- | ----- | ---- |
| startDate|开始时间, 需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| endDate|结束时间,  需要注意的是, 假如是2019-9-8日, 传入的格式必须是 ** 2019-09-08 **|是|
| flow|金钱流向|是|


</details>
