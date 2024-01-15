import type { Settings } from '../payload-types'

export const calculateDeliveryFee = (b, s: Settings, t: number): number => {
  // b = body
  // s = settings
  // t = total
  let sum = 0
  if (t <= Number(s.freeShippingAmount) && Number(s.freeShippingAmount) !== 0) {
    sum = 0
  } else {
    if (b?.deliveryOption?.key === 'insideDhaka') {
      sum = s?.insideDhaka
    } else if (b?.deliveryOption?.key === 'outsideDhaka') {
      sum = s?.outsideDhaka
    }
  }
  return sum
}
