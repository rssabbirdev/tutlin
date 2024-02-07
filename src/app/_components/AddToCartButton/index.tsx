'use client'

import React, { useEffect, useState } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'

import { Product } from '../../../payload/payload-types'
import { useAuth } from '../../_providers/Auth'
import { useCart } from '../../_providers/Cart'
import { Button, Props } from '../Button'

import classes from './index.module.scss'

export const AddToCartButton: React.FC<{
  product: Product
  quantity?: number
  productPrice?: number
  className?: string
  appearance?: Props['appearance']
  isBuyNow: boolean
}> = props => {
  const { product, quantity = 1, className, appearance = 'primary', isBuyNow } = props

  const { cart, addItemToCart, isProductInCart, hasInitializedCart } = useCart()
  const { status } = useAuth()

  const [isInCart, setIsInCart] = useState<boolean>()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [isBuyNowLoading, setIsBuyNowLoading] = useState<boolean>(false)

  const handleAddToCart = () => {
    setLoading(false)
    if (!isBuyNow) {
      if (!isInCart) {
        addItemToCart({
          product,
          quantity,
        })
        sendGTMEvent({
          event: 'AddToCart',
          content_ids: product?.sku,
          content_name: product?.title,
          content_type: 'product',
          currency: 'BDT',
          value: product?.productPrice,
        })
      } else {
        setLoading(true)
        router.push('/cart')
      }
    } else {
      addItemToCart({
        product,
        quantity,
      })
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
      setIsBuyNowLoading(true)
      if (status === 'loggedIn') {
        router.push('/checkout')
      } else {
        router.push('/guest-checkout')
      }
    }
  }

  useEffect(() => {
    setIsInCart(isProductInCart(product))
  }, [isProductInCart, product, cart])

  return (
    <>
      {isBuyNow ? (
        <Button
          type={'button'}
          label={isBuyNowLoading ? 'Processing' : 'Buy Now'}
          el={'button'}
          appearance={appearance}
          className={[
            className,
            classes.addToCartButton,
            appearance === 'default' && isInCart && classes.green,
            !hasInitializedCart && classes.hidden,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={handleAddToCart}
          disabled={isBuyNowLoading || loading}
        />
      ) : (
        <Button
          type={'button'}
          label={
            isBuyNow
              ? `${loading ? 'Processing' : 'Buy Now'}`
              : `${isInCart ? `${loading ? 'Processing' : '✓ View in cart'}` : 'Add To Cart'}`
          }
          el={'button'}
          appearance={appearance}
          className={[
            className,
            classes.addToCartButton,
            appearance === 'default' && isInCart && classes.green,
            !hasInitializedCart && classes.hidden,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={handleAddToCart}
          disabled={isBuyNowLoading || loading}
        />
      )}
    </>
  )
}
