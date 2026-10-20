/* NR-series job-file checks. No network access: files stay in the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NRValidator = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FIELDS = [
    'id', 'ksn', 'ksnbar', 'ktn', 'ktnbar', 'l', 'r', 'code', 'info',
    'width', 'height', 'trolley', 'box', 'orientation', 'reinf', 'reinfbar',
    'pos', 'prono', 'offno', 'agent', 'customer', 'date', 'nccode', 'isfix',
    'colorcode', 'colorinfo', 'mainprofile', 'subcust', 'image', 'DATA1'
  ];
  const REQUIRED = ['id', 'ksn', 'ksnbar', 'ktn', 'ktnbar', 'l', 'r', 'code', 'mainprofile'];
  const KNOWN = new Set(FIELDS.map(name => name.toLowerCase()).concat(['data2', 'data3', 'data4', 'data5']));
  const normalize = value => String(value).replace(/[\u0000-\u001f\u007f\uFEFF]/g, '').trim().toLowerCase();
  const integer = value => /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
  const number = value => /^[+-]?\d+(?:[.,]\d+)?$/.test(value) && Number.isFinite(Number(value.replace(',', '.')));

  function checkMacros(value, partLength) {
    const issues = [];
    const blocks = [];
    const add = (level, msg) => issues.push({ level, msg });
    const text = value.trim();
    if (!text) return { issues, blocks };
    const pieces = text.split('H');
    if (pieces[0].trim() !== '') {
      add('err', 'Makro H ile başlamalıdır. İlk 8 karakter: H + Tool(3) + Operasyon(2) + Aksesuar(2).');
    }
    const seen = new Set();
    for (let i = 1; i < pieces.length; i++) {
      const payload = pieces[i].trim();
      const blockNo = i;
      if (payload.length !== 17 && payload.length !== 12) {
        add('err', `Makro ${blockNo}: ${payload.length + 1} karakter; standart blok 18 karakter olmalıdır (H+3+2+2+5+5).`);
        continue;
      }
      if (!/^\d{7}$/.test(payload.slice(0, 7))) {
        add('err', `Makro ${blockNo}: Tool 3, Operasyon 2 ve Aksesuar 2 rakam olmalıdır.`);
        continue;
      }
      const positionText = payload.slice(7, 12);
      const lengthText = payload.length === 17 ? payload.slice(12, 17) : '00000';
      if (!/^(?:\d{5}|[+-]\d{4})$/.test(positionText) || !/^(?:\d{5}|[+-]\d{4})$/.test(lengthText)) {
        add('err', `Makro ${blockNo}: konum ve kanal boyu alanları beşer karakterlik sayısal değer olmalıdır.`);
        continue;
      }
      const block = {
        code: 'H' + payload, tool: payload.slice(0, 3), operation: payload.slice(3, 5),
        accessory: payload.slice(5, 7), position: Number(positionText), slotLength: Number(lengthText),
        short: payload.length === 12
      };
      blocks.push(block);
      if (Number(block.tool) > 255) add('err', `Makro ${blockNo}: Tool ${block.tool}, desteklenen 0–255 sayısal aralığını aşıyor.`);
      if (block.short) add('warn', `Makro ${blockNo}: kanal boyu içermeyen 13 karakterlik kısa biçim. Standart NR blokları 18 karakterdir; makine ayarıyla doğrulayın.`);
      if (block.position < 0) add('warn', `Makro ${blockNo}: negatif konum (${block.position / 10} mm); makine referansını kontrol edin.`);
      if (block.slotLength < 0) add('warn', `Makro ${blockNo}: negatif kanal boyu (${block.slotLength / 10} mm).`);
      if (Number.isFinite(partLength) && block.position > partLength) {
        add('warn', `Makro ${blockNo}: konum ${block.position / 10} mm, parça boyu ${partLength / 10} mm dışında. Referans ve pay ayarlarını kontrol edin.`);
      }
      if (Number.isFinite(partLength) && block.slotLength > 0 && block.position + block.slotLength > partLength) {
        add('warn', `Makro ${blockNo}: konum + kanal boyu parça boyunu aşıyor; işlem tipini ve referansını kontrol edin.`);
      }
      if (seen.has(block.code)) add('warn', `Makro ${blockNo}: aynı işlem bloğu bu parçada tekrar ediyor.`);
      seen.add(block.code);
    }
    return { issues, blocks };
  }

  function validate(text, options = {}) {
    const lines = String(text).replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)
      .map((text, index) => ({ text, line: index + 1 })).filter(item => item.text.trim() !== '');
    const result = { headers: [], rows: [], rowNumbers: [], rowIssues: [], globalIssues: [], delimiter: ';', macros: [] };
    const global = (level, msg, col = null, field = '-', value = '') =>
      result.globalIssues.push({ row: lines[0]?.line ?? null, col, field, value, level, msg });
    if (!lines.length) {
      global('err', 'Dosya boş. NR biçiminde ilk satırda sütun başlıkları bulunmalıdır.');
      return result;
    }
    if (String(text).includes('\uFFFD')) global('warn', 'Dosyada okunamayan karakter var. Kodlama seçimini (UTF-8 / Windows-1254 / Windows-1252) kontrol edin.');
    const first = lines[0].text;
    const score = delimiter => first.split(delimiter).map(normalize).filter(name => KNOWN.has(name)).length;
    result.delimiter = [';', ','].includes(options.delimiter) ? options.delimiter : (score(',') > score(';') ? ',' : ';');
    result.headers = first.split(result.delimiter).map(value => value.trim());
    const names = result.headers.map(normalize);
    const columns = new Map();
    names.forEach((name, index) => {
      if (!name) global('err', 'Sütun başlığı boş bırakılamaz.', index + 1);
      else if (columns.has(name)) global('err', 'Aynı sütun başlığı birden fazla kez kullanılmış.', index + 1, result.headers[index], result.headers[index]);
      else columns.set(name, index);
    });
    if (!names.some(name => KNOWN.has(name))) {
      global('err', 'NR sütun başlıkları tanınmadı. Başlık satırını ve ; / , ayırıcısını kontrol edin.');
    } else {
      for (const name of REQUIRED) {
        if (!columns.has(name)) global('err', `Temel NR sütunu eksik: ${name}.`, null, name);
      }
      if (!columns.has('nccode')) global('warn', 'nccode sütunu yok; bu dosyada işlem / makro kontrolü yapılamadı.', null, 'nccode');
      names.forEach((name, index) => {
        if (name && !KNOWN.has(name)) global('warn', 'Bu ek sütun için doğrulama kuralı yok; makineye özel kullanımını kontrol edin.', index + 1, result.headers[index], result.headers[index]);
      });
    }
    if (lines.length === 1) global('err', 'Başlık satırı var ancak parça kaydı bulunamadı.');

    const ids = new Map();
    const sequences = new Map();
    const bars = new Map();
    const closedBars = new Set();
    let previousBar = null;
    let previousId = null;
    for (const item of lines.slice(1)) {
      const row = item.text.split(result.delimiter);
      const issues = [];
      const get = name => String(row[columns.get(name)] ?? '').trim();
      const add = (level, field, msg) => issues.push({ row: item.line, col: columns.has(field) ? columns.get(field) + 1 : null, field, value: get(field), level, msg });
      result.rows.push(row);
      result.rowNumbers.push(item.line);
      result.rowIssues.push(issues);
      result.macros.push([]);
      if (row.length !== result.headers.length) {
        add('err', '-', `Satırda ${row.length} alan var; başlıkta ${result.headers.length} sütun bulunuyor. Boş alanları ve ayırıcıları kontrol edin.`);
        continue;
      }
      for (const name of REQUIRED) {
        if (columns.has(name) && get(name) === '') add('err', name, 'Temel makine alanı boş bırakılamaz.');
      }
      for (const [name, maximum] of [['id', 2147483647], ['ksn', 32767], ['ktn', 32767], ['ksnbar', 2147483647], ['ktnbar', 2147483647]]) {
        if (!columns.has(name) || !get(name)) continue;
        if (!integer(get(name)) || Number(get(name)) <= 0 || Number(get(name)) > maximum) {
          add('err', name, `1–${maximum} aralığında tam sayı bekleniyor. Boylarda son hane ondalıktır; 4710 = 471,0 mm.`);
        }
      }
      for (const name of ['l', 'r']) {
        if (!columns.has(name) || !get(name)) continue;
        const angles = get(name).split('|');
        const standard = angles.length === 1 || angles.length === 2;
        const arrow = angles.length === 5 && angles[2] === '';
        const values = arrow ? [angles[0], angles[1], angles[3], angles[4]] : angles;
        if ((!standard && !arrow) || values.some(value => !number(value.trim()))) {
          add('err', name, 'Geçersiz açı. Sayı, tilt|pivot veya tilt|pivot||mızrakTilt|mızrakPivot bekleniyor.');
        } else if (angles.length > 1) {
          add('warn', name, 'Birleşik açı gösterimi; pivot / mızrak seçeneklerini makine ayarlarıyla doğrulayın.');
        }
        // Machine-specific angle scaling and limits cannot be inferred from this file.
      }
      for (const name of ['width', 'height', 'reinfbar', 'isfix', 'colorcode', 'pos']) {
        if (columns.has(name) && get(name) && !/^[+-]?\d+$/.test(get(name))) {
          add('warn', name, 'Sayısal alan tam sayı olarak okunamayabilir; dosya ve makine ayarlarını kontrol edin.');
        }
      }
      const partLength = integer(get('ktnbar')) ? Number(get('ktnbar')) : NaN;
      if (columns.has('nccode')) {
        const checked = checkMacros(get('nccode'), partLength);
        checked.issues.forEach(issue => add(issue.level, 'nccode', issue.msg));
        result.macros[result.macros.length - 1] = checked.blocks;
      }
      if (integer(get('id'))) {
        const id = Number(get('id'));
        if (ids.has(id)) add('err', 'id', `Parça kimliği tekrar ediyor; ilk kayıt dosya satırı ${ids.get(id)}.`);
        else ids.set(id, item.line);
        if (previousId !== null && id < previousId) add('warn', 'id', 'Parça kimlikleri dosya sırasında artmıyor.');
        previousId = id;
      }
      if (integer(get('ksn')) && integer(get('ktn'))) {
        const key = Number(get('ksn')) + ':' + Number(get('ktn'));
        if (sequences.has(key)) add('err', 'ktn', `Aynı çubukta parça sırası tekrar ediyor; ilk kayıt dosya satırı ${sequences.get(key)}.`);
        else sequences.set(key, item.line);
      }
      if (integer(get('ksn')) && integer(get('ksnbar')) && Number(get('ksnbar')) > 0) {
        const key = Number(get('ksn'));
        const bar = bars.get(key);
        if (bar) {
          if (bar.length !== Number(get('ksnbar'))) add('err', 'ksnbar', `Aynı çubuk numarasında farklı çubuk boyu var; ilk kayıt dosya satırı ${bar.line}.`);
          if (get('mainprofile') !== bar.profile) add('warn', 'mainprofile', 'Aynı çubuk numarasında ana profil kodu değişiyor.');
          if (integer(get('ktn')) && Number(get('ktn')) !== bar.sequence + 1) add('warn', 'ktn', 'Çubuk içindeki parça sırası ardışık ilerlemiyor.');
          if (integer(get('ktn'))) bar.sequence = Number(get('ktn'));
        } else {
          bars.set(key, { length: Number(get('ksnbar')), profile: get('mainprofile'), line: item.line, sequence: Number(get('ktn')) });
          if (integer(get('ktn')) && Number(get('ktn')) !== 1) add('warn', 'ktn', 'Bu çubuğun ilk parça sırası 1 değil; liste devamı olup olmadığını kontrol edin.');
        }
        if (previousBar !== null && previousBar !== key) closedBars.add(previousBar);
        if (previousBar !== key && closedBars.has(key)) add('warn', 'ksn', 'Önceki çubuğa başka bir çubuktan sonra geri dönülüyor; kesim sırasını kontrol edin.');
        previousBar = key;
        if (Number.isFinite(partLength) && partLength > Number(get('ksnbar'))) add('warn', 'ktnbar', 'Parça boyu çubuk boyundan büyük; birim / ölçü paylarını kontrol edin.');
      }
    }
    return result;
  }

  return { FIELDS, REQUIRED, validate, checkMacros };
});
