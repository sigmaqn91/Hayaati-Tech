// Country-aware default language (client only, no server call, no extra network request).
// The visitor's country is read from the device time zone (Asia/Kolkata -> IN, Asia/Riyadh -> SA ...),
// which works instantly and offline. A language the visitor picked by hand always wins over this default.

import type { SupportedLanguage } from '@/locales/types';

const SUPPORTED: SupportedLanguage[] = [
  'en', 'hi', 'bn', 'ur', 'ar', 'pa', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'ne', 'vi', 'fr',
  'de', 'es', 'pt', 'it', 'zh', 'ja', 'ko', 'ru', 'tr', 'id', 'nl', 'pl', 'fa', 'th', 'sw',
] as SupportedLanguage[];

// IANA time zone -> ISO country code
const TZ_COUNTRY: Record<string, string> = {
  // South Asia
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Dacca': 'BD',
  'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Colombo': 'LK', 'Asia/Thimphu': 'BT', 'Indian/Maldives': 'MV',
  'Asia/Kabul': 'AF',
  // Middle East / North Africa (Arabic)
  'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM', 'Asia/Aden': 'YE', 'Asia/Baghdad': 'IQ', 'Asia/Amman': 'JO', 'Asia/Beirut': 'LB',
  'Asia/Damascus': 'SY', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS', 'Africa/Cairo': 'EG', 'Africa/Tripoli': 'LY',
  'Africa/Tunis': 'TN', 'Africa/Algiers': 'DZ', 'Africa/Casablanca': 'MA', 'Africa/El_Aaiun': 'MA',
  'Africa/Khartoum': 'SD', 'Africa/Nouakchott': 'MR', 'Africa/Djibouti': 'DJ', 'Indian/Comoro': 'KM',
  'Asia/Tehran': 'IR', 'Asia/Jerusalem': 'IL', 'Asia/Tel_Aviv': 'IL',
  // East / South-East Asia
  'Asia/Shanghai': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Harbin': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Hong_Kong': 'HK',
  'Asia/Macau': 'MO', 'Asia/Taipei': 'TW', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Pyongyang': 'KP',
  'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID',
  'Asia/Jayapura': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY',
  'Asia/Kuching': 'MY', 'Asia/Manila': 'PH', 'Asia/Yangon': 'MM', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA',
  'Asia/Brunei': 'BN', 'Asia/Dili': 'TL',
  // Central Asia / Russia / Turkey
  'Europe/Moscow': 'RU', 'Europe/Kaliningrad': 'RU', 'Europe/Samara': 'RU', 'Europe/Volgograd': 'RU',
  'Europe/Saratov': 'RU', 'Europe/Ulyanovsk': 'RU', 'Europe/Astrakhan': 'RU', 'Europe/Kirov': 'RU',
  'Asia/Yekaterinburg': 'RU', 'Asia/Omsk': 'RU', 'Asia/Novosibirsk': 'RU', 'Asia/Krasnoyarsk': 'RU',
  'Asia/Irkutsk': 'RU', 'Asia/Yakutsk': 'RU', 'Asia/Vladivostok': 'RU', 'Asia/Magadan': 'RU',
  'Asia/Kamchatka': 'RU', 'Asia/Barnaul': 'RU', 'Asia/Tomsk': 'RU', 'Asia/Novokuznetsk': 'RU', 'Asia/Chita': 'RU',
  'Asia/Sakhalin': 'RU', 'Asia/Srednekolymsk': 'RU', 'Asia/Anadyr': 'RU', 'Europe/Minsk': 'BY',
  'Asia/Almaty': 'KZ', 'Asia/Qostanay': 'KZ', 'Asia/Aqtobe': 'KZ', 'Asia/Aqtau': 'KZ', 'Asia/Atyrau': 'KZ',
  'Asia/Oral': 'KZ', 'Asia/Qyzylorda': 'KZ', 'Asia/Bishkek': 'KG', 'Asia/Tashkent': 'UZ', 'Asia/Samarkand': 'UZ',
  'Asia/Dushanbe': 'TJ', 'Asia/Ashgabat': 'TM', 'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR',
  // Europe
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Monaco': 'MC', 'Europe/Brussels': 'BE',
  'Europe/Luxembourg': 'LU', 'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/Vaduz': 'LI', 'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Africa/Ceuta': 'ES',
  'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT', 'Europe/Rome': 'IT',
  'Europe/San_Marino': 'SM', 'Europe/Vatican': 'VA', 'Europe/Amsterdam': 'NL', 'Europe/Warsaw': 'PL',
  'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA', 'Europe/Chisinau': 'MD', 'Europe/Prague': 'CZ', 'Europe/Bratislava': 'SK',
  'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Athens': 'GR',
  'Europe/Belgrade': 'RS', 'Europe/Zagreb': 'HR', 'Europe/Ljubljana': 'SI', 'Europe/Sarajevo': 'BA',
  'Europe/Skopje': 'MK', 'Europe/Tirane': 'AL', 'Europe/Podgorica': 'ME', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Tallinn': 'EE',
  'Europe/Riga': 'LV', 'Europe/Vilnius': 'LT', 'Atlantic/Reykjavik': 'IS', 'Europe/Malta': 'MT',
  'Asia/Nicosia': 'CY', 'Europe/Andorra': 'AD', 'Europe/Gibraltar': 'GI',
  // Africa (others)
  'Africa/Nairobi': 'KE', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG', 'Africa/Kigali': 'RW',
  'Africa/Bujumbura': 'BI', 'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Johannesburg': 'ZA',
  'Africa/Addis_Ababa': 'ET', 'Africa/Mogadishu': 'SO', 'Africa/Dakar': 'SN', 'Africa/Abidjan': 'CI',
  'Africa/Bamako': 'ML', 'Africa/Niamey': 'NE', 'Africa/Ouagadougou': 'BF', 'Africa/Conakry': 'GN',
  'Africa/Lome': 'TG', 'Africa/Porto-Novo': 'BJ', 'Africa/Douala': 'CM', 'Africa/Libreville': 'GA',
  'Africa/Kinshasa': 'CD', 'Africa/Lubumbashi': 'CD', 'Africa/Brazzaville': 'CG', 'Africa/Ndjamena': 'TD',
  'Africa/Bangui': 'CF', 'Indian/Antananarivo': 'MG', 'Africa/Luanda': 'AO', 'Africa/Maputo': 'MZ',
  'Africa/Bissau': 'GW', 'Africa/Sao_Tome': 'ST', 'Atlantic/Cape_Verde': 'CV', 'Africa/Harare': 'ZW',
  'Africa/Lusaka': 'ZM', 'Africa/Gaborone': 'BW', 'Africa/Windhoek': 'NA', 'Africa/Blantyre': 'MW',
  // Americas
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Tijuana': 'MX', 'America/Cancun': 'MX',
  'America/Merida': 'MX', 'America/Chihuahua': 'MX', 'America/Hermosillo': 'MX', 'America/Mazatlan': 'MX',
  'America/Matamoros': 'MX', 'America/Bahia_Banderas': 'MX', 'America/Ciudad_Juarez': 'MX', 'America/Ojinaga': 'MX',
  'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL',
  'America/Caracas': 'VE', 'America/Guayaquil': 'EC', 'America/La_Paz': 'BO', 'America/Asuncion': 'PY',
  'America/Montevideo': 'UY', 'America/Buenos_Aires': 'AR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Argentina/Cordoba': 'AR', 'America/Argentina/Mendoza': 'AR', 'America/Argentina/Salta': 'AR',
  'America/Argentina/Jujuy': 'AR', 'America/Argentina/Tucuman': 'AR', 'America/Argentina/Catamarca': 'AR',
  'America/Argentina/La_Rioja': 'AR', 'America/Argentina/San_Juan': 'AR', 'America/Argentina/San_Luis': 'AR',
  'America/Argentina/Rio_Gallegos': 'AR', 'America/Argentina/Ushuaia': 'AR', 'America/Guatemala': 'GT',
  'America/Havana': 'CU', 'America/Santo_Domingo': 'DO', 'America/Tegucigalpa': 'HN', 'America/El_Salvador': 'SV',
  'America/Managua': 'NI', 'America/Costa_Rica': 'CR', 'America/Panama': 'PA', 'America/Puerto_Rico': 'PR',
  'America/Sao_Paulo': 'BR', 'America/Bahia': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR',
  'America/Manaus': 'BR', 'America/Belem': 'BR', 'America/Cuiaba': 'BR', 'America/Porto_Velho': 'BR',
  'America/Rio_Branco': 'BR', 'America/Maceio': 'BR', 'America/Araguaina': 'BR', 'America/Campo_Grande': 'BR',
  'America/Boa_Vista': 'BR', 'America/Santarem': 'BR', 'America/Noronha': 'BR', 'America/Eirunepe': 'BR',
  'America/Paramaribo': 'SR', 'America/Curacao': 'CW', 'America/Aruba': 'AW',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA', 'America/Montreal': 'CA',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU', 'Australia/Hobart': 'AU', 'Australia/Darwin': 'AU', 'Pacific/Auckland': 'NZ',
};

// ISO country -> one of the site's 30 languages
const COUNTRY_LANG = {
  IN: 'hi', PK: 'ur', BD: 'bn', NP: 'ne', AF: 'fa', IR: 'fa',
  SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', YE: 'ar', IQ: 'ar', JO: 'ar', LB: 'ar',
  SY: 'ar', PS: 'ar', EG: 'ar', LY: 'ar', TN: 'ar', DZ: 'ar', MA: 'ar', SD: 'ar', MR: 'ar', DJ: 'ar', KM: 'ar',
  CN: 'zh', HK: 'zh', MO: 'zh', TW: 'zh', JP: 'ja', KR: 'ko', TH: 'th', VN: 'vi', ID: 'id',
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', TR: 'tr',
  FR: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', NE: 'fr', BF: 'fr', GN: 'fr', TG: 'fr', BJ: 'fr',
  CM: 'fr', GA: 'fr', CD: 'fr', CG: 'fr', TD: 'fr', CF: 'fr', MG: 'fr', BI: 'fr', RW: 'fr',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  ES: 'es', MX: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', AR: 'es',
  GT: 'es', CU: 'es', DO: 'es', HN: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', PR: 'es',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', GW: 'pt', ST: 'pt', CV: 'pt', TL: 'pt',
  IT: 'it', SM: 'it', VA: 'it', NL: 'nl', BE: 'nl', SR: 'nl', CW: 'nl', AW: 'nl', PL: 'pl',
  KE: 'sw', TZ: 'sw', UG: 'sw',
  US: 'en', GB: 'en', IE: 'en', AU: 'en', NZ: 'en', CA: 'en', SG: 'en', ZA: 'en', NG: 'en', GH: 'en', PH: 'en',
  LK: 'en', MY: 'en', BT: 'en', MV: 'en', ZW: 'en', ZM: 'en', BW: 'en', NA: 'en', MW: 'en', MT: 'en', CY: 'en',
} as Record<string, SupportedLanguage>;

export function detectCountry(): string | null {
  if (typeof Intl === 'undefined') return null;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
    // US / generic English zones
    if (/^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Indiana|Kentucky|Boise|Juneau|Sitka|Nome|Adak|Menominee|North_Dakota|Metlakatla|Yakutat)|Pacific\/Honolulu|US\/)/.test(tz)) return 'US';
  } catch {}
  return null;
}

function isSupported(code: string): code is SupportedLanguage {
  return (SUPPORTED as string[]).includes(code);
}

/** Default website language for a first-time visitor (country first, then the browser language, else English). */
export function detectDefaultLanguage(): SupportedLanguage {
  const country = detectCountry();
  if (country && COUNTRY_LANG[country]) return COUNTRY_LANG[country];
  try {
    const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || [];
    for (const l of list) {
      const base = String(l || '').toLowerCase().split('-')[0];
      if (isSupported(base)) return base;
    }
  } catch {}
  return 'en' as SupportedLanguage;
}

/** Inline (pre-hydration) copy of the same logic, so the right language starts loading before React even boots. */
export const GEO_BOOT_SCRIPT = `(function(){try{var s=null;try{s=localStorage.getItem('hayaati_lang')}catch(e){}var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'';var T=${JSON.stringify(TZ_COUNTRY)};var C=${JSON.stringify(COUNTRY_LANG)};var S=${JSON.stringify(SUPPORTED)};var c=T[tz]||(/^(America\\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Indiana|Kentucky|Boise)|Pacific\\/Honolulu|US\\/)/.test(tz)?'US':null);var l=s&&S.indexOf(s)>=0?s:null;if(!l){l=c?(C[c]||null):null;if(!l){var n=(navigator.languages&&navigator.languages[0])||navigator.language||'en';n=String(n).toLowerCase().split('-')[0];l=S.indexOf(n)>=0?n:'en'}}var d=document.documentElement;d.lang=l;if(l==='ar'||l==='ur'){d.dir='rtl'}if(l!=='en'){d.setAttribute('data-lang-pending','');setTimeout(function(){d.removeAttribute('data-lang-pending')},1200)}}catch(e){}})();`;
