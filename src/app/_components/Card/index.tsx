'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'

import { Product } from '../../../payload/payload-types'
import { Media } from '../Media'
import { Price } from '../Price'

import classes from './index.module.scss'

const priceFromJSON = (priceJSON): string => {
  let price = ''

  if (priceJSON) {
    try {
      const parsed = JSON.parse(priceJSON)?.data[0]
      const priceValue = parsed.unit_amount
      const priceType = parsed.type
      price = `${parsed.currency === 'usd' ? '$' : ''}${(priceValue / 100).toFixed(2)}`
      if (priceType === 'recurring') {
        price += `/${
          parsed.recurring.interval_count > 1
            ? `${parsed.recurring.interval_count} ${parsed.recurring.interval}`
            : parsed.recurring.interval
        }`
      }
    } catch (e) {
      console.error(`Cannot parse priceJSON`) // eslint-disable-line no-console
    }
  }

  return price
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  showCategories?: boolean
  hideImagesOnMobile?: boolean
  title?: string
  relationTo?: 'products'
  doc?: Product
}> = props => {
  const {
    showCategories,
    title: titleFromProps,
    doc,
    doc: {
      slug,
      title,
      categories,
      meta,
      priceJSON,
      productPrice,
      sku,
      originalProductPrice,
      showDiscountPercentage,
    } = {},
    className,
  } = props
  const [loading, setLoading] = useState<Boolean>(false)

  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/products/${slug}`

  return (
    <Link
      href={href}
      className={[classes.card, className].filter(Boolean).join(' ')}
      onClick={() => setLoading(true)}
    >
      {showDiscountPercentage && (
        <div className={classes.discountTag}>
          {Math.round(((originalProductPrice - productPrice) / originalProductPrice) * 100)}% OFF
        </div>
      )}
      <div className={classes.mediaWrapper}>
        {loading && <div className={classes.loading}>Loading...</div>}
        {!metaImage && <div className={classes.placeholder}>No image</div>}
        {metaImage && typeof metaImage !== 'string' && (
          <Media imgClassName={classes.image} resource={metaImage} fill />
        )}
      </div>
      <div className={classes.content}>
        {/* {showCategories && hasCategories && (
          <div className={classes.leader}>
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  const { title: titleFromCategory } = category

                  const categoryTitle = titleFromCategory || 'Untitled category'

                  const isLast = index === categories.length - 1

                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                })}
              </div>
            )}
          </div>
        )} */}
        {titleToUse && <h4 className={classes.title}>{titleToUse}</h4>}
        {description && (
          <div className={classes.body}>
            {description && <p className={classes.description}>{sanitizedDescription}</p>}
          </div>
        )}
        {doc && (
          <div className={classes.priceSection}>
            <Price product={doc} />{' '}
            {originalProductPrice !== 0 && (
              <span className={classes.price}>
                <del>BDT {originalProductPrice}.00</del>
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
