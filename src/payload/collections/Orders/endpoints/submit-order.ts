import type { PayloadHandler } from 'payload/config'

import type { CartItems, Order, Product } from '../../../payload-types'

// this endpoint creates a `PaymentIntent` with the items in the cart
// to do this, we loop through the items in the cart and lookup the product in Stripe
// we then add the price of the product to the total
// once completed, we pass the `client_secret` of the `PaymentIntent` back to the client which can process the payment
export const submitOrder: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload } = req
  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user?.id,
  })
  if (!fullUser) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  try {
    interface OrderProductsType {
      product: string | Product
      quantity?: number | null
      id?: string | null
      price?: number | null
    }
    let orderProducts: OrderProductsType[] = []
    await Promise.all(
      fullUser?.cart?.items?.map(async item => {
        const databaseItem = await payload.findByID({
          collection: 'products',
          id: item?.product?.id,
        })
        orderProducts.push({
          product: item?.id,
          quantity: item?.quantity,
          price: databaseItem?.productPrice * item?.quantity,
        })

        return null
      }),
    )
    // create order data
    // The created order document is returned
    await payload.create({
      collection: 'orders',
      data: {
        orderedBy: fullUser.id,
        items: orderProducts,
        orderStatus: 'Pending',
        total: orderProducts.reduce((acc, item) => acc + item.price, 0),
      },
    })

    console.log('orderData', {
      orderedBy: fullUser.id,
      items: orderProducts,
      orderStatus: 'Pending',
      total: orderProducts.reduce((acc, item) => acc + item.price, 0),
    })

    // let total = 0
    const hasItems = fullUser?.cart?.items?.length > 0
    if (!hasItems) {
      throw new Error('No items in cart')
    }
    // for each item in cart, lookup the product in Stripe and add its price to the total
    // await Promise.all(
    //   fullUser?.cart?.items?.map(async (item: CartItems[0]): Promise<null> => {
    //     const { product, quantity } = item
    //     if (!quantity) {
    //       return null
    //     }
    //     if (typeof product === 'string' || !product?.stripeProductID) {
    //       throw new Error('No Stripe Product ID')
    //     }
    //     const prices = await stripe.prices.list({
    //       product: product.stripeProductID,
    //       limit: 100,
    //       expand: ['data.product'],
    //     })
    //     if (prices.data.length === 0) {
    //       res.status(404).json({ error: 'There are no items in your cart to checkout with' })
    //       return null
    //     }
    //     const price = prices.data[0]
    //     total += price.unit_amount * quantity
    //     return null
    //   }),
    // )
    // if (total === 0) {
    //   throw new Error('There is nothing to pay for, add some items to your cart and try again.')
    // }

    res.send({ client_secret: '' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    res.json({ error: message })
  }
}
