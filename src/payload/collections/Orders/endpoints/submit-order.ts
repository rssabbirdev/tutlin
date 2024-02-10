import orderIdGenerator from 'order-id'
import type { PayloadHandler } from 'payload/config'

import { fetchSettings } from '../../../../app/_api/fetchGlobals'
import type { Product, Settings } from '../../../payload-types'
import { sslcz } from '../../../sslcommerz/sslcz'
import { calculateDeliveryFee } from '../../../utilities/calculateDeliveryFee'

interface OrderProductsType {
  product: string | Product
  quantity?: number | null
  id?: string | null
  price?: number | null
}

export const submitOrder: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload, body } = req
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
  let settings: Settings | null = null

  try {
    settings = await fetchSettings()
    const hasItems = fullUser?.cart?.items?.length > 0
    if (!hasItems) {
      throw new Error('No items in cart')
    }
    let orderProducts: OrderProductsType[] = []
    await Promise.all(
      fullUser?.cart?.items?.map(async item => {
        const databaseItem = await payload.findByID({
          collection: 'products',
          // @ts-expect-error
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
    const generateOrderId = orderIdGenerator('order').generate()
    const orderId = orderIdGenerator('order').getTime(generateOrderId)
    const total = orderProducts.reduce((acc, item) => acc + item.price, 0)
    const deliveryFee = calculateDeliveryFee(body, settings, total)
    const totalAmountWithDeliveryCharge = total + deliveryFee
    await payload.create({
      collection: 'orders',
      data: {
        orderedBy: fullUser.id,
        orderId: orderId.toString(),
        items: orderProducts,
        orderStatus: 'Pending',
        total: totalAmountWithDeliveryCharge,
        paymentStatus: 'Unpaid',
        paidAmount: 0,
        dueAmount: totalAmountWithDeliveryCharge,
        phoneNumber: body?.phoneNumber,
        email: body?.email,
        district: body?.district,
        deliveryFullAddress: body?.deliveryFullAddress,
        paymentOption: body?.paymentOption,
        deliveryOption: body?.deliveryOption.key,
        deliveryFee:
          (body?.deliveryOption?.key === 'insideDhaka' && settings?.insideDhaka) ||
          (body?.deliveryOption?.key === 'outsideDhaka' && settings?.outsideDhaka),
      },
    })
    await payload.update({
      collection: 'users',
      id: fullUser?.id,
      data: {
        phoneNumber: body?.phoneNumber,
        district: body?.district,
        deliveryFullAddress: body?.deliveryFullAddress,
      },
    })
    if (body?.paymentOption === 'CashOnDelivery') {
      res.send({
        orderId,
        total: totalAmountWithDeliveryCharge,
        paymentStatus: 'Unpaid',
        orderStatus: 'Pending',
        paidAmount: 0,
        dueAmount: totalAmountWithDeliveryCharge,
      })
    } else if (body?.paymentOption === 'SSLCommerz') {
      const transactionId = crypto.randomUUID()
      const paymentData = {
        total_amount: totalAmountWithDeliveryCharge,
        currency: 'BDT',
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/sslcommerz-success?user_id=${fullUser?.id}&order_id=${orderId}&transaction_id=${transactionId}`,
        fail_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/fail`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cancel`,
        ipn_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/ipn`,
        shipping_method: 'Courier',
        product_name: orderProducts.reduce(
          // @ts-expect-error
          (acc, product) => acc + `${product?.product?.title},`,
          '',
        ),
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
        cus_fax: '',
        ship_name: fullUser.name,
        ship_add1: fullUser.deliveryFullAddress,
        ship_add2: 'Dhaka',
        ship_city: fullUser.district,
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      }

      await sslcz.init(paymentData).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        // res.redirect(GatewayPageURL)
        console.log('Redirecting to: ', GatewayPageURL)
        res.send({ GatewayPageURL })
      })
    } else if (body?.paymentOption === 'Bkash') {
    } else if (body?.paymentOption === 'UddoktaPay') {
      const transactionId = crypto.randomUUID()
      const paymentData = {
        full_name: fullUser.name,
        email: fullUser.email,
        amount: body?.isAdvancedPayment
          ? settings?.advancedPaymentAmount
          : totalAmountWithDeliveryCharge,
        metadata: { user_id: fullUser?.id, order_id: orderId, transaction_id: transactionId },
        return_type: 'POST',
        redirect_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/uddoktapay-success?user_id=${fullUser?.id}&order_id=${orderId}&transaction_id=${transactionId}`,
        cancel_url: process.env.NEXT_PUBLIC_SERVER_URL,
        webhook_url: 'https://your-domain.com/ipn',
      }
      fetch(`${process.env.UDDOKTAPAY_BASE_URL}/api/checkout-v2`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'RT-UDDOKTAPAY-API-KEY': process.env.UDDOKTAPAY_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          res.send({ GatewayPageURL: data?.payment_url })
        })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    res.json({ error: message })
  }
}
