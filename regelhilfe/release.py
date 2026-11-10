#!/usr/bin/env python3
"""Neue App-Version setzen: python3 release.py 1.0.1
Schreibt die Nummer in index.html (APP_VERSION), sw.js (VERSION) und version.json.
Die App prüft version.json beim Start, beim Zurückkehren in die App und alle 15 Minuten
und lädt sich dann selbst neu (in einem offenen Spiel erst beim Zurück zur Übersicht)."""
import re, sys, os, json
v = sys.argv[1]; d = os.path.dirname(os.path.abspath(__file__))
def sub(f, pat, rep):
    p = os.path.join(d, f); s = open(p).read(); s2, n = re.subn(pat, rep, s, count=1); assert n == 1, f; open(p, 'w').write(s2)
sub('index.html', r'const APP_VERSION = "[^"]*"', f'const APP_VERSION = "{v}"')
sub('sw.js', r"const VERSION = '[^']*'", f"const VERSION = '{v}'")
json.dump({"version": v}, open(os.path.join(d, 'version.json'), 'w')); print('Version', v)
