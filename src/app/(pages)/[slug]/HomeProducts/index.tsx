import React from 'react'

import { Product } from '../../../../payload/payload-types'

function HomeProducts({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map(product => (
        <h1>{product.title}</h1>
      ))}
    </div>
  )
}

export default HomeProducts
