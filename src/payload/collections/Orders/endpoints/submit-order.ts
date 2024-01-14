import type { PayloadHandler } from 'payload/config'
import SSLCommerzPayment from 'sslcommerz-lts'

import type { CartItems, Order, Product } from '../../../payload-types'

interface OrderProductsType {
  product: string | Product
  quantity?: number | null
  id?: string | null
  price?: number | null
}

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
    const hasItems = fullUser?.cart?.items?.length > 0
    if (!hasItems) {
      throw new Error('No items in cart')
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
        paymentStatus: 'Unpaid',
        paidAmount: 0,
        dueAmount: orderProducts.reduce((acc, item) => acc + item.price, 0),
      },
    })

    const paymentData = {
      total_amount: orderProducts.reduce((acc, item) => acc + item.price, 0),
      currency: 'BDT',
      tran_id: crypto.randomUUID(), // use unique tran_id for each api call
      success_url: 'http://localhost:3030/success',
      fail_url: 'http://localhost:3030/fail',
      cancel_url: 'http://localhost:3030/cancel',
      ipn_url: 'http://localhost:3030/ipn',
      shipping_method: 'Courier',
      product_name: 'Gadgets',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: fullUser.name,
      cus_email: fullUser.email,
      cus_add1: fullUser.deliveryFullAddress,
      cus_add2: '',
      cus_city: fullUser.district,
      cus_state: '',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: fullUser.phoneNumber,
      cus_fax: 'fullUser.phoneNumber',
      ship_name: fullUser.name,
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    }

    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWD,
      false,
    )
    await sslcz.init(paymentData).then(apiResponse => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL
      // res.redirect(GatewayPageURL)
      console.log('Redirecting to: ', GatewayPageURL)
      res.send({ GatewayPageURL })
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    res.json({ error: message })
  }
}
