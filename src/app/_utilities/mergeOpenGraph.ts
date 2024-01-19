import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  siteName: 'Tutlin',
  title: 'Tutlin - We feel your needs',
  description:
    'Welcome to Tutlin, your best online store in Bangladesh! Find trendy fashion, cool electronics, and home essentials. Discover the latest styles and top-notch gadgets at affordable prices. We promise quick and safe delivery to make your shopping experience smooth. Tutlin is your trusted E-commerce shop in Bangladesh. Join us for a hassle-free and enjoyable shopping adventure Start exploring Tutlin today!',
  images: [
    {
      url: '/assets/images/tutlin-home-images.png',
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
