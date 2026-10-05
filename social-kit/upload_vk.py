# -*- coding: utf-8 -*-
"""
Загрузка обложки сообщества ВК через API.

Нужно:
  - сеть до api.vk.com и сервера загрузки (pu.vk.com / *.vk.com / *.userapi.com);
  - переменные окружения:
      VK_GROUP_TOKEN — ключ доступа сообщества с правом «Фотографии»
                       (Управление → Работа с API → Ключи доступа);
      VK_GROUP_ID    — номер сообщества, без минуса.

Запуск:
    python social-kit/upload_vk.py out/vk/vk-cover-cpn-red-cafe-1920x768.png

Обложка для компьютера — 1920×768. Живую обложку (телефон), аватар и
кнопки меню ВК через ключ сообщества не загрузить — их ставят вручную.
"""

import os
import sys
from pathlib import Path

import requests

API = "https://api.vk.com/method/"
V = "5.199"


def call(method, **params):
    params.update(access_token=os.environ["VK_GROUP_TOKEN"], v=V)
    r = requests.post(API + method, data=params, timeout=30).json()
    if "error" in r:
        sys.exit(f"{method}: {r['error'].get('error_msg')}")
    return r["response"]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = Path(sys.argv[1])
    if not path.is_absolute():
        path = Path(__file__).resolve().parent / path
    group = os.environ["VK_GROUP_ID"].lstrip("-")

    server = call("photos.getOwnerCoverPhotoUploadServer", group_id=group,
                  crop_x=0, crop_y=0, crop_x2=1920, crop_y2=768)
    with open(path, "rb") as f:
        up = requests.post(server["upload_url"], files={"photo": (path.name, f, "image/png")}, timeout=60).json()
    if "hash" not in up:
        sys.exit(f"загрузка: {up}")
    res = call("photos.saveOwnerCoverPhoto", hash=up["hash"], photo=up["photo"])
    print("обложка загружена:", path.name, "→", len(res.get("images", [])), "размеров")


if __name__ == "__main__":
    main()
