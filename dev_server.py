#!/usr/bin/env python3
"""
Dev server (static + logs API) for uqac-privacy-data-visualizer.

- Serves the project root (index.html, pages/, assets/, Frontend/...)
- Logs API writes/reads JSON files from: Frontend/logs/pixel

Run (from project root):
  python dev_server.py
Then open:
  http://127.0.0.1:8000/pages/pixel-tracker.html
"""
from __future__ import annotations

import json
import os
import re
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
LOG_DIR = ROOT / "Frontend" / "logs" / "pixel"
LOG_DIR.mkdir(parents=True, exist_ok=True)

SAFE_NAME_RE = re.compile(r"^[a-zA-Z0-9._-]+$")


def json_bytes(obj) -> bytes:
  return (json.dumps(obj, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


class Handler(SimpleHTTPRequestHandler):
  # Python 3.11+ supports directory= in constructor; SimpleHTTPRequestHandler uses it for static files.

  def _send_json(self, status: int, obj):
    data = json_bytes(obj)
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(data)))
    self.end_headers()
    self.wfile.write(data)

  def _send_text(self, status: int, text: str):
    data = (text + "\n").encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "text/plain; charset=utf-8")
    self.send_header("Content-Length", str(len(data)))
    self.end_headers()
    self.wfile.write(data)

  def _read_json_body(self):
    try:
      n = int(self.headers.get("Content-Length", "0"))
    except ValueError:
      n = 0
    raw = self.rfile.read(n) if n > 0 else b""
    if not raw:
      return None
    try:
      return json.loads(raw.decode("utf-8"))
    except Exception:
      return None

  def do_GET(self):
    if self.path == "/api/pixel-logs" or self.path == "/api/pixel-logs/":
      files = []
      for p in sorted(LOG_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        st = p.stat()
        files.append({
          "name": p.name,
          "mtime": int(st.st_mtime),
          "size": int(st.st_size),
        })
      return self._send_json(HTTPStatus.OK, {"dir": str(LOG_DIR), "files": files})

    if self.path.startswith("/api/pixel-logs/"):
      name = unquote(self.path[len("/api/pixel-logs/"):]).strip("/")
      if not name:
        return self._send_text(HTTPStatus.BAD_REQUEST, "Missing file name")
      if not SAFE_NAME_RE.match(name):
        return self._send_text(HTTPStatus.BAD_REQUEST, "Invalid file name")
      if not name.endswith(".json"):
        name = name + ".json"
      p = LOG_DIR / name
      if not p.exists():
        return self._send_text(HTTPStatus.NOT_FOUND, "Not found")
      try:
        data = json.loads(p.read_text(encoding="utf-8"))
      except Exception:
        return self._send_text(HTTPStatus.INTERNAL_SERVER_ERROR, "Invalid JSON file")
      return self._send_json(HTTPStatus.OK, data)

    # Static files
    return super().do_GET()

  def do_POST(self):
    if self.path == "/api/pixel-logs" or self.path == "/api/pixel-logs/":
      body = self._read_json_body()
      if not isinstance(body, dict):
        return self._send_text(HTTPStatus.BAD_REQUEST, "Invalid JSON body")

      key = body.get("key")
      if not isinstance(key, str) or not key.strip():
        # accept alternative fields
        key = body.get("id") if isinstance(body.get("id"), str) else None
      if not isinstance(key, str) or not key.strip():
        return self._send_text(HTTPStatus.BAD_REQUEST, "Missing 'key'")

      key = key.strip()
      # sanitize: keep only safe chars, replace others by '_'
      key_safe = re.sub(r"[^a-zA-Z0-9._-]+", "_", key)
      if not key_safe:
        return self._send_text(HTTPStatus.BAD_REQUEST, "Invalid 'key'")

      fname = f"{key_safe}.json" if not key_safe.endswith(".json") else key_safe
      p = LOG_DIR / fname

      # Write atomically
      tmp = p.with_suffix(".json.tmp")
      try:
        tmp.write_bytes(json_bytes(body))
        os.replace(tmp, p)
      except Exception as e:
        try:
          if tmp.exists():
            tmp.unlink()
        except Exception:
          pass
        return self._send_text(HTTPStatus.INTERNAL_SERVER_ERROR, f"Write failed: {e}")

      return self._send_json(HTTPStatus.OK, {"ok": True, "file": fname})

    return self._send_text(HTTPStatus.NOT_FOUND, "Unknown endpoint")


def main():
    import sys

    host = "127.0.0.1"
    port = 8000

    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    httpd = ThreadingHTTPServer(
        (host, port),
        lambda *args, **kwargs: Handler(*args, directory=str(ROOT), **kwargs),
    )

    print(f"Serving: {ROOT}")
    print(f"Logs dir: {LOG_DIR}")
    print(f"URL: http://{host}:{port}/pages/pixel-tracker.html")

    httpd.serve_forever()


if __name__ == "__main__":
  main()
