/**
 * Funciones de formateo para números, porcentajes y otros datos
 */

/**
 * Formatea un número entero con separadores de miles
 * @param {number} n - Número a formatear
 * @param {string} locale - Locale para formateo (default: 'es-MX')
 * @returns {string} Número formateado o 'N/A'
 */
export function formatInteger(n, locale = 'es-MX') {
  return Number.isFinite(n) ? n.toLocaleString(locale) : 'N/A';
}

/**
 * Formatea un porcentaje redondeado
 * @param {number} p - Porcentaje a formatear
 * @returns {string} Porcentaje formateado o 'N/A'
 */
export function formatPercent(p) {
  return Number.isFinite(p) ? `${Math.round(p)}%` : 'N/A';
}

/**
 * Formatea un porcentaje con decimales
 * @param {number} p - Porcentaje a formatear
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Porcentaje formateado o 'N/A'
 */
export function formatPercentDecimal(p, decimals = 1) {
  return Number.isFinite(p) ? `${p.toFixed(decimals)}%` : 'N/A';
}

/**
 * Limita un porcentaje entre 0 y 100
 * @param {number} p - Porcentaje a limitar
 * @returns {number} Porcentaje limitado o NaN
 */
export function clampPercent(p) {
  return Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : NaN;
}

/**
 * Formatea un número con decimales
 * @param {number} n - Número a formatear
 * @param {number} decimals - Número de decimales (default: 2)
 * @param {string} locale - Locale para formateo (default: 'es-MX')
 * @returns {string} Número formateado o 'N/A'
 */
export function formatDecimal(n, decimals = 2, locale = 'es-MX') {
  return Number.isFinite(n) ? n.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) : 'N/A';
}

/**
 * Formatea un valor monetario
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @param {string} locale - Locale para formateo (default: 'en-US')
 * @returns {string} Valor formateado o 'N/A'
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return Number.isFinite(amount) ? amount.toLocaleString(locale, {
    style: 'currency',
    currency: currency
  }) : 'N/A';
}

/**
 * Formatea un número grande con sufijos (K, M, B)
 * @param {number} n - Número a formatear
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Número formateado con sufijo
 */
export function formatLargeNumber(n, decimals = 1) {
  if (!Number.isFinite(n)) return 'N/A';
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  
  if (tier === 0) return n.toString();
  
  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = n / scale;
  
  return scaled.toFixed(decimals) + suffix;
}

/**
 * Formatea un cambio porcentual con signo
 * @param {number} change - Cambio a formatear (como decimal, ej: 0.188 = 18.8%)
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Cambio formateado con signo
 */
export function formatChange(change, decimals = 1) {
  if (!Number.isFinite(change)) return 'N/A';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${(change * 100).toFixed(decimals)}%`;
}

/**
 * Formatea una edad con sufijo "años"
 * @param {number} age - Edad a formatear
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Edad formateada
 */
export function formatAge(age, decimals = 1) {
  if (!Number.isFinite(age)) return 'N/A';
  return `${age.toFixed(decimals)} años`;
}

