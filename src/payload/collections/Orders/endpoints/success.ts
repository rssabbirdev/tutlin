import payload from 'payload'
import type { PayloadHandler } from 'payload/config'

import { sslcz } from '../../../sslcommerz/sslcz'

export const successHandler: PayloadHandler = async (req, res): Promise<void> => {
  const { user_id, order_id, transaction_id } = req.query
  const { tran_id, val_id, status, amount } = req.body
  if (!user_id && !order_id && !transaction_id) {
    res.status(401).send('Invalid Request')
    return
  }
  if (tran_id !== transaction_id) {
    res.status(401).send('Invalid Transaction ID')
    return
  }
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user_id.toString(),
  })
  if (!fullUser) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const orders = payload.db.collections.orders
  const order = await orders.findOne({ orderId: order_id })
  sslcz.validate({ val_id }).then(async data => {
    if (
      data.status !== status &&
      tran_id !== data.tran_id &&
      val_id !== data.val_id &&
      order?.paidAmount !== data.amount
    ) {
      res.status(401).json({ error: 'Invalid Transaction, Please contact with us.' })
      return
    }
    console.log('sample order update data', {
      valId: data.val_id,
      transactionId: data.tran_id,
      paidAmount: Number(order.paidAmount) + Number(data.amount),
      dueAmount: Number(order.total) - (Number(order.paidAmount) + Number(data.amount)),
      paymentStatus:
        Number(order.total) - (Number(order.paidAmount) + Number(data.amount)) === 0
          ? 'Paid'
          : 'Partial Paid',
      orderStatus: Number(order.paidAmount) ? order.orderStatus : 'Processing',
    })
    await orders.updateOne(
      { orderId: order_id },
      {
        $set: {
          valId: data.val_id,
          transactionId: data.tran_id,
          paidAmount: Number(order.paidAmount) + Number(data.amount),
          dueAmount: Number(order.total) - (Number(order.paidAmount) + Number(data.amount)),
          paymentStatus:
            Number(order.total) - (Number(order.paidAmount) + Number(data.amount)) === 0
              ? 'Paid'
              : 'Partial Paid',
          orderStatus: Number(order.paidAmount) ? order.orderStatus : 'Processing',
        },
      },
      { upsert: false },
    )
    return
  })

  res.redirect(
    `${
      process.env.PAYLOAD_PUBLIC_SERVER_URL
    }/order-confirmation?order_id=${order_id}&transaction_id=${transaction_id}&order_status=${
      Number(order.paidAmount) ? order.orderStatus : 'Processing'
    }&payment_status=${
      Number(order.total) - (Number(order.paidAmount) + Number(amount)) === 0
        ? 'Paid'
        : 'Partial Paid'
    }`,
  )
  try {
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // payload.logger.error(message)
    res.json({ error: message })
  }
}

// {
//     tran_id: '365bf876-f10e-4e82-a105-0bf46f52a1a0',
//     val_id: '240114181913ziteHDtNBn9maxN',
//     amount: '20.00',
//     card_type: 'BKASH-BKash',
//     store_amount: '19.50',
//     card_no: '',
//     bank_tran_id: '2401141819130Xjd24qvC6HMeJB',
//     status: 'VALID',
//     tran_date: '2024-01-14 18:18:44',
//     error: '',
//     currency: 'BDT',
//     card_issuer: 'BKash Mobile Banking',
//     card_brand: 'MOBILEBANKING',
//     card_sub_brand: 'Classic',
//     card_issuer_country: 'Bangladesh',
//     card_issuer_country_code: 'BD',
//     store_id: 'xyz65a1a4e7850ce',
//     verify_sign: '5daf21b36ba0a93782c1681750a46ed9',
//     verify_key: 'amount,bank_tran_id,base_fair,card_brand,card_issuer,card_issuer_country,card_issuer_country_code,card_no,card_sub_brand,card_type,currency,currency_amount,currency_rate,currency_type,error,risk_level,risk_title,status,store_amount,store_id,tran_date,tran_id,val_id,value_a,value_b,value_c,value_d',
//     verify_sign_sha2: '76355b747cd02b8a15ae1e50db6732817790fed1f1d5c306253a8dfcd87771c3',
//     currency_type: 'BDT',
//     currency_amount: '20.00',
//     currency_rate: '1.0000',
//     base_fair: '0.00',
//     value_a: '',
//     value_b: '',
//     value_c: '',
//     value_d: '',
//     subscription_id: '',
//     risk_level: '0',
//     risk_title: 'Safe'
//   }
