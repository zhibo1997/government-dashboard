#!/usr/bin/env python3
"""
添加"供水专项"图层组及子图层(供水管线、供水井盖)到图层树
参考 docs/layer-tree-api.md
"""
import json
import base64
import subprocess
import urllib.request
import uuid

BASE_URL = "http://119.100.22.131:8081"
FORM_ID = "7ae768d9-bc66-4aa9-b880-f1eb465aaa32"
VERSION_ID = "lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

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
    print(f"  ✅ 新增节点: {name} (type={node_type}, id={cid}) result={result.get('code')}")
    return cid

if __name__ == "__main__":
    token = login()

    print("\n📁 1. 创建顶层分组 [供水专项]...")
    group_id = add_node(token, "供水专项", "group", "0", visible="1", sort_order="7")
    print(f"供水专项 Group ID: {group_id}")

    print("\n📍 2. 添加子图层 [供水管线]...")
    pipeline_id = add_node(
        token,
        name="供水管线",
        node_type="mvt",
        parent_id=group_id,
        url="http://119.100.22.131:8081/CSSMX/CSSMX_ZT/gspsp_dtrans_pubunderpipeline_gs.json",
        visible="1",
        sort_order="1"
    )
    print(f"供水管线 Layer ID: {pipeline_id}")

    print("\n📍 3. 添加子图层 [供水井盖]...")
    manhole_id = add_node(
        token,
        name="供水井盖",
        node_type="mvt",
        parent_id=group_id,
        url="http://119.100.22.131:8081/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo_gs.json",
        visible="1",
        sort_order="2"
    )
    print(f"供水井盖 Layer ID: {manhole_id}")
