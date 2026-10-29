# -*- coding: utf-8 -*-
"""花海生活报本地预览服务器：所有响应禁止缓存（Cache-Control: no-store），
避免浏览器使用旧缓存导致页面显示 {{ }} 变量。用法：python serve.py [端口]"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# 始终以本脚本所在目录为站点根目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def guess_type(self, path):
        t = super().guess_type(path)
        if t in ("text/javascript", "application/javascript"):
            return "text/javascript; charset=utf-8"
        if t == "text/html":
            return "text/html; charset=utf-8"
        if t == "text/css":
            return "text/css; charset=utf-8"
        return t

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"花海生活报预览: http://localhost:{port}/index.html  (Ctrl+C 停止)")
    ThreadingHTTPServer(("0.0.0.0", port), NoCacheHandler).serve_forever()
