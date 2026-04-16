İş dosyası formatı aşağıdaki gibidir:

| # | Alan Adı | Maks. Uzunluk | Örnek Değer | Açıklama |
|---|----------|--------------|-------------|----------|
| 1 | Kesim Numarası | 4 karakter | 0001, 0002, 0003 | Artarak devam eder. |
| 2 | Kesilecek Uzunluk | 5 karakter | 1200.0, 1500.5 | Ondalık nokta dahil 5 hanedir. |
| 3 | Profil Kodu | 12 karakter | ABC123456789 | Her hane bir karakteri temsil eder. |
| 4 | Sol Açı Tilt\|Pivot | 2\|2 karakter | 90\|45, 45\|90 | İlk kısım sol açı tilt, ikinci kısım pivot değerini temsil eder. |
| 5 | Sağ Açı Tilt\|Pivot | 2\|2 karakter | 90\|45, 45\|90 | İlk kısım sağ açı tilt, ikinci kısım pivot değerini temsil eder. |
| 6 | Adet | 1 karakter | 1, 2 | Maksimum 2 adet olabilir. Adet=2 olan satırdan sonraki satır atlanır; sadece adet=1 olan satırlar işlenir. |
| 7 | Yükseklik | 3 karakter | 100, 250 | Barkod yazıcıdan çıkan bilgi. |
| 8 | Sipariş No | 10 karakter | 1234567890 | Barkod yazıcıdan çıkan bilgi. |
| 9 | Poz No | 3 karakter | 001, 002, 003 | Barkod yazıcıdan çıkan bilgi. |
| 10 | Montaj | 1 karakter | — | — |
| 11 | Araba No | 1 karakter | 1..9 | Barkod yazıcıdan çıkan bilgi. |
| 12 | Yer No | 3 karakter | 001, 002, 003 | Barkod yazıcıdan çıkan bilgi. |
| 13 | Diğer Eksen | 5 karakter | 12000 (= 1200.0) | Çerçevenin diğer eksen uzunluğunu temsil eder. |
| 14 | Renk/Conta | 2 karakter | 01, 02 | Barkod yazıcıdan çıkan bilgi. |
| 15 | İşlem | 2 karakter | 01, 02 | Barkod yazıcıdan çıkan bilgi. |
| 16 | Bayi Adı | 16 karakter | ABC Company | Barkod yazıcıdan çıkan bilgi. |

Sütunlar (;) ile ayrılmıştır. Her satır bir kesimi temsil eder. Kesim numarası artarak devam eder ve her kesim için gerekli bilgiler sağlanır. İşlem sırasında sadece belirli kriterlere uyan satırlar işlenir, diğerleri atlanır.
Örneğin, sadece adet 1 olan satırlar işlenirken, adet 2 olan satırlardan sonraki 1 satır atlanır.
