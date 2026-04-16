# TT405 Cut List Descriptions — B&R

## Örnek Veri

| Kesim Numarası | Kesilecek Uzunluk | Profil Kodu | Sol Açı | Sağ Açı | Adet | Yükseklik | Sipariş No | Poz No | Montaj | Araba No | Yer No | Diğer Eksen | Renk/Conta | İşlem | Bayi Adı |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 806.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 1 | 1 | 1 | 1 | 906.0 | 11 | 0 | XXXXXXXXXX16BAYI |
| 2 | 906.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 1 | 2 | 1 | 2 | 806.0 | 11 | 1 | XXXXXXXXXX16BAYI |
| 3 | 806.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 1 | 3 | 1 | 3 | 906.0 | 11 | 2 | XXXXXXXXXX16BAYI |
| 4 | 906.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 1 | 4 | 1 | 4 | 806.0 | 11 | 3 | XXXXXXXXXX16BAYI |
| 5 | 1406.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 2 | 1 | 1 | 1 | 1206.0 | 14 | 4 | XXXXXXXXXX16BAYI |
| 6 | 1206.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 2 | 2 | 1 | 2 | 1406.0 | 14 | 5 | XXXXXXXXXX16BAYI |
| 7 | 1406.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 2 | 3 | 1 | 3 | 1206.0 | 14 | 6 | XXXXXXXXXX16BAYI |
| 8 | 1206.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 2 | 4 | 1 | 4 | 1406.0 | 14 | 7 | XXXXXXXXXX16BAYI |
| 9 | 1506.0 | XXXXXXX12PEN | 90 | 90 | 1 | 60 | X10MUSTERI | 200 | 1 | 2 | 10 | 1806.0 | 1 | 8 | XXXXXXXXXX16BAYI |
| 10 | 1806.0 | XXXXXXX12PEN | 90 | 45 | 1 | 60 | X10MUSTERI | 200 | 2 | 2 | 20 | 1506.0 | 2 | 9 | XXXXXXXXXX16BAYI |
| 11 | 1506.0 | XXXXXXX12PEN | 45 | 90 | 1 | 60 | X10MUSTERI | 200 | 3 | 2 | 30 | 1806.0 | 3 | 10 | XXXXXXXXXX16BAYI |
| 12 | 1806.0 | XXXXXXX12PEN | 45 | 45 | 1 | 60 | X10MUSTERI | 200 | 4 | 2 | 40 | 1506.0 | 4 | 11 | XXXXXXXXXX16BAYI |
| 13 | 1200.0 | XXXXXXX12PEN | 90 | 45 | 1 | 60 | X10MUSTERI | 60 | 1 | 5 | 100 | 1000.0 | 1 | 12 | XXXXXXXXXX16BAYI |

---

## Sütun Açıklamaları

| Sütun No | Gerekli | Sütun Açıklaması | Karakter Sayısı | Data Tipi | Açıklamalar |
|---|:---:|---|---|---|---|
| 1 | > | Kesim Numarası | Max. 4 digits | uint | |
| 2 | > | Kesilecek Uzunluk | Max. 5 digits | double | 1200 veya 1200.0 şeklinde yazılabilir. |
| 3 | | Profil Kodu | Max. 12 digits | string | |
| 4 | > | Sol Açı | Max. 2 digits | uint | |
| 5 | > | Sağ Açı | Max. 2 digits | uint | |
| 6 | > | Adet | Max. 1 digits | uint | |
| 7 | | Yükseklik | Max. 3 digits | uint | |
| 8 | | Sipariş No | Max. 10 digits | string | |
| 9 | | Poz No | Max. 3 digits | uint | |
| 10 | | Montaj | Max. 1 digits | uint | 1: ÜST (Y)<br>2: SAĞ (X)<br>3: ALT (Y)<br>4: SOL (X) |
| 11 | | Araba No | Max. 1 digits | uint | |
| 12 | | Yer No | Max. 3 digits | uint | |
| 13 | | Diğer Eksen | Max. 5 digits | double | 1200 veya 1200.0 şeklinde yazılabilir. |
| 14 | | Renk/Conta | Max. 2 digits | uint | 01: No gasket and white profile<br>02: No gasket and bottom colored profile<br>03: No gasket and top colored profile<br>04: No gasket and full colored profile<br>11: With gasket and white profile<br>12: With gasket and bottom colored profile<br>13: With gasket and top colored profile<br>14: With gasket and full colored profile |
| 15 | | İşlem | Max. 2 digits | uint | 0: No operation<br>1: Water slot<br>2: Handle<br>3: Hinge<br>4: Double opening<br>5: Single opening left<br>6: Single opening right<br>7: Double opening left<br>8: Double opening right<br>9: V. opening left<br>10: Right opening door<br>11: Left opening door<br>12: Transom window |
| 16 | | Bayi Adı | Max. 16 digits | string | |

---

> **Not:** `>` ile işaretlenmiş sütunlar makine operasyonları için gereklidir. Diğer alanlar etikette yazılmak üzere kullanılır.
