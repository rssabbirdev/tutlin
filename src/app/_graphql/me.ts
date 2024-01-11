import { CART } from './cart'

export const ME_QUERY = `query {
  meUser {
    user {
      id
      email
      phoneNumber
      district
      deliveryFullAddress
      name
      ${CART}
      roles
    }
    exp
  }
}`
