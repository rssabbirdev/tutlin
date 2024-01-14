'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Input } from '../../../_components/Input'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { useTheme } from '../../../_providers/Theme'
import cssVariables from '../../../cssVariables'
import { CheckoutForm } from '../CheckoutForm'
import { CheckoutItem } from '../CheckoutItem'

import classes from './index.module.scss'

type FormData = {
  name: string
  email: string
  phoneNumber: string
  district: string
  deliveryFullAddress: string
}

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: { productsPage },
  } = props
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<FormData>()

  const { user } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const hasMadePaymentIntent = React.useRef(false)
  const { theme } = useTheme()

  const { cart, cartIsEmpty, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)

  const handleOrderSubmit = (data: FormData) => {
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/submit-order`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false)
        window.location.href = data.GatewayPageURL
      })
  }

  useEffect(() => {
    if (user !== null && cartIsEmpty) {
      router.push('/cart')
    }
  }, [router, user, cartIsEmpty])

  if (!user) return null

  return (
    <Fragment>
      {cartIsEmpty && (
        <div>
          {'Your '}
          <Link href="/cart">cart</Link>
          {' is empty.'}
          {typeof productsPage === 'object' && productsPage?.slug && (
            <Fragment>
              {' '}
              <Link href={`/${productsPage.slug}`}>Continue shopping?</Link>
            </Fragment>
          )}
        </div>
      )}
      {!cartIsEmpty && (
        <form onSubmit={handleSubmit(handleOrderSubmit)}>
          <div>
            <h4>Shipping Details</h4>
            <div className={classes.shippingInputs}>
              <Input
                name="name"
                label="Full Name"
                required
                register={register}
                error={errors.name}
                type="text"
                placeholder="আপনার নাম *"
                hideLabel={true}
              />
              <Input
                name="phoneNumber"
                label="Phone Number"
                required
                register={register}
                error={errors.phoneNumber}
                type="text"
                placeholder="মোবাইল নাম্বার *"
                hideLabel={true}
              />
              <Input
                name="district"
                label="District"
                required
                register={register}
                error={errors.district}
                type="text"
                placeholder="আপনার শহর *"
                hideLabel={true}
              />
              <Input
                name="deliveryFullAddress"
                label="Delivery Full Address"
                required
                register={register}
                error={errors.deliveryFullAddress}
                type="text"
                placeholder="আপনার সম্পুর্ণ ঠিকানা *"
                hideLabel={true}
              />
            </div>
          </div>
          <div className={classes.items}>
            <div className={classes.header}>
              <p>Products</p>
              <div className={classes.headerItemDetails}>
                <p></p>
                <p className={classes.quantity}>Quantity</p>
              </div>
              <p className={classes.subtotal}>Subtotal</p>
            </div>

            <ul>
              {cart?.items?.map((item, index) => {
                if (typeof item.product === 'object') {
                  const {
                    quantity,
                    product,
                    product: { title, meta },
                  } = item

                  if (!quantity) return null

                  const metaImage = meta?.image

                  return (
                    <Fragment key={index}>
                      <CheckoutItem
                        product={product}
                        title={title}
                        metaImage={metaImage}
                        quantity={quantity}
                        index={index}
                      />
                    </Fragment>
                  )
                }
                return null
              })}
              <div className={classes.orderTotal}>
                <p>Order Total</p>
                <p>{cartTotal.formatted}</p>
              </div>
            </ul>
          </div>
          <Fragment>
            {error && <p>{`Error: ${error}`}</p>}
            <Button
              className={classes.paymentButton}
              label={loading ? 'Processing' : `Pay ${cartTotal.raw} ৳ with SSLCommerz`}
              disabled={loading}
              appearance="primary"
            />
          </Fragment>
        </form>
      )}
      {/* {!clientSecret && !error && (
        <div className={classes.loading}>
          <LoadingShimmer number={2} />
        </div>
      )} */}
      {error && (
        <div className={classes.error}>
          <p>{`Error: ${error}`}</p>
          <Button label="Back to cart" href="/cart" appearance="secondary" />
        </div>
      )}
    </Fragment>
  )
}
