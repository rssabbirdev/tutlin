'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Input } from '../../../_components/Input'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { RadioButton } from '../../../_components/Radio'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { useTheme } from '../../../_providers/Theme'
import cssVariables from '../../../cssVariables'
import { CheckoutForm } from '../CheckoutForm'
import { CheckoutItem } from '../CheckoutItem'

import classes from './index.module.scss'

type FormData = {
  name: string
  phoneNumber: string
  district: string
  deliveryFullAddress: string
}

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: { productsPage, outsideDhaka, insideDhaka },
  } = props
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<FormData>()

  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const hasMadePaymentIntent = React.useRef(false)
  const [deliveryOption, setDeliveryOption] = useState<{ key: string; value: number }>({
    key: 'inside',
    value: insideDhaka,
  })
  const { theme } = useTheme()

  const { cart, cartIsEmpty, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)

  const handleOrderSubmit = (data: FormData) => {
    console.log(data)
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
                defaultValue={user?.name}
                label="Full Name"
                required
                register={register}
                error={errors.name}
                type="text"
                placeholder="আপনার পুরো নাম *"
                hideLabel={true}
                errorMsg="আপনার পুরো নাম্বার লিখুন"
                maxLength={15}
                minLength={4}
                maxLengthErrorMsg="১৫ অক্ষরের বেশি নাম দেওয়া যাবে নাহ"
                minLengthErrorMsg="নুন্যতম ৪ অক্ষরে নাম লিখুন"
              />
              <Input
                name="phoneNumber"
                label="Phone Number"
                defaultValue={user?.phoneNumber}
                required
                register={register}
                error={errors.phoneNumber}
                type="text"
                placeholder="মোবাইল নাম্বার *"
                hideLabel={true}
                errorMsg="আপনার মোবাইল নাম্বার লিখুন"
                maxLength={11}
                minLength={11}
                maxLengthErrorMsg="01819XXXXXX এভাবে নাম্বারটি লিখুন"
                minLengthErrorMsg="01819XXXXXX এভাবে নাম্বারটি লিখুন"
              />
              <Input
                name="district"
                label="District"
                defaultValue={user?.district}
                required
                register={register}
                error={errors.district}
                type="text"
                placeholder="আপনার জেলার *"
                hideLabel={true}
                errorMsg="আপনার জেলার নাম লিখুন"
                maxLength={15}
                minLength={4}
                maxLengthErrorMsg="১৫ অক্ষরের বেশি লেখা যাবে নাহ"
                minLengthErrorMsg="নুন্যতম ৪ অক্ষরে লিখুন"
              />
              <Input
                name="deliveryFullAddress"
                label="Delivery Full Address"
                defaultValue={user?.deliveryFullAddress}
                required
                register={register}
                error={errors.deliveryFullAddress}
                type="text"
                placeholder="আপনার সম্পুর্ণ ঠিকানা *"
                hideLabel={true}
                errorMsg="আপনার সম্পুর্ণ ঠিকানা লিখুন"
                maxLength={100}
                minLength={15}
                maxLengthErrorMsg="১০০ অক্ষরের বেশি ঠিকানা লেখা যাবে নাহ"
                minLengthErrorMsg="নুন্যতম ১৫ অক্ষরে ঠিকানা লিখুন"
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
              <div className={classes.deliveryOption}>
                <RadioButton
                  groupName="deliveryOption"
                  isSelected={deliveryOption.key === 'inside'}
                  label={`Inside Dhaka : ${insideDhaka} ৳`}
                  value="inside"
                  onRadioChange={() => setDeliveryOption({ key: 'inside', value: insideDhaka })}
                />
                <RadioButton
                  groupName="deliveryOption"
                  isSelected={deliveryOption.key === 'outside'}
                  label={`Outside Dhaka : ${outsideDhaka} ৳`}
                  value="outside"
                  onRadioChange={() => setDeliveryOption({ key: 'outside', value: outsideDhaka })}
                />
              </div>
              <div className={classes.billing}>
                <div className={classes.orderTotal}>
                  <p>Subtotal</p>
                  <p>{Number(cartTotal.raw)} ৳</p>
                </div>
                <div className={classes.orderTotal}>
                  <p>Delivery Charge</p>
                  <p>{Number(deliveryOption.value)} ৳</p>
                </div>
                <div className={`${classes.orderTotal} ${classes.grandTotal}`}>
                  <p>Grand Total</p>
                  <p>{Number(cartTotal.raw) + Number(deliveryOption.value)} ৳</p>
                </div>
              </div>
            </ul>
          </div>
          <Fragment>
            {error && <p>{`Error: ${error}`}</p>}
            <Button
              type="submit"
              className={classes.paymentButton}
              label={
                loading
                  ? 'Processing'
                  : `Pay ${Number(cartTotal.raw) + Number(deliveryOption.value)} ৳ with SSLCommerz`
              }
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
