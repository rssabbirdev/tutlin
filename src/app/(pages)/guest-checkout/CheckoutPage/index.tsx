'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { sendGTMEvent } from '@next/third-parties/google'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Settings } from '../../../../payload/payload-types'
import { calculateDeliveryFee } from '../../../../payload/utilities/calculateDeliveryFee'
import { getFirstNameLastName } from '../../../../payload/utilities/getFirstNameLastName'
import { Button } from '../../../_components/Button'
import { Input } from '../../../_components/Input'
import { RadioButton } from '../../../_components/Radio'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { useTheme } from '../../../_providers/Theme'
import CheckoutItemWithQtyControl from '../CheckoutItemWithQtyControl'

import classes from './index.module.scss'

type FormData = {
  name: string
  phoneNumber: string
  email: string
  district: string
  deliveryFullAddress: string
}

export const CheckoutPage: React.FC<{
  settings: Settings
}> = props => {
  const {
    settings: {
      productsPage,
      outsideDhaka,
      insideDhaka,
      paymentOptions,
      freeShippingAmount,
      advancedPaymentAmount,
      advancedPaymentDiscount,
    },
  } = props
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<FormData>()
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => {
    if (status === 'loggedIn') {
      router.push('/checkout')
    }
  }, [router, status])

  const [error, setError] = React.useState<string | null>(null)
  const [deliveryOption, setDeliveryOption] = useState<{ key: string; value: number }>({
    key: 'insideDhaka',
    value: insideDhaka,
  })
  const [paymentOption, setPaymentOption] = useState<string>('1')
  const [isAdvancedPayment, setIsAdvancedPayment] = useState<boolean>(true)
  const { theme } = useTheme()

  const { cart, cartIsEmpty, cartTotal, addItemToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleOrderSubmit = (data: FormData) => {
    const order = { ...data, deliveryOption, paymentOption, isAdvancedPayment, cart }
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/guestorders/submit-order`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(order),
    })
      .then(res => res.json())
      .then(data => {
        if (paymentOption === 'CashOnDelivery') {
          sendGTMEvent({
            event: 'Purchase',
            content_category: cart?.items?.map(
              // @ts-expect-error
              (p, i) => p.product?.categories?.map(c => c?.title)[i],
            ),
            // @ts-expect-error
            content_ids: cart?.items?.map(p => p.product?.sku),
            // @ts-expect-error
            content_name: cart?.items?.map(p => p.product?.title),
            contents: cart?.items?.map(p => {
              return {
                // @ts-expect-error
                content_name: p?.product?.title,
                num_items: p?.quantity,
                currency: 'BDT',
                // @ts-expect-error
                value: p?.product?.productPrice,
              }
            }),
            currency: 'BDT',
            num_items: cart?.items?.reduce((acc, item) => acc + item?.quantity, 0),
            value: cart?.items?.reduce(
              // @ts-expect-error
              (acc, item) => acc + item?.product?.productPrice * item?.quantity,
              0,
            ),
            city: order?.district,
            email: order?.email,
            firstName: getFirstNameLastName(order?.name, 0),
            lastName: getFirstNameLastName(order?.name, 1),
            phoneNumber: order?.phoneNumber,
          })
          router.push(
            `order-confirmation?order_id=${data?.orderId}&transaction_id=${'null'}&order_status=${
              data?.orderStatus
            }&payment_status=${data?.paymentStatus}&total=${data?.total}`,
          )
        } else if (paymentOption === 'SSLCommerz') {
          window.location.href = data.GatewayPageURL
        } else if (paymentOption === 'Bkash') {
        } else if (paymentOption === 'UddoktaPay') {
          sendGTMEvent({
            event: 'Purchase',
            content_category: cart?.items?.map(
              // @ts-expect-error
              (p, i) => p.product?.categories?.map(c => c?.title)[i],
            ),
            // @ts-expect-error
            content_ids: cart?.items?.map(p => p.product?.sku),
            // @ts-expect-error
            content_name: cart?.items?.map(p => p.product?.title),
            contents: cart?.items?.map(p => {
              return {
                // @ts-expect-error
                content_name: p?.product?.title,
                num_items: p?.quantity,
                currency: 'BDT',
                // @ts-expect-error
                value: p?.product?.productPrice,
              }
            }),
            currency: 'BDT',
            num_items: cart?.items?.reduce((acc, item) => acc + item?.quantity, 0),
            value: cart?.items?.reduce(
              // @ts-expect-error
              (acc, item) => acc + item?.product?.productPrice * item?.quantity,
              0,
            ),
            city: order?.district,
            email: order?.email,
            firstName: getFirstNameLastName(order?.name, 0),
            lastName: getFirstNameLastName(order?.name, 1),
            phoneNumber: order?.phoneNumber,
          })
          window.location.href = data.GatewayPageURL
        }
      })
  }
  const deliveryFee = calculateDeliveryFee({ deliveryOption }, props.settings, cartTotal.raw)
  useEffect(() => {
    if (cartIsEmpty) {
      // router.push('/cart')
    }
  }, [router, cartIsEmpty])

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
        <>
          <p className={classes.billing}>
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                fontStyle: 'italic',
                textDecoration: 'underline',
              }}
            >
              Note:
            </span>
            <br />
            <Link href={`/login?redirect=${encodeURIComponent('/checkout')}`}>লগিন</Link> করে
            Checkout করলে অডার ট্রেকিং করতে পারবেন, এবং পরবর্তিতে পন্য ক্রয় করতে সহজ হবে! <br />{' '}
            <Link href={`/login?redirect=${encodeURIComponent('/checkout')}`}>Login Here</Link>
          </p>
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
                  name="email"
                  label="Email Address"
                  required
                  register={register}
                  error={errors.email}
                  type="email"
                  placeholder="ইমেইল এড্রেস *"
                  hideLabel={true}
                  errorMsg="আপনার ইমেইল এড্রেস লিখুন"
                />
                <Input
                  name="district"
                  label="District"
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
                        <CheckoutItemWithQtyControl
                          product={product}
                          title={title}
                          metaImage={metaImage}
                          qty={quantity}
                          addItemToCart={addItemToCart}
                          index={index}
                        />
                      </Fragment>
                    )
                  }
                  return null
                })}
                <div className={classes.deliveryOption}>
                  <h6>Delivery Option</h6>
                  <RadioButton
                    groupName="deliveryOption"
                    isSelected={deliveryOption.key === 'insideDhaka'}
                    label={`ঢাকার ভিতরে`}
                    value="insideDhaka"
                    onRadioChange={() =>
                      setDeliveryOption({ key: 'insideDhaka', value: insideDhaka })
                    }
                  />
                  <RadioButton
                    groupName="deliveryOption"
                    isSelected={deliveryOption.key === 'outsideDhaka'}
                    label={`ঢাকার বাহিরে`}
                    value="outsideDhaka"
                    onRadioChange={() =>
                      setDeliveryOption({ key: 'outsideDhaka', value: outsideDhaka })
                    }
                  />
                </div>
                <div className={classes.deliveryOption}>
                  <h6>Payment Option</h6>
                  {paymentOptions?.map(option => (
                    <RadioButton
                      groupName="paymentOptions"
                      isSelected={paymentOption === option}
                      // @ts-expect-error
                      label={option === 'CashOnDelivery' ? 'ক্যাশ অন ডেলিভারি' : option}
                      value={option}
                      onRadioChange={() => {
                        setIsAdvancedPayment(false)
                        setPaymentOption(option)
                      }}
                    />
                  ))}
                  <RadioButton
                    groupName="paymentOptions"
                    isSelected={paymentOption === '1'}
                    label={'আংশিক পেমেন্ট'}
                    value={'1'}
                    onRadioChange={() => {
                      setIsAdvancedPayment(true)
                      setPaymentOption('1')
                    }}
                  />

                  <RadioButton
                    groupName="paymentOptions"
                    isSelected={paymentOption === '2'}
                    label={'ফুল পেমেন্ট'}
                    value={'2'}
                    onRadioChange={() => {
                      setIsAdvancedPayment(false)
                      setPaymentOption('2')
                    }}
                  />
                  {isAdvancedPayment && (
                    <p className={classes.billing}>
                      আংশিক পেমেন্টের ক্ষেত্রে অতিরিক্ত {advancedPaymentDiscount} টাকার প্রয়োজন নেই!
                    </p>
                  )}
                  {!isAdvancedPayment && paymentOption !== 'CashOnDelivery' && (
                    <p className={classes.billing}>
                      ফুল পেমেন্ট এর ক্ষেত্রে অতিরিক্ত {advancedPaymentDiscount} টাকার প্রয়োজন নেই!
                    </p>
                  )}
                  {paymentOption === 'CashOnDelivery' && (
                    <p className={classes.billing}>
                      অগ্রিম ছাড়া ক্যাশ অন ডেলিভারির ক্ষেত্রে অতিরিক্ত {advancedPaymentDiscount}{' '}
                      টাকা দিতে হবে!
                    </p>
                  )}
                </div>
                <div className={classes.billing}>
                  <div className={classes.orderTotal}>
                    <p>Subtotal</p>
                    <p>{Number(cartTotal.raw)} ৳</p>
                  </div>
                  <div className={classes.orderTotal}>
                    <p>Delivery Charge</p>
                    <p>+{deliveryFee} ৳</p>
                  </div>
                  {isAdvancedPayment ||
                    (paymentOption === 'CashOnDelivery' && (
                      <div className={classes.orderTotal}>
                        <p>Total</p>
                        <p>{Number(cartTotal.raw) + deliveryFee} ৳</p>
                      </div>
                    ))}
                  {isAdvancedPayment && (
                    <div className={`${classes.orderTotal}`}>
                      <p>Advanced</p>
                      <p>-{advancedPaymentAmount} ৳</p>
                    </div>
                  )}
                  {paymentOption === 'CashOnDelivery' && (
                    <div className={`${classes.orderTotal}`}>
                      <p>Extra</p>
                      <p>+{advancedPaymentDiscount} ৳</p>
                    </div>
                  )}
                  <hr />
                  <div className={`${classes.orderTotal} ${classes.grandTotal}`}>
                    <p>
                      {isAdvancedPayment || paymentOption === 'CashOnDelivery'
                        ? 'Pay with Cash On Delivery'
                        : 'Grand Total'}
                    </p>
                    <p>
                      {isAdvancedPayment &&
                        paymentOption !== 'CashOnDelivery' &&
                        Number(cartTotal.raw) + deliveryFee - advancedPaymentAmount}{' '}
                      {!isAdvancedPayment &&
                        paymentOption === 'CashOnDelivery' &&
                        Number(cartTotal.raw) + deliveryFee + advancedPaymentDiscount}
                      {!isAdvancedPayment &&
                        paymentOption !== 'CashOnDelivery' &&
                        Number(cartTotal.raw) + deliveryFee}
                      ৳
                    </p>
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
                    : `${
                        paymentOption === 'CashOnDelivery'
                          ? `Place Order ${
                              !isAdvancedPayment && paymentOption === 'CashOnDelivery'
                                ? Number(cartTotal.raw) + deliveryFee + advancedPaymentDiscount
                                : Number(cartTotal.raw) + deliveryFee
                            } ৳`
                          : `Pay ${
                              isAdvancedPayment
                                ? advancedPaymentAmount
                                : Number(cartTotal.raw) + deliveryFee
                            } ৳ with`
                      }`
                }
                disabled={loading}
                appearance="primary"
              >
                <div style={{ marginLeft: '5px' }}>
                  {!loading && (
                    <>
                      {paymentOption !== 'CashOnDelivery' && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/images/uddoktapay-logo.png`}
                          height={40}
                          width={110}
                          alt="uddoktapay logo"
                        />
                      )}
                    </>
                  )}
                </div>
              </Button>
            </Fragment>
          </form>
        </>
      )}
      {error && (
        <div className={classes.error}>
          <p>{`Error: ${error}`}</p>
          <Button label="Back to cart" href="/cart" appearance="secondary" />
        </div>
      )}
    </Fragment>
  )
}
