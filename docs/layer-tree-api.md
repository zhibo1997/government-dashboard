# 图层树管理 API 文档

基于 clmis 后台管理系统，接口路径 `/clapi/custmerform/data`

---

## 1. 登录获取 Token

```
GET  /clapi/login/publicKey          → RSA公钥
POST /clapi/login                    → {"account":"System","password":RSA加密密码}
返回: {"code":200, "data":{"token":"eyJ..."}}
```

后续所有请求 Header 带 `token: {token}`

---

## 2. 查询列表

```
POST /clapi/custmerform/data/page/{表单ID}/lastver_{版本ID}
Header: token: {token}
Content-Type: application/json

Body: {"queryJson":"{}","paginationInputDto":{"keyword":"","rows":100,"page":1}}
```

当前图层树：
- 表单ID: `7ae768d9-bc66-4aa9-b880-f1eb465aaa32`
- 版本ID: `lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93`

**返回字段（flat 格式）:**

| 字段 | 含义 |
|------|------|
| `id0` | 记录 ID |
| `name0` | 图层名称 |
| `parent_id0` | 父节点 ID（`0` = 顶层） |
| `type0` | `group` / `3dTile` / `mvt` / `specialLayer` |
| `url0` | 资源地址 |
| `visible0` | 可见性 |
| `common0` | 是否常用 |
| `expanded0` | 是否展开 |
| `sort_order0` | 排序 |
| `opacity0` | 透明度 |

---

## 3. 新增

```
POST /clapi/custmerform/data
Header: token: {token}
Content-Type: application/json

{
  "schemeId": "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9",
  "isUpdate": false,
  "pkeyValue": "",
  "data": "{字段JSON字符串}"
}
```

**data 字段映射:**

| 字段 ID | 含义 |
|---------|------|
| `9065732841756451007254` | parent_id |
| `3182887691756451007254` | name |
| `2905020861756451007254` | type |
| `8609636141763654285967` | expanded |
| `6524896091763654288819` | visible |
| `8711262841765957236016` | common |
| `4235439331756451007254` | url |
| `9651538181756451007254` | opacity |
| `8743596791756451007254` | sort_order |
| `d0e0cc10-a85c-4d8f-959b-49a4667a1bd0` | id（自生成UUID） |
| `undefined` | id（同上） |

---

## 4. 修改

```
POST /clapi/custmerform/data
Header: token: {token}

{
  "schemeId": "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9",
  "isUpdate": true,
  "pkeyValue": "要修改的记录ID",
  "data": "{字段JSON字符串}"
}
```

---

## 5. 删除

```
DELETE /clapi/custmerform/data/lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93?keyValue={记录ID}
Header: token: {token}
```

---

## 6. Python 完整示例

```python
import json, base64, subprocess, urllib.request, uuid

# --- 登录 ---
resp = urllib.request.urlopen('https://test.cityfun.com.cn/clapi/login/publicKey')
pem = json.loads(resp.read())['data']
with open('/tmp/rsa_pub.pem', 'w') as f:
    f.write(pem)
result = subprocess.run(['openssl', 'rsautl', '-encrypt', '-pubin', '-inkey', '/tmp/rsa_pub.pem'],
    input=b'0000', capture_output=True)
encrypted = base64.b64encode(result.stdout).decode()
req = urllib.request.Request('https://test.cityfun.com.cn/clapi/login',
    data=json.dumps({"account": "System", "password": encrypted}).encode(),
    headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())['data']['token']

# --- 查询列表 ---
body = json.dumps({"queryJson":"{}","paginationInputDto":{"keyword":"","rows":100,"page":1}}).encode()
req = urllib.request.Request(
    'https://test.cityfun.com.cn/clapi/custmerform/data/page/7ae768d9-bc66-4aa9-b880-f1eb465aaa32/lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93',
    data=body, headers={'token': token, 'Content-Type': 'application/json'}, method='POST')
resp = urllib.request.urlopen(req)
rows = json.loads(resp.read())['data']['rows']

# --- 新增 ---
cid = str(uuid.uuid4())
data = {
    "9065732841756451007254": "父节点ID或0",
    "3182887691756451007254": "图层名称",
    "2905020861756451007254": "3dTile",
    "8609636141763654285967": None,
    "6524896091763654288819": "1",
    "8711262841765957236016": "1",
    "4235439331756451007254": "http://...tileset.json",
    "9651538181756451007254": None,
    "8743596791756451007254": None,
    "d0e0cc10-a85c-4d8f-959b-49a4667a1bd0": cid,
    "undefined": cid,
}
body = {
    "schemeId": "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9",
    "isUpdate": False,
    "pkeyValue": "",
    "data": json.dumps(data)
}
req = urllib.request.Request('https://test.cityfun.com.cn/clapi/custmerform/data',
    data=json.dumps(body).encode(),
    headers={'token': token, 'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
print(json.loads(resp.read()))

# --- 修改 ---
data['3182887691756451007254'] = '新名称'
body = {
    "schemeId": "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9",
    "isUpdate": True,
    "pkeyValue": "要修改的记录ID",
    "data": json.dumps(data)
}
req = urllib.request.Request('https://test.cityfun.com.cn/clapi/custmerform/data',
    data=json.dumps(body).encode(),
    headers={'token': token, 'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
print(json.loads(resp.read()))

# --- 删除 ---
req = urllib.request.Request(
    'https://test.cityfun.com.cn/clapi/custmerform/data/lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93?keyValue=记录ID',
    method='DELETE', headers={'token': token})
resp = urllib.request.urlopen(req)
print(json.loads(resp.read()))
```

---

## 7. 现有图层树结构

### 顶层分组 (parent=0)

| 名称 | ID | 类型 |
|------|----|------|
| 桥梁专项 | `87bc3fec-18c3-46e8-93d9-952b68472bbf` | group |
| 燃气专项 | `9821ec73-3e97-4a72-a205-ae7e5c269ff3` | group |
| 排水专项 | `1da95417-72e8-4c74-a85c-642918bdcba7` | group |
| 三维模型 | `ea50e3a5-d465-4319-9f80-aa6fef99693b` | group |
| 监测设备 | `9f686624-fa76-4ab4-9462-774e27e3513d` | group |
| 重要防护目标 | `3622fe5a-017b-4f06-bcf4-ff66fca721fd` | group |

### 重要防护目标
| 名称 | 类型 | ID |
|------|------|----|
| 妇幼保健院 | 3dTile | `e22672a8-d9d6-44bb-a53d-3ce98f1a4605` |
| 高铁站 | 3dTile | `2f29c301-11b9-4010-b5cc-f0276a113f96` |
| 市民之家 | 3dTile | `d6b9761b-5420-4197-8099-70931f259701` |
| 图书馆 | 3dTile | `3912cb5a-2263-4637-8a61-1b39c4f3390d` |
| 兴国高级中学-光谷实验小学 | 3dTile | `1bcd4b91-f2b1-4a73-a678-b3e23381f5b4` |

### 桥梁专项
| 名称 | 类型 | ID |
|------|------|----|
| 桥梁 | mvt | `9e38a8e2-273e-4f9f-a237-8a0b4a0b1d14` |
| 桥梁监测点 | mvt | `82485376-309d-421d-81f9-ed0d48812738` |

### 燃气专项
| 名称 | 类型 | ID |
|------|------|----|
| 燃气井盖 | mvt | `1b30d4d8-fd3c-4b21-86ab-f534e333a3c3` |
| 燃气监测点 | mvt | `516c2d5a-f582-4d6f-aab5-bd81a2cded2e` |
| 燃气中压管道 | 3dTile | `f155d789-ffa5-4a71-a49a-0c12381bfc61` |
| 燃气接头 | 3dTile | `3d950e5e-967a-41cb-81bd-71d195ad7576` |
| 燃气井 | 3dTile | `a0a68eaf-a734-4bbf-a3da-766e31bf9eae` |
| 燃气可燃气体检测设备 | 3dTile | `389bf6c1-16bd-4ec3-a7c6-7e2e0cc0e4fa` |
| 管道施工监测仪 | 3dTile | `88cdddbb-2f7f-48e0-a49e-d6a3730f8b3d` |

### 排水专项
| 名称 | 类型 | ID |
|------|------|----|
| 圆形井盖 | 3dTile | `d5e7265b-bd14-420b-a2dc-d25a948f5b63` |
| 圆形管线 | 3dTile | `815800c5-3ed7-47ea-b1e3-77553cbdb25d` |
| 方形管线 | 3dTile | `ec360d09-8bb6-4d09-adb5-224f29ea63d4` |

### 三维模型
| 名称 | 类型 | ID |
|------|------|----|
| 陵园大道立交桥 | 3dTile | `919829ed-9c4d-43ae-9a94-1ff0cef22a3f` |
| 明月湾大桥 | 3dTile | `ecb4e7b6-6a2e-4948-85b0-0c5975816e07` |
| 独山湖大桥 | 3dTile | `b4cc6305-bfce-4f60-926c-0dff3e7a7a78` |
| 莲花湖大桥设备 | 3dTile | `ad960df4-4bd4-414c-a69c-6257d86982b2` |
| 陵园大道立交桥监测设备 | 3dTile | `aa50cee7-c4f6-4315-bcb1-f89aea7c00c0` |
| 独山湖大桥设备 | 3dTile | `430c03ed-dce2-463a-8ce0-02b310b2685c` |
| 陵园大道立交桥设备 | 3dTile | `a046b72f-e018-49db-b6a8-7bd4b91c21cb` |
| 明月湾大桥设备 | 3dTile | `19e96888-190a-45fa-bcc1-c8f90ed6765a` |

### 监测设备
| 名称 | 类型 | ID |
|------|------|----|
| 桥梁监测 | group | `232015f8-829c-4fa5-acd6-47bf1b6eb18d` |
| 燃气监测 | group | `ad424d51-7db7-4625-b3cd-5bfe3650bda0` |
| 应变传感器 | specialLayer | `d1a3b927-7a8e-4185-97e6-9277767295a0` |
| 裂缝计 | specialLayer | `5ff936f3-b303-4d00-acb0-9eb2d28e97e6` |
| 可燃气体智能监测仪 | specialLayer | `e137a3b6-4a18-44fe-88fd-f6f2019c940b` |
