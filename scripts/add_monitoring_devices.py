#!/usr/bin/env python3
"""
添加桥梁监测设备类型到图层树
在"桥梁监测"分组下添加 specialLayer 类型的设备节点
"""
import json, base64, subprocess, urllib.request, uuid

BASE_URL = "https://test.cityfun.com.cn"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

# 桥梁监测分组 ID
BRIDGE_MONITORING_GROUP_ID = "232015f8-829c-4fa5-acd6-47bf1b6eb18d"

# 设备类型列表
DEVICE_TYPES = [
    {"name": "温度传感器", "sblx": "jcsblx0501"},
    {"name": "应变传感器", "sblx": "jcsblx0502"},
    {"name": "加速度传感器", "sblx": "jcsblx0503"},
    {"name": "索力计", "sblx": "jcsblx0504"},
    {"name": "倾角计", "sblx": "jcsblx0505"},
    {"name": "拉线位移计", "sblx": "jcsblx0506"},
    {"name": "GNSS", "sblx": "jcsblx0507"},
    {"name": "静力水准仪", "sblx": "jcsblx0508"},
    {"name": "非接触式挠度仪", "sblx": "jcsblx0509"},
    {"name": "裂缝计", "sblx": "jcsblx0510"},
    {"name": "湿度计", "sblx": "jcsblx0511"},
    {"name": "风速风向仪", "sblx": "jcsblx0512"},
    {"name": "桥梁环境", "sblx": "jcsblx0513"},
]


def login():
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
    print("✅ 登录成功")
    return token


def add_node(token, name, node_type, parent_id, url=None, sort_order=None):
    cid = str(uuid.uuid4())
    data = {
        "9065732841756451007254": parent_id,
        "3182887691756451007254": name,
        "2905020861756451007254": node_type,
        "8609636141763654285967": None,
        "6524896091763654288819": "1",
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
    print(f"  ✅ {name} ({node_type}, url={url})")
    return cid


def main():
    token = login()

    print(f"\n📍 在'桥梁监测'分组下添加 {len(DEVICE_TYPES)} 个设备类型...")
    for i, device in enumerate(DEVICE_TYPES):
        add_node(
            token,
            name=device["name"],
            node_type="specialLayer",
            parent_id=BRIDGE_MONITORING_GROUP_ID,
            url=device["sblx"],
            sort_order=str(i + 1),
        )

    print(f"\n🎉 完成！已添加 {len(DEVICE_TYPES)} 个监测设备类型")


if __name__ == "__main__":
    main()
