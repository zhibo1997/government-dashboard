#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图层树迁移：测试环境 → 正式环境

用法：
  # 1. 先 dry-run（只读测试环境，不写正式环境）
  python migrate-layer-tree.py --dry-run

  # 2. 确认无误后正式迁移（会清空正式环境旧图层树再写入）
  python migrate-layer-tree.py --yes
"""

import argparse
import base64
import json
import ssl
import sys
import uuid
import urllib.request
import urllib.error
from collections import deque

# ===== 配置 =====
TEST_BASE = "https://test.cityfun.com.cn/clapi"
PROD_BASE = "https://172.22.2.24/clapi"

TEST_ACCOUNT = "System"
TEST_PASSWORD = "0000"
PROD_ACCOUNT = "System"
PROD_PASSWORD = "0000"

# 表单配置（若正式环境不同请改这里）
FORM_ID = "7ae768d9-bc66-4aa9-b880-f1eb465aaa32"
VERSION_ID = "5d033651-a43a-46f4-9c01-57f21e2f9d93"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

# 域名替换
URL_REPLACEMENTS = {
    "http://webres.cityfun.com.cn/CSSMX/model/": "https://172.22.2.24/CSSMX/model/",
    "https://webres.cityfun.com.cn/CSSMX/model/": "https://172.22.2.24/CSSMX/model/",
    "http://webres.cityfun.com.cn/": "https://172.22.2.24/",
    "https://webres.cityfun.com.cn/": "https://172.22.2.24/",
}

# 字段映射
F_PARENT = "9065732841756451007254"
F_NAME = "3182887691756451007254"
F_TYPE = "2905020861756451007254"
F_EXPANDED = "8609636141763654285967"
F_VISIBLE = "6524896091763654288819"
F_COMMON = "8711262841765957236016"
F_URL = "4235439331756451007254"
F_OPACITY = "9651538181756451007254"
F_SORT = "8743596791756451007254"
F_ID = "d0e0cc10-a85c-4d8f-959b-49a4667a1bd0"

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def log(msg=""):
    print(msg, flush=True)


def http_json(url, method="GET", data=None, headers=None, timeout=30):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    body = None if data is None else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code} {url}: {err}") from e
    except Exception as e:
        raise RuntimeError(f"请求失败 {url}: {e}") from e


def encrypt_password(password, pem):
    try:
        from Crypto.PublicKey import RSA
        from Crypto.Cipher import PKCS1_v1_5

        key = RSA.import_key(pem)
        cipher = PKCS1_v1_5.new(key)
        return base64.b64encode(cipher.encrypt(password.encode("utf-8"))).decode()
    except Exception:
        pass

    try:
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.backends import default_backend

        key = serialization.load_pem_public_key(pem.encode("utf-8"), backend=default_backend())
        encrypted = key.encrypt(password.encode("utf-8"), padding.PKCS1v15())
        return base64.b64encode(encrypted).decode()
    except Exception as e:
        raise RuntimeError("无法加密密码，请先: pip install pycryptodome") from e


def login(base_url, account, password):
    res = http_json(f"{base_url}/login/publicKey")
    pem = res.get("data")
    if not pem:
        raise RuntimeError(f"获取公钥失败: {res}")
    encrypted = encrypt_password(password, pem)
    res = http_json(
        f"{base_url}/login",
        method="POST",
        data={"account": account, "password": encrypted},
    )
    token = (res.get("data") or {}).get("token")
    if not token:
        raise RuntimeError(f"登录失败: {res}")
    log(f"  登录成功: {base_url} token={token[:20]}...")
    return token


def query_layers(base_url, token):
    page_url = f"{base_url}/custmerform/data/page/{FORM_ID}/lastver_{VERSION_ID}"
    all_rows = []
    page = 1
    while True:
        res = http_json(
            page_url,
            method="POST",
            data={"queryJson": "{}", "paginationInputDto": {"keyword": "", "rows": 100, "page": page}},
            headers={"token": token},
        )
        rows = (res.get("data") or {}).get("rows") or []
        all_rows.extend(rows)
        log(f"  第{page}页: {len(rows)} 条")
        if len(rows) < 100:
            break
        page += 1
    return all_rows


def replace_url(url):
    if not url:
        return url
    for old, new in URL_REPLACEMENTS.items():
        url = url.replace(old, new)
    return url


def row_to_data(row, parent_id):
    # 尽量保留原 ID，便于前端配置/图层引用不变
    cid = row.get("id0") or str(uuid.uuid4())
    return {
        F_PARENT: parent_id,
        F_NAME: row.get("name0", ""),
        F_TYPE: row.get("type0", "group"),
        F_EXPANDED: row.get("expanded0"),
        F_VISIBLE: row.get("visible0", "1"),
        F_COMMON: row.get("common0"),
        F_URL: replace_url(row.get("url0", "")),
        F_OPACITY: row.get("opacity0"),
        F_SORT: row.get("sort_order0"),
        F_ID: cid,
        "undefined": cid,
    }


def add_layer(base_url, token, data):
    res = http_json(
        f"{base_url}/custmerform/data",
        method="POST",
        data={
            "schemeId": SCHEME_ID,
            "isUpdate": False,
            "pkeyValue": "",
            "data": json.dumps(data),
        },
        headers={"token": token},
    )
    return (res.get("data") or {}).get("id") or data.get(F_ID)


def delete_layer(base_url, token, layer_id):
    url = f"{base_url}/custmerform/data/lastver_{VERSION_ID}?keyValue={layer_id}"
    http_json(url, method="DELETE", headers={"token": token})


def clear_all_layers(base_url, token, rows):
    # 先删子节点再删父节点，避免依赖问题
    rows_sorted = sorted(rows, key=lambda r: 0 if r.get("parent_id0") not in (None, "0", 0) else 1)
    ok = 0
    fail = 0
    for row in rows_sorted:
        layer_id = row.get("id0")
        if not layer_id:
            continue
        try:
            delete_layer(base_url, token, layer_id)
            ok += 1
            log(f"  删除: {row.get('name0')} ({layer_id})")
        except Exception as e:
            fail += 1
            log(f"  删除失败: {row.get('name0')} ({layer_id}) -> {e}")
    log(f"  清空完成: 成功 {ok}, 失败 {fail}")


def print_preview(rows):
    log(f"\n测试环境共 {len(rows)} 条，预览（含 URL 替换）:")
    for r in rows:
        name = r.get("name0", "")
        typ = r.get("type0", "")
        old_url = r.get("url0") or ""
        new_url = replace_url(old_url)
        if old_url and old_url != new_url:
            log(f"  - [{typ}] {name}")
            log(f"      old: {old_url}")
            log(f"      new: {new_url}")
        else:
            log(f"  - [{typ}] {name} | {new_url[:80]}")


def migrate(dry_run=False, yes=False):
    log("=" * 60)
    log("图层树迁移：测试环境 → 正式环境")
    log(f"模式: {'DRY-RUN' if dry_run else '正式写入'}")
    log("=" * 60)

    log("\n[1/5] 登录测试环境...")
    test_token = login(TEST_BASE, TEST_ACCOUNT, TEST_PASSWORD)

    log("\n[2/5] 读取测试环境图层树...")
    test_rows = query_layers(TEST_BASE, test_token)
    log(f"  原始 {len(test_rows)} 条")

    # 过滤无效空记录
    valid_rows = []
    skipped = 0
    for r in test_rows:
        name = r.get("name0")
        typ = r.get("type0")
        rid = r.get("id0")
        if not rid or not name or not typ:
            skipped += 1
            continue
        valid_rows.append(r)
    test_rows = valid_rows
    log(f"  有效 {len(test_rows)} 条，跳过无效 {skipped} 条")

    if not test_rows:
        log("测试环境无有效数据，退出")
        return
    print_preview(test_rows)

    if dry_run:
        log("\nDRY-RUN 结束：未登录/写入正式环境")
        return

    if not yes:
        log("\n即将清空正式环境旧图层树并写入新数据。")
        ans = input("确认继续？输入 yes 继续: ").strip().lower()
        if ans != "yes":
            log("已取消")
            return

    log("\n[3/5] 登录正式环境...")
    prod_token = login(PROD_BASE, PROD_ACCOUNT, PROD_PASSWORD)

    log("\n[4/5] 清空正式环境旧数据...")
    prod_rows = query_layers(PROD_BASE, prod_token)
    if prod_rows:
        clear_all_layers(PROD_BASE, prod_token, prod_rows)
    else:
        log("  正式环境无旧数据")

    log("\n[5/5] 写入正式环境...")
    layers_by_parent = {}
    for row in test_rows:
        pid = str(row.get("parent_id0", "0") or "0")
        layers_by_parent.setdefault(pid, []).append(row)

    id_map = {}  # old_id -> new_id
    success = 0
    failed = 0
    queue = deque(["0"])

    while queue:
        parent_id = queue.popleft()
        children = layers_by_parent.get(parent_id, [])
        for row in children:
            old_id = row.get("id0")
            new_parent = "0" if parent_id == "0" else id_map.get(parent_id, parent_id)
            data = row_to_data(row, new_parent)
            try:
                new_id = add_layer(PROD_BASE, prod_token, data)
                id_map[old_id] = new_id
                success += 1
                log(f"  + [{row.get('type0')}] {row.get('name0')} -> {new_id}")
                queue.append(old_id)
            except Exception as e:
                failed += 1
                log(f"  x 新增失败 [{row.get('name0')}]: {e}")

    log("\n[校验] 再查正式环境...")
    final_rows = query_layers(PROD_BASE, prod_token)
    log(f"  正式环境当前 {len(final_rows)} 条")

    log("\n" + "=" * 60)
    log(f"迁移完成: 成功 {success}, 失败 {failed}")
    log("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="图层树迁移脚本")
    parser.add_argument("--dry-run", action="store_true", help="只读取测试环境并预览，不写正式环境")
    parser.add_argument("--yes", action="store_true", help="跳过确认，直接执行正式迁移")
    args = parser.parse_args()

    try:
        migrate(dry_run=args.dry_run, yes=args.yes)
    except Exception as e:
        log(f"\n失败: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
