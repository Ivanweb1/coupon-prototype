# Снимки для новых обложек

Сюда кладутся фото для обложек A («Люди») и C («Раскладка») из
`social-kit/index.html`. Вариант B («Витрина») собран из готовой библиотеки
`assets/coupons/` и снимков не ждёт.

Пока файла нет, на его месте в макете серая штриховка с именем файла,
а `render.py` такой макет пропускает.

**Загрузить:** https://github.com/Ivanweb1/coupon-prototype/upload/claude/relaxed-ritchie-o4x58k/social-kit/photos
Имена — строго как в таблице, формат JPG.

| Файл | Вариант | Что на снимке | Пропорция |
|---|---|---|---|
| `people.jpg` | A, основной | девушка с пакетами и кофе на улице | 3:2, от 2400 px |
| `people-2.jpg` | A, `?people=2` | пара с покупками выходит из кафе | 3:2, от 2400 px |
| `people-3.jpg` | A, `?people=3` | девушка показывает телефон бариста | 3:2, от 2400 px |
| `flatlay.jpg` | C | товары и услуги города на одном столе, вид сверху | 21:9, от 3000 px |

## Общие требования

- без текста, логотипов, вывесок и водяных знаков: на обложке свои надписи;
- естественный дневной свет, тёплые нейтральные тона, акценты красного
  (фирменный #DD443C) в одежде или предметах; без виньеток и градиентов;
- люди — славянская внешность, обычная городская одежда, без глянца;
- на A слева от человека ~40 % спокойного фона: туда встают белые
  пилюли с выгодами («Кофе и выпечка 5 = 4», «Маникюр −25%», «Фитнес −35%»).

Промпты на английском — генераторы (Midjourney, Flux, DALL·E, Шедеврум,
Kandinsky) понимают его лучше. Для Midjourney допишите в конце параметр
пропорции: `--ar 3:2` или `--ar 21:9`.

## A. Люди

### people.jpg
```
Lifestyle photo of a happy young Slavic woman, 27 years old, laughing, walking down a cozy city street in early autumn, holding two kraft paper shopping bags and a takeaway coffee cup, wearing a beige trench coat and a red knitted scarf. Warm natural daylight, soft shadows, shallow depth of field, blurred shop windows and golden trees behind. She stands in the right half of the frame, the left 40% is calm out-of-focus street background. Editorial, authentic, candid, 35mm lens. No text, no logos, no signage, no watermark.
```

### people-2.jpg
```
Lifestyle photo of a smiling Slavic couple in their 30s leaving a bright cafe together, the man carries paper shopping bags and a flower bouquet, the woman holds a pastry box and laughs, early autumn, warm afternoon light, glass cafe door and plants behind them. The couple is positioned in the right half of the frame, the left 40% is soft blurred background. Authentic, candid, warm neutral tones with a touch of red in clothing. 35mm, shallow depth of field. No text, no logos, no signage, no watermark.
```

### people-3.jpg
```
Candid photo inside a cozy specialty coffee shop: a cheerful young Slavic woman at the counter shows her smartphone screen to a friendly barista, who smiles and hands her a cappuccino in a ceramic cup, croissants in a glass display, warm wood and beige tones, red accent in her sweater. Phone screen faces away from the camera. Both people are in the right half of the frame, the left 40% is soft blurred cafe interior. Natural window light, 35mm, shallow depth of field. No text, no logos, no watermark.
```

## C. Раскладка

### flatlay.jpg
```
Top-down flat lay on a light warm grey stone surface, everyday city purchases and services arranged neatly with generous spacing: a cappuccino with latte art and a croissant, a red lipstick and a bottle of red nail polish, a small red kettlebell, a wooden children's toy, car keys, a slice of pizza on a paper plate, white sneakers, a small bouquet of flowers, two blank paper tickets. Objects are placed mostly in the right third and along the left edge; the center-left area is empty stone surface. Soft natural daylight from the top left, gentle shadows, warm neutral palette with red accents, minimal, clean, commercial still life. No text, no logos, no brand names, no watermark.
```

Если на раскладке билетики выгоды (−50%, 2 по цене 1, −30%) легли
неудачно — их места правятся в `kit.css`, блок «C. Раскладка».
