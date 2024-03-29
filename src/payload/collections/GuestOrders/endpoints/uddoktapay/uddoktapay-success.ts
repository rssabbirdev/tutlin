import payload from 'payload'
import type { PayloadHandler } from 'payload/config'

export const uddoktapaySuccessHandler: PayloadHandler = async (req, res): Promise<void> => {
  const { order_id, transaction_id } = req.query
  if (!order_id && !transaction_id) {
    res.status(401).send('Invalid Request')
    return
  }
  //   if (tran_id !== transaction_id) {
  //     res.status(401).send('Invalid Transaction ID')
  //     return
  //   }

  const orders = payload.db.collections.guestorders
  const order = await orders.findOne({ orderId: order_id })

  fetch(`${process.env.UDDOKTAPAY_BASE_URL}/api/verify-payment`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'RT-UDDOKTAPAY-API-KEY': process.env.UDDOKTAPAY_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ invoice_id: req?.body?.invoice_id }),
  })
    .then(response => response.json())
    .then(async data => {
      // if (
      //   data?.status !== 'COMPLETED' &&
      //   data?.invoice_id !== req.body.invoice_id &&
      //   order?.paidAmount !== data.amount
      // ) {
      //   res.status(401).json({ error: 'Invalid Transaction, Please contact with us.' })
      //   console.log(order, data)
      //   return
      // }
      if (data?.status === 'COMPLETED') {
        await orders.updateOne(
          { orderId: order_id },
          {
            $set: {
              valId: data.invoice_id,
              transactionId: data.transaction_id,
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
        res.redirect(
          `${
            process.env.PAYLOAD_PUBLIC_SERVER_URL
          }/order-confirmation?order_id=${order_id}&transaction_id=${
            data.transaction_id
          }&order_status=${
            Number(order.paidAmount) ? order.orderStatus : 'Processing'
          }&payment_status=${
            Number(order.total) - (Number(order.paidAmount) + Number(data.amount)) === 0
              ? 'Paid'
              : 'Partial Paid'
          }`,
        )
      } else if (data?.status === 'PENDING') {
        await orders.updateOne(
          { orderId: order_id },
          {
            $set: {
              valId: data.invoice_id,
              transactionId: data.transaction_id,
              paidAmount: Number(order.paidAmount) + Number(data.amount),
              dueAmount: Number(order.total) - (Number(order.paidAmount) + Number(data.amount)),
              paymentStatus: 'Pending',
              orderStatus: order.orderStatus,
            },
          },
          { upsert: false },
        )
        res.redirect(
          `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/order-confirmation?order_id=${order_id}&transaction_id=${data.transaction_id}&order_status=Pending&payment_status=Pending`,
        )
      }
    })

  try {
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // payload.logger.error(message)
    res.json({ error: message })
  }
}
