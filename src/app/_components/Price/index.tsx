'use client'

import React, { useEffect, useState } from 'react'

import { Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../AddToCartButton'
import { RemoveFromCartButton } from '../RemoveFromCartButton'

import classes from './index.module.scss'

export const priceFromJSON = (
  productPrice: number = 0,
  quantity: number = 1,
  raw?: boolean,
): string => {
  let price = ''

  if (productPrice) {
    try {
      const priceValue = productPrice * quantity

      if (raw) return priceValue.toString()

      price = priceValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'BDT', // TODO: use `parsed.currency`
      })
    } catch (e) {
      console.error(`Cannot parse priceJSON`) // eslint-disable-line no-console
    }
  }

  return price
}

export const Price: React.FC<{
  product: Product
  quantity?: number
  productPrice?: number
  button?: 'addToCart' | 'removeFromCart' | false
}> = props => {
  const { product, product: { productPrice } = {}, button = 'addToCart', quantity } = props

  const [price, setPrice] = useState<{
    actualPrice: string
    withQuantity: string
  }>(() => ({
    actualPrice: priceFromJSON(productPrice),
    withQuantity: priceFromJSON(productPrice, quantity),
  }))

  useEffect(() => {
    setPrice({
      actualPrice: priceFromJSON(productPrice),
      withQuantity: priceFromJSON(productPrice, quantity),
    })
  }, [productPrice, quantity])

  return (
    <div className={classes.actions}>
      {typeof price?.actualPrice !== 'undefined' && price?.withQuantity !== '' && (
        <div className={classes.price}>
          <p>{price?.withQuantity}</p>
          {quantity > 1 && (
            <small className={classes.priceBreakdown}>{`${price.actualPrice} x ${quantity}`}</small>
          )}
        </div>
      )}
      {/* {button && button === 'addToCart' && (
        <AddToCartButton product={product} appearance="default" />
      )}
      {button && button === 'removeFromCart' && <RemoveFromCartButton product={product} />} */}
    </div>
  )
}
