import { PRODUCT } from './products'

export const GUESTORDERS = `
  query  GuestOrders {
    GuestOrders(limit: 300) {
      docs {
        id
      }
    }
  }
`

export const GUESTORDER = `
  query GuestOrder($id: String ) {
    GuestOrders(where: { id: { equals: $id}}) {
      docs {
        id
        orderedBy
        orderStatus
        paymentStatus
        paidAmount
        dueAmount
        total
        transactionId
        orderId
        valId
        items {
          product ${PRODUCT}
          title
          productPrice
        }
      }
    }
  }
`
