import json
import subprocess
import urllib.error
import urllib.request


BASE = "http://127.0.0.1:8080"
DEFAULT_PW = "123456"


def mysql_users():
    # id, phone, name
    cmd = [
        "mysql",
        "-uroot",
        "-peplugger",
        "-D",
        "eplugger",
        "-e",
        "SELECT id, phone, name FROM user ORDER BY id;",
    ]
    out = subprocess.check_output(cmd, text=True, encoding="utf-8", errors="ignore")
    lines = [ln for ln in out.splitlines() if ln.strip()]

    # find header line
    header_idx = 0
    for i, ln in enumerate(lines):
        if ln.lower().startswith("id") and "phone" in ln.lower():
            header_idx = i
            break
    data_lines = lines[header_idx + 1 :]

    users = []
    for ln in data_lines:
        parts = ln.split("\t")
        if len(parts) < 3:
            continue
        uid, phone, name = parts[0], parts[1], parts[2]
        users.append((uid, phone, name))
    return users


def request_json(method: str, url: str, token: str | None = None, body: dict | None = None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data_bytes = None
    if body is not None:
        data_bytes = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            txt = resp.read().decode("utf-8", errors="ignore")
            if not txt:
                return status, None
            try:
                return status, json.loads(txt)
            except Exception:
                return status, {"raw": txt[:2000]}
    except urllib.error.HTTPError as e:
        txt = e.read().decode("utf-8", errors="ignore") if hasattr(e, "read") else ""
        try:
            payload = json.loads(txt) if txt else None
        except Exception:
            payload = {"raw": txt[:2000]}
        return e.code, payload


def main():
    users = mysql_users()
    print(f"Found {len(users)} users")
    for uid, phone, _name in users:
        print(f"\n==> user {uid} phone={phone}")

        login_status, login_data = request_json(
            "POST",
            f"{BASE}/api/auth/login",
            body={"phone": phone, "password": DEFAULT_PW},
        )
        print("login:", login_status)
        if login_status != 200 or not login_data or "token" not in login_data:
            print("login_resp:", login_data)
            continue
        token = login_data["token"]

        me_status, me_data = request_json(
            "GET",
            f"{BASE}/api/points/me",
            token=token,
            body=None,
        )
        print("points/me:", me_status)
        if me_status >= 500:
            print("points/me_resp:", me_data)


if __name__ == "__main__":
    main()

