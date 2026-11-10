# Regelhilfe

Spielabend-Seiten für Brettspiel-Regelfragen: https://nechromus.github.io/Board-Game-Tools/regelhilfe/

- Die App selbst enthält keine Spieldaten. Sie lädt `games.json`, Cover und Spielhilfen über die GitHub-API aus dem privaten Repository `nechromus/RulesHelperData`, mit einem Fine-grained token (nur dieses Repo, Contents: Read-only), den man einmal pro Gerät einträgt.
- Alles Geladene liegt in IndexedDB, geordnet nach Git-Blob-SHA. Bei jedem Start, beim Zurückkehren in die App und alle 15 Minuten vergleicht sie den letzten Commit; geänderte Dateien werden automatisch nachgeladen, alte gelöscht. Ohne Netz läuft sie mit dem gespeicherten Stand.
- Zugang auf weiteren Geräten: In den Einstellungen „Token per QR-Code teilen“, auf dem neuen Gerät beim Einrichten „QR-Code scannen“ (oder den geteilten Link `…/regelhilfe/#token=…` öffnen bzw. einfügen).
- App-Updates: `python3 release.py <version>` erhöht die Nummer in `index.html`, `sw.js` und `version.json`. Die App merkt die neue `version.json` und lädt sich selbst neu.
