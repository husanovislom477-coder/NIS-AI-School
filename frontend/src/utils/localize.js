/**
 * Localizes database-driven entities (e.g. branch, teacher, news, project, result)
 * Supports:
 * - Direct language suffix fields: titleEn, titleUz, titleRu
 * - Underscore language suffix fields: title_en, title_uz, title_ru
 * - Nested translations object: item.translations[lang][field]
 * - Safe fallback to English (en) -> Uzbek (uz) -> original field
 */
export function getLocalized(item, field, currentLang = 'en') {
  if (!item) return '';

  const lang = (currentLang || 'en').toLowerCase();
  const langCap = lang.charAt(0).toUpperCase() + lang.slice(1);

  // 1. Check exact localized field: e.g. nameEn, titleEn, descriptionEn
  const directCap = `${field}${langCap}`;
  if (item[directCap] !== undefined && item[directCap] !== null && item[directCap] !== '') {
    return item[directCap];
  }

  // 2. Check underscore format: e.g. name_en, title_en
  const directUnderscore = `${field}_${lang}`;
  if (item[directUnderscore] !== undefined && item[directUnderscore] !== null && item[directUnderscore] !== '') {
    return item[directUnderscore];
  }

  // 3. Check JSON translations field: item.translations?.[lang]?.[field]
  if (item.translations && typeof item.translations === 'object') {
    if (item.translations[lang] && item.translations[lang][field]) {
      return item.translations[lang][field];
    }
  }

  // 4. Fallback: English (en)
  if (lang !== 'en') {
    const enCap = `${field}En`;
    if (item[enCap]) return item[enCap];
    if (item[`${field}_en`]) return item[`${field}_en`];
    if (item.translations?.en?.[field]) return item.translations.en[field];
  }

  // 5. Fallback: Uzbek (uz)
  if (lang !== 'uz') {
    const uzCap = `${field}Uz`;
    if (item[uzCap]) return item[uzCap];
    if (item[`${field}_uz`]) return item[`${field}_uz`];
    if (item.translations?.uz?.[field]) return item.translations.uz[field];
  }

  // 6. Base field fallback (e.g. item.name, item.title, item.description)
  return item[field] || '';
}

export default getLocalized;
