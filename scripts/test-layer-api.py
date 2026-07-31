#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图层树 API 测试脚本（Windows 兼容）
用法：python test-layer-api.py
"""

import json
import sys
import ssl
import base64
import urllib.request
import urllib.error

print("=" * 50, flush=True)
print("图层树 API 测试", flush=True)
print("=" * 50, flush=True)

# ===== 配置：按实际环境修改 =====
BASE = "https://172.22.2.24/clapi"
ACCOUNT = "System"
PASSWORD = "0000"

FORM_ID = "7ae768d9-bc66-4aa9-b880-f1eb465aaa32"
VERSION_ID = "5d033651-a43a-46f4-9c01-57f21e2f9d93"
SCHEME_ID = "b72e3a83-cf4c-4c0f-9d13-ee040b0ce5e9"

# 忽略自签名证书
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def http_json(url, method="GET", data=None, headers=None, timeout=15):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code}: {err}") from e
    except Exception as e:
        raise RuntimeError(f"请求失败 {url}: {e}") from e


def encrypt_password(password, pem):
    """RSA 加密密码，优先 pycryptodome/cryptography，最后尝试 openssl"""
    # 1) pycryptodome
    try:
        from Crypto.PublicKey import RSA
        from Crypto.Cipher import PKCS1_v1_5

        key = RSA.import_key(pem)
        cipher = PKCS1_v1_5.new(key)
        return base64.b64encode(cipher.encrypt(password.encode("utf-8"))).decode()
    except Exception:
        pass

    # 2) cryptography
    try:
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.backends import default_backend

        key = serialization.load_pem_public_key(pem.encode("utf-8"), backend=default_backend())
        encrypted = key.encrypt(password.encode("utf-8"), padding.PKCS1v15())
        return base64.b64encode(encrypted).decode()
    except Exception:
        pass

    # 3) openssl 命令（Windows 上可能没有）
    try:
        import subprocess
        import tempfile
        import os

        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".pem") as f:
            f.write(pem)
            pem_path = f.name
        try:
            result = subprocess.run(
                ["openssl", "rsautl", "-encrypt", "-pubin", "-inkey", pem_path],
                input=password.encode("utf-8"),
                capture_output=True,
                check=False,
            )
            if result.returncode == 0 and result.stdout:
                return base64.b64encode(result.stdout).decode()
            raise RuntimeError(result.stderr.decode("utf-8", errors="ignore") or "openssl 失败")
        finally:
            os.unlink(pem_path)
    except Exception as e:
        raise RuntimeError(
            "无法加密密码。请安装: pip install pycryptodome\n"
            f"或安装 openssl 并加入 PATH。原始错误: {e}"
        ) from e


def login():
    print("\n[1] 获取公钥...", flush=True)
    res = http_json(f"{BASE}/login/publicKey")
    pem = res.get("data")
    if not pem:
        raise RuntimeError(f"公钥为空: {res}")
    print("  公钥 OK", flush=True)

    print("[2] 加密密码并登录...", flush=True)
    encrypted = encrypt_password(PASSWORD, pem)
    res = http_json(
        f"{BASE}/login",
        method="POST",
        data={"account": ACCOUNT, "password": encrypted},
    )
    token = (res.get("data") or {}).get("token")
    if not token:
        raise RuntimeError(f"登录失败: {res}")
    print(f"  登录成功, token: {token[:20]}...", flush=True)
    return token


def query(token, page=1):
    print(f"\n[3] 查询图层树 page={page}...", flush=True)
    url = f"{BASE}/custmerform/data/page/{FORM_ID}/lastver_{VERSION_ID}"
    res = http_json(
        url,
        method="POST",
        data={"queryJson": "{}", "paginationInputDto": {"keyword": "", "rows": 100, "page": page}},
        headers={"token": token},
    )
    rows = (res.get("data") or {}).get("rows") or []
    print(f"  共 {len(rows)} 条", flush=True)
    for r in rows[:30]:
        name = r.get("name0", "")
        typ = r.get("type0", "")
        url0 = (r.get("url0") or "")[:70]
        print(f"  - [{typ}] {name} | {url0}", flush=True)
    if len(rows) > 30:
        print(f"  ... 还有 {len(rows) - 30} 条", flush=True)
    return rows


def add_test(token):
    print("\n[4] 新增测试图层...", flush=True)
    import uuid

    cid = str(uuid.uuid4())
    data = {
        "9065732841756451007254": "0",
        "3182887691756451007254": "测试图层_DELETE",
        "2905020861756451007254": "group",
        "8609636141763654285967": None,
        "6524896091763654288819": "1",
        "8711262841765957236016": "1",
        "4235439331756451007254": "",
        "9651538181756451007254": None,
        "8743596791756451007254": None,
        "d0e0cc10-a85c-4d8f-959b-49a4667a1bd0": cid,
        "undefined": cid,
    }
    res = http_json(
        f"{BASE}/custmerform/data",
        method="POST",
        data={
            "schemeId": SCHEME_ID,
            "isUpdate": False,
            "pkeyValue": "",
            "data": json.dumps(data),
        },
        headers={"token": token},
    )
    new_id = (res.get("data") or {}).get("id", cid)
    print(f"  新增成功, ID: {new_id}", flush=True)
    print(f"  响应: {res}", flush=True)
    return new_id


def delete_test(token, layer_id):
    print(f"\n[5] 删除测试图层 {layer_id}...", flush=True)
    url = f"{BASE}/custmerform/data/lastver_{VERSION_ID}?keyValue={layer_id}"
    res = http_json(url, method="DELETE", headers={"token": token})
    print(f"  删除响应: {res}", flush=True)


def main():
    print(f"目标: {BASE}", flush=True)
    print(f"账号: {ACCOUNT}", flush=True)
    print(f"Python: {sys.version}", flush=True)

    try:
        token = login()
        query(token)
        new_id = add_test(token)
        query(token)
        delete_test(token, new_id)
        query(token)
        print("\n全部测试通过", flush=True)
    except Exception as e:
        print(f"\n失败: {e}", flush=True)
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
