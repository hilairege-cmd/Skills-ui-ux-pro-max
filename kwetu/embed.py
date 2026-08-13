#!/usr/bin/env python3
"""
embed.py — Encode les photos KWETU en base64 et les intègre dans index.html.

Nommez vos photos ainsi dans kwetu/photos/ :
  salle.jpg          → Salle intérieure (mur en pierre, rideaux dorés)
  bar.jpg            → Bar (colonnes sombres, lumière rouge)
  cocktail-rouge.jpg → Cocktail rouge en verre cristal
  tacos.jpg          → Assiette tacos aux crevettes
  cocktail-rose.jpg  → Cocktail rose tenu par une main

Puis lancez : python3 embed.py
→ Génère index-final.html avec toutes les photos intégrées.
"""

import base64, os, re, mimetypes
from pathlib import Path

PHOTOS_DIR = Path(__file__).parent / "photos"
INDEX_IN   = Path(__file__).parent / "index.html"
INDEX_OUT  = Path(__file__).parent / "index-final.html"

PHOTO_MAP = {
    "salle":          "salle.jpg",
    "bar":            "bar.jpg",
    "cocktail-rouge": "cocktail-rouge.jpg",
    "tacos":          "tacos.jpg",
    "cocktail-rose":  "cocktail-rose.jpg",
}

def encode(filename: str) -> str | None:
    path = PHOTOS_DIR / filename
    if not path.exists():
        print(f"  ⚠  {filename} introuvable — le slot restera vide.")
        return None
    mime = mimetypes.guess_type(str(path))[0] or "image/jpeg"
    data = base64.b64encode(path.read_bytes()).decode()
    size_kb = path.stat().st_size // 1024
    print(f"  ✓  {filename} ({size_kb} Ko)")
    return f"data:{mime};base64,{data}"

def build_style_block(encoded: dict[str, str]) -> str:
    lines = [":root {"]
    def url(key: str) -> str:
        if key in encoded:
            return f"url('{encoded[key]}')"
        return "url('./photos/" + PHOTO_MAP.get(key, key + ".jpg") + "')"
    lines.append(f"  --photo-hero:      {url('salle')};")
    lines.append(f"  --photo-intro:     {url('salle')};")
    lines.append(f"  --photo-gallery-1: {url('salle')};")
    lines.append(f"  --photo-gallery-2: {url('bar')};")
    lines.append(f"  --photo-gallery-3: {url('cocktail-rouge')};")
    lines.append(f"  --photo-gallery-4: {url('tacos')};")
    lines.append(f"  --photo-bar:       {url('bar')};")
    lines.append(f"  --photo-food:      {url('tacos')};")
    lines.append(f"  --photo-cocktail:  {url('cocktail-rose')};")
    lines.append(f"  --photo-cocktail2: {url('cocktail-rouge')};")
    lines.append("}")
    return "\n".join(lines)

def main():
    print("\nKWETU — Intégration des photos\n" + "─" * 36)
    encoded = {}
    for key, filename in PHOTO_MAP.items():
        result = encode(filename)
        if result:
            encoded[key] = result

    html = INDEX_IN.read_text(encoding="utf-8")
    new_block = build_style_block(encoded)

    html = re.sub(
        r'(<style id="photo-vars">).*?(</style>)',
        lambda m: m.group(1) + "\n" + new_block + "\n" + m.group(2),
        html, flags=re.DOTALL
    )

    INDEX_OUT.write_text(html, encoding="utf-8")
    print(f"\n→ Fichier généré : {INDEX_OUT.name}")
    print(f"  Taille : {INDEX_OUT.stat().st_size // 1024} Ko\n")

if __name__ == "__main__":
    main()
