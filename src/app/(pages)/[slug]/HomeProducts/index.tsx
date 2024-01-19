import React from 'react'
import Link from 'next/link'

import { Product } from '../../../../payload/payload-types'
import { Card } from '../../../_components/Card'
import { HR } from '../../../_components/HR'

import classes from './index.module.scss'

function HomeProducts({ products }: { products: Product[] }) {
  return (
    <div>
      <div className={classes.titleWrapper}>
        <h3>Features Products</h3>
        <Link href="/products">Explore products</Link>
      </div>
      <HR />
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
