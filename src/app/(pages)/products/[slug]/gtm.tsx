'use client'
import React, { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'

import { Product } from '../../../../payload/payload-types'

function ProductGTM({ product }: { product: Product }) {
  useEffect(() => {
    if (window?.google_tag_manager?.dataLayer?.gtmLoad === true) {
      sendGTMEvent({
        event: 'ViewContent',
        content_ids: product.sku,
        content_category: product.categories,
        content_name: product.title,
        content_type: 'product',
        contents: [{ id: product.sku, quantity: 1 }],
        currency: 'BDT',
        value: product.productPrice,
      })
    }
  }, [product.categories, product.productPrice, product.sku, product.title])
  return <div></div>
}

export default ProductGTM
