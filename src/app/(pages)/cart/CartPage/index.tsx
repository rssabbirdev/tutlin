'use client'

import React, { Fragment, useState } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Page, Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import CartItem from '../CartItem'

import classes from './index.module.scss'

export const CartPage: React.FC<{
  settings: Settings
  page: Page
}> = props => {
  const { settings } = props
  const { productsPage } = settings || {}

  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { cart, cartIsEmpty, addItemToCart, cartTotal, hasInitializedCart } = useCart()
  const InitiateCheckout = () => {
    setLoading(false)
    sendGTMEvent({
      event: 'InitiateCheckout',
      // @ts-expect-error
      content_category: cart?.items?.map((p, i) => p.product?.categories?.map(c => c?.title)[i]),
      // @ts-expect-error
      content_ids: cart?.items?.map(p => p.product?.sku),
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
    })
    if (user) {
      setLoading(true)
      router.push('/checkout')
    } else {
      setLoading(true)
      router.push('/login?redirect=%2Fcheckout')
    }
  }

  return (
    <Fragment>
      <br />
      {!hasInitializedCart ? (
        <div className={classes.loading}>
          <LoadingShimmer />
        </div>
      ) : (
        <Fragment>
          {cartIsEmpty ? (
            <div className={classes.empty}>
              Your cart is empty.
              {typeof productsPage === 'object' && productsPage?.slug && (
                <Fragment>
                  {' '}
                  <Link href={`/${productsPage.slug}`}>Click here</Link>
                  {` to shop.`}
                </Fragment>
              )}
              {!user && (
                <Fragment>
                  {' '}
                  <Link href={`/login?redirect=%2Fcart`}>Log in</Link>
                  {` to view a saved cart.`}
                </Fragment>
              )}
            </div>
          ) : (
            <div className={classes.cartWrapper}>
              <div>
                {/* CART LIST HEADER */}
                <div className={classes.header}>
                  <p>Products</p>
                  <div className={classes.headerItemDetails}>
                    <p></p>
                    <p></p>
                    <p>Quantity</p>
                  </div>
                  <p className={classes.headersubtotal}>Subtotal</p>
                </div>
                {/* CART ITEM LIST */}
                <ul className={classes.itemsList}>
                  {cart?.items?.map((item, index) => {
                    if (typeof item.product === 'object') {
                      const {
                        quantity,
                        product,
                        product: { id, title, meta, stripeProductID },
                      } = item

                      const isLast = index === (cart?.items?.length || 0) - 1

                      const metaImage = meta?.image

                      return (
                        <CartItem
                          product={product}
                          title={title}
                          metaImage={metaImage}
                          qty={quantity}
                          addItemToCart={addItemToCart}
                          index={index}
                        />
                      )
                    }
                    return null
                  })}
                </ul>
              </div>

              <div className={classes.summary}>
                <div className={classes.row}>
                  <h6 className={classes.cartTotal}>Summary</h6>
                </div>

                {/* <div className={classes.row}>
                  <p className={classes.cartTotal}>Delivery Charge</p>
                  <p className={classes.cartTotal}>$0</p>
                </div> */}

                <div className={classes.row}>
                  <p className={classes.cartTotal}>Subtotal</p>
                  <p className={classes.cartTotal}>{cartTotal.formatted}</p>
                </div>

                <Button
                  onClick={InitiateCheckout}
                  el="button"
                  className={classes.checkoutButton}
                  label={
                    user
                      ? `${loading ? 'Processing' : 'Checkout'}`
                      : `${loading ? 'Processing' : 'Login to checkout'}`
                  }
                  disabled={loading}
                  appearance="primary"
                />
              </div>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  )
}
