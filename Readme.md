# CSV File Checker Haffner

[Uygulamayı aç / Open the checker](https://hm-info.github.io/csv_file_checker_haffner/)

## Türkçe

TT425 Omron, TT405 B&R ve MSC iş dosyası kullanan NR241 / NR242 / NR210 makineleri için tarayıcıda CSV kontrolü. Dosyalar sunucuya gönderilmez.

NR modunda ilk dolu satır sütun başlıklarıdır; sütun sırası değişebilir. `;` veya `,` ayırıcısı otomatik bulunur. UTF-8, Windows-1254 ve Windows-1252 kodlamaları seçilebilir. Temel alanlar: `id`, `ksn`, `ksnbar`, `ktn`, `ktnbar`, `l`, `r`, `code`, `mainprofile`. Etiket alanlarının tamamı zorunlu değildir. `nccode` yoksa işlem kontrolünün yapılamadığı uyarılır; boş bir parça makrosu kabul edilir.

Sütun sayısı, sayısal alanlar, tekrarlanan kimlik / parça sırası ve çubuk tutarlılığı kontrol edilir. Hatalar dosyanın gerçek satır numarasıyla gösterilir. **NR Makroları** sekmesi `H + Tool(3) + Operasyon(2) + Aksesuar(2) + Konum(5) + Kanal boyu(5)` bloklarını çözümler; konum ve kanal boyunu mm olarak gösterir. Kanal boyu olmayan 13 karakterlik kısa biçim uyarıyla gösterilir.

Bu kontrol standart NR iş dosyası içindir. Altı haneli alternatif makro biçimleri, makinedeki profil / makro tanımları ve mekanik limitler doğrulanmaz. Tırnak içine alınmış ayırıcı veya çok satırlı CSV alanları desteklenmez; ayırıcıların alan içinde kullanılmaması gerekir.

- [Örnek NR CSV](samples/NR_Series/NR_Series_Job_Example.csv)
- [Türkçe rehber](https://hm-info.github.io/msc/nr_job_file_tr.html) · [PDF indir](https://hm-info.github.io/msc/downloads/msc-nr-job-file-tr.pdf)

## English

Browser-based CSV checks for TT425 Omron, TT405 B&R and NR241 / NR242 / NR210 machines using MSC job files. Files stay on your device.

NR mode reads column names from the first non-empty line and accepts reordered columns. It detects semicolon or comma delimiters; UTF-8, Windows-1254 and Windows-1252 encodings are selectable. Required fields: `id`, `ksn`, `ksnbar`, `ktn`, `ktnbar`, `l`, `r`, `code`, `mainprofile`. Label columns are optional. Missing `nccode` produces a warning because machining cannot be checked; empty part macros are allowed.

Checks include row width, numeric fields, duplicate IDs / part sequences and stock-bar consistency. Results show physical file line numbers. The **NR Makroları** tab decodes `H + Tool(3) + Operation(2) + Accessory(2) + Position(5) + Slot length(5)` blocks and displays dimensions in mm. The 13-character form without slot length is reported as a warning.

Checks target standard NR job files. Alternative six-digit macros, machine profile / macro definitions and mechanical limits are outside their scope. Quoted delimiters and multiline CSV fields are unsupported; do not use the delimiter inside a field.

- [NR sample CSV](samples/NR_Series/NR_Series_Job_Example.csv)
- [English guide](https://hm-info.github.io/msc/nr_job_file_en.html) · [Download PDF](https://hm-info.github.io/msc/downloads/msc-nr-job-file-en.pdf)

## Tests

Node.js 22 or later, no dependencies:

```sh
node --test tests/nr-validator.test.cjs
```

