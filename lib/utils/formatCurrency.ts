export function formatCurrency(amountInUSD: number): string {
  const currency = typeof window !== 'undefined' ? (localStorage.getItem('devi_currency') || 'USD') : 'USD'
  
  let rate = 1
  let symbol = 'USD'
  let locale = 'en-US'
  
  if (currency === 'INR') {
    rate = 80 // 1 USD = 80 INR mock exchange rate
    symbol = 'INR'
    locale = 'en-IN'
  } else if (currency === 'EUR') {
    rate = 0.9 // 1 USD = 0.9 EUR mock exchange rate
    symbol = 'EUR'
    locale = 'de-DE'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: symbol,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amountInUSD * rate)
}
