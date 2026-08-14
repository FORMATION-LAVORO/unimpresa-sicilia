const UNITS = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const TEENS = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function hundred(n: number): string {
  if (n === 0) return "";
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 70) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return TENS[t];
    if (u === 1 && t !== 8) return `${TENS[t]}-et-un`;
    return `${TENS[t]}-${UNITS[u]}`;
  }
  if (n < 80) {
    const u = n - 70;
    if (u === 0) return "soixante-dix";
    if (u === 1) return "soixante-et-onze";
    return `soixante-${TEENS[u]}`;
  }
  const u = n % 10;
  if (u === 0) return "quatre-vingts";
  return `quatre-vingt-${UNITS[u]}`;
}

function thousand(n: number): string {
  if (n === 0) return "";
  if (n < 1000) return hundred(n);
  const t = Math.floor(n / 1000);
  const r = n % 1000;
  const prefix = t === 1 ? "mille" : `${hundred(t)} mille`;
  if (r === 0) return prefix;
  return `${prefix} ${hundred(r)}`;
}

export function numberToLetters(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return `moins ${numberToLetters(-n)}`;
  
  // Gérer les millions si nécessaire
  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    const r = n % 1000000;
    const prefix = m === 1 ? "un million" : `${thousand(m)} millions`;
    if (r === 0) return prefix;
    return `${prefix} ${thousand(r)}`;
  }
  
  return thousand(n);
}

// Formate avec espaces pour les milliers : 220000 → "220 000"
export function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Parse "220 000" ou "220000" → 220000
export function parseNumber(s: string): number {
  return parseInt(s.replace(/\s/g, ""), 10) || 0;
}
