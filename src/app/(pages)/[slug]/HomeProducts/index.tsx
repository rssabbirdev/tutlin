import React from 'react'
import Link from 'next/link'

import { Product } from '../../../../payload/payload-types'
import { Card } from '../../../_components/Card'

import classes from './index.module.scss'

function HomeProducts({ products }: { products: Product[] }) {
  return (
    <div>
      <div className={classes.titleWrapper}>
        <h3>Explore Our Latest Products</h3>
        <Link href="/products">See More</Link>
      </div>
      <div className={classes.products}>
        {products.map(product => (
          <Card
            doc={product}
            alignItems="center"
            key={product.id}
            title={product.title}
            className={classes.product}
          />
        ))}
      </div>
    </div>
  )
}

export default HomeProducts
