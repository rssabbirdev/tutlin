'use client'

import React, { Fragment, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '../../../_components/Button'
import { Message } from '../../../_components/Message'
import { useCart } from '../../../_providers/Cart'

import classes from './index.module.scss'

export const OrderConfirmationPage: React.FC<{}> = () => {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('order_id')
  const transactionId = searchParams.get('transaction_id')
  const paymentStatus = searchParams.get('payment_status')
  const orderStatus = searchParams.get('order_status')
  const error = searchParams.get('error')

  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div>
      {error ? (
        <Fragment>
          <Message error={error} />
          <p>
            {`Your payment was successful but there was an error processing your order. Please contact us to resolve this issue.`}
          </p>
          <div className={classes.actions}>
            <Button href="/account" label="View account" appearance="primary" />
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/orders`}
              label="View all orders"
              appearance="secondary"
            />
          </div>
        </Fragment>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h1>Thank you for your order!</h1>
          {paymentStatus !== 'Unpaid' && <p>{`We received your payment`}</p>}
          <p>
            {`Your order has been ${orderStatus?.toLowerCase()}. You will receive an email confirmation shortly.`}
          </p>
          <div>
            <h4>Order Details</h4>
            <p>Order ID : {orderID}</p>
            {transactionId !== 'null' && <p>Transaction ID : {transactionId}</p>}
            <p>Payment Status : {paymentStatus}</p>
            <p>Order Status : {orderStatus}</p>
          </div>
          <div className={classes.actions}>
            {/* <Button href={`/account/orders/${orderID}`} label="View order" appearance="primary" /> */}
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`}
              label="View all orders"
              appearance="primary"
            />
          </div>
        </div>
      )}
    </div>
  )
}
