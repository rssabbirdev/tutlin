import React, { Fragment } from 'react'
import Link from 'next/link'

import { Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../../_components/AddToCartButton'
import { Blocks } from '../../_components/Blocks'
import { Gutter } from '../../_components/Gutter'
import { Media } from '../../_components/Media'
import { Message } from '../../_components/Message'
import { Price } from '../../_components/Price'
import RichText from '../../_components/RichText'

import classes from './index.module.scss'

export const ProductHero: React.FC<{
  product: Product
}> = ({ product }) => {
  const {
    id,
    stripeProductID,
    title,
    categories,
    layout,
    sku,
    warranty,
    originalProductPrice,
    meta: { image: metaImage, description } = {},
  } = product

  return (
    <section>
      <Gutter className={classes.productHero}>
        <div className={classes.mediaWrapper}>
          {!metaImage && <div className={classes.placeholder}>No image</div>}
          {metaImage && typeof metaImage !== 'string' && (
            <Media imgClassName={classes.image} resource={metaImage} fill />
          )}
        </div>
        <div className={classes.details}>
          <h1 className={classes.title} style={{ fontSize: '26px' }}>
            {title}
          </h1>
          <div className={classes.categoryWrapper}>
            <div className={classes.categories}>
              {categories?.map((category, index) => {
                // @ts-expect-error
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <p className={classes.category} key={index}>
                    {titleToUse}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                    <span className={classes.separator}>|</span>
                  </p>
                )
              })}
            </div>
            <p className={classes.stock}>In Stock</p>
          </div>

          <div className={classes.priceSection}>
            <Price product={product} button={false} />
            {originalProductPrice !== 0 && (
              <span className={classes.price}>
                <del>BDT {originalProductPrice}.00</del>
              </span>
            )}
          </div>
          <div className={classes.description}>
            <strong>Description</strong>
            <p>{description}</p>
          </div>
          <div className={classes.sku}>
            <p style={{ fontSize: '15px' }}>Warranty : {warranty}</p>
            <p style={{ fontSize: '15px' }}>SKU : {sku}</p>
          </div>

          <AddToCartButton product={product} className={classes.addToCartButton} />
        </div>
      </Gutter>
      <Blocks blocks={layout} />
    </section>
  )
}
