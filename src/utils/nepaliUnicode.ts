const romanToNepaliMap: { [key: string]: string } = {
  'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ii': 'ई', 'u': 'उ', 'uu': 'ऊ',
  'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
  'ka': 'क', 'kha': 'ख', 'ga': 'ग', 'gha': 'घ', 'nga': 'ङ',
  'cha': 'च', 'chha': 'छ', 'ja': 'ज', 'jha': 'झ', 'nya': 'ञ',
  'tta': 'ट', 'ttha': 'ठ', 'dda': 'ड', 'ddha': 'ढ', 'nna': 'ण',
  'ta': 'त', 'tha': 'थ', 'da': 'द', 'dha': 'ध', 'na': 'न',
  'pa': 'प', 'pha': 'फ', 'ba': 'ब', 'bha': 'भ', 'ma': 'म',
  'ya': 'य', 'ra': 'र', 'la': 'ल', 'wa': 'व', 'sha': 'श',
  'shha': 'ष', 'sa': 'स', 'ha': 'ह',
  'k': 'क्', 'kh': 'ख्', 'g': 'ग्', 'gh': 'घ्', 'ng': 'ङ्',
  'ch': 'च्', 'chh': 'छ्', 'j': 'ज्', 'jh': 'झ्', 'ny': 'ञ्',
  't': 'त्', 'th': 'थ्', 'd': 'द्', 'dh': 'ध्', 'n': 'न्',
  'p': 'प्', 'ph': 'फ्', 'b': 'ब्', 'bh': 'भ्', 'm': 'म्',
  'y': 'य्', 'r': 'र्', 'l': 'ल्', 'w': 'व्', 's': 'स्',
  'sh': 'श्', 'h': 'ह्'
};

export function convertToNepali(text: string): string {
  let result = text;

  // Sort by length (longest first) to avoid partial matches
  const sortedKeys = Object.keys(romanToNepaliMap).sort((a, b) => b.length - a.length);

  for (const roman of sortedKeys) {
    const nepali = romanToNepaliMap[roman];
    const regex = new RegExp(roman, 'gi');
    result = result.replace(regex, nepali);
  }

  return result;
}