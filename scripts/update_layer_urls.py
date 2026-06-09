#!/usr/bin/env python3
"""
图层树 URL 批量更新脚本
当域名变更时，批量替换图层树中所有资源链接的域名

用法:
  python3 update_layer_urls.py --old webres.cityfun.com.cn --new new-domain.com
  python3 update_layer_urls.py --old http://webres.cityfun.com.cn --new https://new-domain.com
  python3 update_layer_urls.py --old webres.cityfun.com.cn --new new-domain.com --dry-run
  python3 update_layer_urls.py --old webres.cityfun.com.cn --new new-domain.com --login-url https://test.cityfun.com.cn
"""

import argparse
import json
import base64
import subprocess
import ssl
import uuid
import sys
from urllib.request import Request, urlopen
from urllib.error import URLError


# ======================== 配置 ========================

BASE_URL = "https://test.cityfun.com.cn"
LOGIN_ACCOUNT = "System"
LOGIN_PASSWORD = "0000"

# 图层树表单参数
FORM_ID = "7ae768d9-bc66-4aa9-b880-f1eb465aaa32"
VERSION_ID = "lastver_5d033651-a43a-46f4-9c01-57f21e2f9d93"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

# data 字段 ID 映射
FIELD_URL = "4235439331756451007254"
FIELD_NAME = "3182887691756451007254"
FIELD_ID = "d0e0cc10-a85c-4d8f-959b-49a4667a1bd0"

# 忽略 SSL 证书验证
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


# ======================== 工具函数 ========================

def api_request(url, data=None, headers=None, method=None):
    """发送 HTTP 请求"""
    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, headers=headers or {}, method=method)
    resp = urlopen(req, context=SSL_CTX)
    return json.loads(resp.read())


def get_token(base_url):
    """登录获取 Token"""
    # 1. 获取公钥
    resp = api_request(f"{base_url}/clapi/login/publicKey")
    pem = resp["data"]

    # 2. RSA 加密密码
    with open("/tmp/_rsa_pub.pem", "w") as f:
        f.write(pem)
    result = subprocess.run(
        ["openssl", "rsautl", "-encrypt", "-pubin", "-inkey", "/tmp/_rsa_pub.pem"],
        input=LOGIN_PASSWORD.encode(), capture_output=True
    )
    encrypted = base64.b64encode(result.stdout).decode()

    # 3. 登录
    resp = api_request(
        f"{base_url}/clapi/login",
        data={"account": LOGIN_ACCOUNT, "password": encrypted},
        headers={"Content-Type": "application/json"}
    )
    token = resp["data"]["token"]
    print(f"✅ 登录成功")
    return token


def fetch_layers(base_url, token):
    """查询全部图层记录"""
    resp = api_request(
        f"{base_url}/clapi/custmerform/data/page/{FORM_ID}/{VERSION_ID}",
        data={"queryJson": "{}", "paginationInputDto": {"keyword": "", "rows": 200, "page": 1}},
        headers={"token": token, "Content-Type": "application/json"},
        method="POST"
    )
    rows = resp["data"]["rows"]
    print(f"✅ 查询到 {len(rows)} 条图层记录")
    return rows


def update_layer(base_url, token, record_id, data_dict):
    """更新单条图层记录"""
    body = {
        "schemeId": SCHEME_ID,
        "isUpdate": True,
        "pkeyValue": record_id,
        "data": json.dumps(data_dict)
    }
    resp = api_request(
        f"{base_url}/clapi/custmerform/data",
        data=body,
        headers={"token": token, "Content-Type": "application/json"},
        method="POST"
    )
    return resp


# ======================== 主逻辑 ========================

def main():
    parser = argparse.ArgumentParser(description="图层树 URL 批量域名替换")
    parser.add_argument("--old", required=True, help="旧域名，如 webres.cityfun.com.cn")
    parser.add_argument("--new", required=True, help="新域名，如 new-domain.com")
    parser.add_argument("--login-url", default=BASE_URL, help=f"登录地址 (默认: {BASE_URL})")
    parser.add_argument("--dry-run", action="store_true", help="只预览，不实际修改")
    args = parser.parse_args()

    old_domain = args.old
    new_domain = args.new
    base_url = args.login_url.rstrip("/")

    print(f"🔄 域名替换: {old_domain} → {new_domain}")
    print(f"📍 接口地址: {base_url}")
    if args.dry_run:
        print(f"🔍 模式: 预览 (dry-run)")
    print("-" * 60)

    # 1. 登录
    token = get_token(base_url)

    # 2. 查询图层
    layers = fetch_layers(base_url, token)

    # 3. 筛选需要替换的记录
    to_update = []
    for row in layers:
        url = row.get(FIELD_URL) or row.get("url0") or ""
        if old_domain in url:
            new_url = url.replace(old_domain, new_domain)
            to_update.append({
                "id": row.get(FIELD_ID) or row.get("id0"),
                "name": row.get(FIELD_NAME) or row.get("name0"),
                "old_url": url,
                "new_url": new_url,
            })

    if not to_update:
        print(f"✅ 没有找到包含 '{old_domain}' 的 URL，无需更新")
        return

    print(f"\n📋 需要更新 {len(to_update)} 条记录:\n")
    for i, item in enumerate(to_update, 1):
        print(f"  {i}. [{item['name']}]")
        print(f"     旧: {item['old_url']}")
        print(f"     新: {item['new_url']}")
        print()

    if args.dry_run:
        print(f"🔍 dry-run 模式，未实际修改。去掉 --dry-run 参数执行实际更新。")
        return

    # 4. 批量更新
    print(f"🚀 开始更新...\n")
    success, fail = 0, 0
    for item in to_update:
        try:
            # 构造更新数据，保留原有字段只替换 URL
            original = next(r for r in layers
                           if (r.get(FIELD_ID) or r.get("id0")) == item["id"])
            data = {}
            for key, val in original.items():
                if key.endswith("0") and key != "id0":
                    field_id = key.replace("0", "")
                    # 映射回字段 ID
                    field_map = {
                        "parent_id": "9065732841756451007254",
                        "name": "3182887691756451007254",
                        "type": "2905020861756451007254",
                        "expanded": "8609636141763654285967",
                        "visible": "6524896091763654288819",
                        "common": "8711262841765957236016",
                        "url": FIELD_URL,
                        "opacity": "9651538181756451007254",
                        "sort_order": "8743596791756451007254",
                    }
                    if field_id in field_map:
                        data[field_map[field_id]] = val

            # 替换 URL
            data[FIELD_URL] = item["new_url"]
            # 设置 ID
            data[FIELD_ID] = item["id"]
            data["undefined"] = item["id"]

            update_layer(base_url, token, item["id"], data)
            print(f"  ✅ {item['name']}")
            success += 1
        except Exception as e:
            print(f"  ❌ {item['name']}: {e}")
            fail += 1

    print(f"\n{'=' * 60}")
    print(f"📊 完成！成功: {success}, 失败: {fail}")


if __name__ == "__main__":
    main()
