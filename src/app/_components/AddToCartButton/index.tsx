'use client'

import React, { useEffect, useState } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
import { useRouter } from 'next/navigation'

import { Product } from '../../../payload/payload-types'
import { useCart } from '../../_providers/Cart'
import { Button, Props } from '../Button'

import classes from './index.module.scss'

export const AddToCartButton: React.FC<{
  product: Product
  quantity?: number
  productPrice?: number
  className?: string
  appearance?: Props['appearance']
}> = props => {
  const { product, quantity = 1, className, appearance = 'primary' } = props

  const { cart, addItemToCart, isProductInCart, hasInitializedCart } = useCart()

  const [isInCart, setIsInCart] = useState<boolean>()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const handleAddToCart = () => {
    setLoading(false)
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
  }

  useEffect(() => {
    setIsInCart(isProductInCart(product))
  }, [isProductInCart, product, cart])

  return (
    <Button
      type={'button'}
      label={isInCart ? `${loading ? 'Processing' : '✓ View in cart'}` : `Add to cart`}
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
    />
  )
}
