import SSLCommerzPayment from 'sslcommerz-lts'

export const sslcz = new SSLCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID,
  process.env.SSLCOMMERZ_STORE_PASSWD,
  false,
)
