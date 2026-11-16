"""Genera la malla de un paraboloide de revolución para las ilustraciones (pico y nariz del tren bala).

Superficie exacta: un paraboloide de revolución tiene como perfil una parábola girada alrededor de su eje.
En coordenadas unitarias (base de radio 1 en z = 0, punta en z = 1):

    z = 1 - r²        con 0 <= r <= 1

La malla se calcula con numpy, anillo a anillo, con r = u (u de 0 a 1 en pasos iguales).
Así los anillos quedan más juntos hacia la punta, justo donde la curva cambia más rápido.
Después trimesh comprueba que la malla es cerrada y que su volumen coincide con el exacto
(V = π·R²·L / 2) antes de escribir src/data/paraboloide.json.

Uso:
    pip install numpy trimesh
    python tools/paraboloide.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import trimesh

ANILLOS = 10  # divisiones a lo largo del eje
LADOS = 24  # divisiones alrededor del eje
LUZ = np.array([0.0, -0.85, 0.5])  # de dónde viene la luz (y negativa = arriba, en Zdog)
SALIDA = Path(__file__).resolve().parent.parent / "src" / "data" / "paraboloide.json"


def perfil(u):
    """Punto (radio, z) del paraboloide unitario para el parámetro u."""
    return u, 1.0 - u * u


def vertices_y_caras():
    u = np.linspace(0.0, 1.0, ANILLOS + 1)
    radio, z = perfil(u)
    ang = np.linspace(0.0, 2 * np.pi, LADOS, endpoint=False)

    # Anillo 0 = la punta (un solo vértice); del 1 al final, LADOS vértices cada uno.
    v = [[0.0, 0.0, z[0]]]
    for j in range(1, ANILLOS + 1):
        for a in ang:
            v.append([radio[j] * np.cos(a), radio[j] * np.sin(a), z[j]])
    v = np.array(v)

    def idx(j, i):
        return 0 if j == 0 else 1 + (j - 1) * LADOS + i % LADOS

    caras = []
    for i in range(LADOS):
        caras.append([idx(0, 0), idx(1, i + 1), idx(1, i)])  # triángulos de la punta
    for j in range(1, ANILLOS):
        for i in range(LADOS):
            caras.append([idx(j, i), idx(j, i + 1), idx(j + 1, i + 1), idx(j + 1, i)])
    return v, caras


def validar(v, caras):
    """Triangula la malla, la cierra con la tapa de la base y compara con el volumen exacto."""
    triangulos = []
    for c in caras:
        triangulos.append(c[:3])
        if len(c) == 4:
            triangulos.append([c[0], c[2], c[3]])
    base = [1 + (ANILLOS - 1) * LADOS + i for i in range(LADOS)]
    centro = len(v)
    v_cerrada = np.vstack([v, [0.0, 0.0, 0.0]])
    for i in range(LADOS):
        triangulos.append([centro, base[i], base[(i + 1) % LADOS]])

    malla = trimesh.Trimesh(v_cerrada, triangulos, process=True)
    malla.fix_normals()
    ideal = np.pi / 2  # R = 1, L = 1
    assert malla.is_watertight, "la malla no es cerrada"
    assert malla.volume > 0, "las normales apuntan hacia adentro"
    # Con LADOS = 24 el polígono inscrito pierde un poco de área: se acepta hasta un 3 %.
    error = abs(malla.volume - ideal) / ideal
    assert error < 0.03, f"volumen {malla.volume:.4f} lejos del exacto {ideal:.4f}"
    return malla.volume, ideal, error


def luz_de(v, cara):
    """Brillo (0 = sombra, 1 = iluminada) según hacia dónde mira la cara."""
    p = v[cara]
    n = np.cross(p[1] - p[0], p[2] - p[0])
    if len(cara) == 4:
        n = n + np.cross(p[2] - p[0], p[3] - p[0])
    n = n / np.linalg.norm(n)
    c = p.mean(axis=0)
    if np.dot(n, [c[0], c[1], 0.0]) < 0:  # que apunte hacia afuera del eje
        n = -n
    return float(np.clip(0.5 + 0.5 * np.dot(n, LUZ / np.linalg.norm(LUZ)), 0.0, 1.0))


def main():
    v, caras = vertices_y_caras()
    volumen, ideal, error = validar(v, caras)
    datos = {
        "ecuacion": "z = 1 - r^2 (paraboloide de revolución; base r=1 en z=0, punta en z=1)",
        "anillos": ANILLOS,
        "lados": LADOS,
        "vertices": np.round(v, 5).tolist(),
        "caras": caras,
        "luz": [round(luz_de(v, c), 3) for c in caras],
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, separators=(",", ":")), encoding="utf-8")
    print(f"{len(v)} vértices, {len(caras)} caras")
    print(f"volumen {volumen:.4f} (exacto {ideal:.4f}, error {error:.2%})")
    print(f"escrito: {SALIDA}")


if __name__ == "__main__":
    sys.exit(main())
