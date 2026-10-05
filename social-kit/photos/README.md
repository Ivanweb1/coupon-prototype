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

## Аватар 6. Объёмный шар

### avatar-3d.jpg
Квадрат 1:1, от 1600 px. Для Midjourney — `--ar 1:1`.
```
3D render of a single glossy red balloon (color #DD443C) with a large white percent sign "%" printed on it, floating in the center of the frame, thin curly white string below, soft studio lighting, subtle reflections, plain solid red background of the same tone #DD443C, minimal, clean, centered composition with the balloon filling about 65% of the frame, rounded friendly shapes, toy-like, high detail. No other text, no letters, no logos, no watermark.
```
Если знак % выходит кривым — убрать его из промпта, знак наложим поверх.

## Второй заход — под обложку-купон K–O (05.10)

Сейчас снимки сделаны под широкий кадр, а в купоне окно под фото ~16:10
(850×540), на телефоне видна только верхняя полоса. Отсюда пустые половины
кадра (улица слева у пары и прогулки, голый камень у раскладки) и мелкие
предметы, к которым трудно привязать выгоду. Новые снимки:
- **16:10, от 2400 px**; главное заполняет 75–85 % кадра;
- **лица — в верхней трети**: тогда тот же файл работает и на телефоне;
- **крупные отдельные предметы** — к каждому ставится метка выгоды;
- без текста, логотипов и вывесок, тёплый свет, акценты красного #DD443C.

Для Midjourney в конце: `--ar 16:10 --style raw`.

| Файл | Обложка | Что лучше, чем сейчас |
|---|---|---|
| `cafe-2.jpg` | K, L | крупнее люди, выпечка и кофе на первом плане |
| `couple-2.jpg` | M | пара на весь кадр, больше покупок в руках |
| `flatlay-2.jpg` | N | предметы по всему кадру, а не в углу |
| `walk-2.jpg` | O | девушка по пояс, покупки и кофе крупно |
| `checkout.jpg` | новая | показывает механику: купон на экране на кассе |
| `table.jpg` | новая | стол в кафе сверху — много блюд под метки |

### cafe-2.jpg
```
Medium close-up in a cozy bright coffee shop, a cheerful young Slavic woman in a red knitted sweater at the counter smiles and holds up her smartphone toward a friendly bearded barista, who hands her a cappuccino in a white cup; in the foreground on the wooden counter a glass display with large golden croissants, cinnamon rolls and eclairs. Both people fill the frame, faces in the upper third, pastries and cup large and clearly separated. Warm natural window light, rich saturated colors, shallow depth of field, editorial lifestyle photo. Phone screen not visible. No text, no logos, no signage, no watermark.
```

### couple-2.jpg
```
Medium shot of a happy Slavic couple in their 30s walking out of a florist and bakery street in early autumn, both laughing, filling 80% of the frame, faces in the upper third. The man holds a big bouquet of red and white flowers and two kraft shopping bags, the woman holds an open pastry box with glazed donuts and a takeaway coffee, she wears a beige coat and a red scarf. Each item large and clearly visible. Warm golden afternoon light, saturated, blurred city background, candid editorial photo. No text, no logos, no signage, no watermark.
```

### flatlay-2.jpg
```
Top-down flat lay filling the entire frame evenly, on a light warm grey stone surface, a curated set of city purchases arranged in a loose grid with small gaps between them: cappuccino with latte art and a croissant, red lipstick and red nail polish, a red kettlebell, a wooden toy car, a slice of pepperoni pizza on a white plate, a bouquet of red gerberas, white sneakers, a perfume bottle, two blank cinema tickets, car keys. Every object is large, distinct and fully visible, no overlaps. Bright soft daylight, rich saturated colors with red accents, clean commercial still life. No text, no logos, no brand names, no watermark.
```

### walk-2.jpg
```
Waist-up lifestyle photo of a happy young Slavic woman walking down an autumn city street, laughing, filling 75% of the frame, face in the upper third, holding three colorful kraft shopping bags, a takeaway coffee cup and a small bouquet of flowers, wearing a beige trench coat and a red knitted scarf. Purchases large and clearly visible. Warm golden light, saturated colors, blurred golden trees and shop windows behind, 50mm, editorial. No text, no logos, no signage, no watermark.
```

### checkout.jpg
```
Close-up at a cafe checkout counter: a woman's hand holds a smartphone vertically with the screen facing the camera, perfectly frontal and flat, the screen is plain solid white and blank; behind it, slightly blurred, a smiling barista at a payment terminal, a cappuccino and croissants on the counter. Phone in the left-center of the frame, about 40% of frame height. Warm light, saturated, shallow depth of field. No text on the screen, no logos, no watermark.
```
На белый экран телефона накладывается наш купон из вёрстки.

### table.jpg
```
Top-down view of a wooden restaurant table for two filling the whole frame: a pepperoni pizza, a fresh salad bowl, a plate of sushi rolls, two cappuccinos, a slice of red velvet cake, a jug of red berry lemonade with glasses, hands of two people reaching for food. Every dish large and clearly separated. Warm daylight, rich saturated appetizing colors, food photography, clean composition. No text, no logos, no watermark.
```

## Отдельные снимки под телефон — обложка-купон (05.10)

На телефоне от снимка купона видна полоса **780×300 (≈ 2,6 : 1)**, и по её
верхним углам лежат кнопки ВК «назад» и «настройки». Общий снимок туда
влезает только сильно обрезанным. Если в `photos/` есть `<имя>-mob.jpg`,
на телефоне берётся он. Формат **8:3, от 2600×975**; для Midjourney —
`--ar 8:3 --style raw`. Общие правила: всё главное — в центральных 60 %
ширины, по высоте по центру, головы не у верхнего края; верхние углы
(~15 % ширины и ~30 % высоты) пустые — там кнопки; один крупный предмет
правее центра под метку выгоды.

| Файл | Обложка |
|---|---|
| `cafe-2-mob.jpg` | K, L |
| `couple-2-mob.jpg` | M |
| `flatlay-2-mob.jpg` | N |
| `walk-2-mob.jpg` | O |
| `checkout-mob.jpg` | T |
| `table-mob.jpg` | U |
