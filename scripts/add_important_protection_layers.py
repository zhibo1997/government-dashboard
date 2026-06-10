#!/usr/bin/env python3
"""
添加"重要防护目标"图层组及子图层到图层树
参考 docs/layer-tree-api.md
"""
import json
import base64
import subprocess
import urllib.request
import uuid

BASE_URL = "https://test.cityfun.com.cn"
FORM_ID = "7ae768d9-bc66-4aa9-b880-f1eb465aaa32"
VERSION_ID = "lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

# 子图层配置
LAYERS = [
    {"name": "妇幼保健院", "url": "http://webres.cityfun.com.cn/CSSMX/model/ZYFHMB/FYBJY/tileset.json"},
    {"name": "高铁站", "url": "http://webres.cityfun.com.cn/CSSMX/model/ZYFHMB/GTZ/tileset.json"},
    {"name": "市民之家", "url": "http://webres.cityfun.com.cn/CSSMX/model/ZYFHMB/SMZJ/tileset.json"},
    {"name": "图书馆", "url": "http://webres.cityfun.com.cn/CSSMX/model/ZYFHMB/TSG/tileset.json"},
    {"name": "兴国高级中学-光谷实验小学", "url": "http://webres.cityfun.com.cn/CSSMX/model/ZYFHMB/XGGJZX/tileset.json"},
]


def login():
    """登录获取 token"""
    resp = urllib.request.urlopen(f"{BASE_URL}/clapi/login/publicKey")
    pem = json.loads(resp.read())["data"]
    with open("/tmp/rsa_pub.pem", "w") as f:
        f.write(pem)
    result = subprocess.run(
        ["openssl", "rsautl", "-encrypt", "-pubin", "-inkey", "/tmp/rsa_pub.pem"],
        input=b"0000", capture_output=True
    )
    encrypted = base64.b64encode(result.stdout).decode()
    req = urllib.request.Request(
        f"{BASE_URL}/clapi/login",
        data=json.dumps({"account": "System", "password": encrypted}).encode(),
        headers={"Content-Type": "application/json"},
    )
    resp = urllib.request.urlopen(req)
    token = json.loads(resp.read())["data"]["token"]
    print(f"✅ 登录成功")
    return token


def add_node(token, name, node_type, parent_id, url=None, visible="1", sort_order=None):
    """新增图层节点"""
    cid = str(uuid.uuid4())
    data = {
        "9065732841756451007254": parent_id,
        "3182887691756451007254": name,
        "2905020861756451007254": node_type,
        "8609636141763654285967": None,
        "6524896091763654288819": visible,
        "8711262841765957236016": "1",
        "4235439331756451007254": url,
        "9651538181756451007254": None,
        "8743596791756451007254": sort_order,
        "d0e0cc10-a85c-4d8f-959b-49a4667a1bd0": cid,
        "undefined": cid,
    }
    body = {
        "schemeId": SCHEME_ID,
        "isUpdate": False,
        "pkeyValue": "",
        "data": json.dumps(data),
    }
    req = urllib.request.Request(
        f"{BASE_URL}/clapi/custmerform/data",
        data=json.dumps(body).encode(),
        headers={"token": token, "Content-Type": "application/json"},
    )
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print(f"  ✅ 新增节点: {name} (type={node_type}, id={cid})")
    return cid


def main():
    token = login()

    # 1. 新增顶层分组 "重要防护目标"
    print("\n📁 创建顶层分组...")
    group_id = add_node(token, "重要防护目标", "group", "0", visible="1")

    # 2. 新增子图层（3dtiles）
    print("\n📍 添加子图层...")
    for i, layer in enumerate(LAYERS):
        add_node(
            token,
            name=layer["name"],
            node_type="3dTile",
            parent_id=group_id,
            url=layer["url"],
            visible="1",
            sort_order=str(i + 1),
        )

    print(f"\n🎉 完成！已添加 '重要防护目标' 分组及 {len(LAYERS)} 个子图层")
    print(f"   分组 ID: {group_id}")


if __name__ == "__main__":
    main()
