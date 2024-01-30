import type { GlobalConfig } from 'payload/types'

export const Settings: GlobalConfig = {
  slug: 'settings',
  typescript: {
    interface: 'Settings',
  },
  graphQL: {
    name: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'productsPage',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Products page',
    },
    {
      name: 'insideDhaka',
      label: 'Inside Dhaka',
      type: 'number',
      required: true,
      defaultValue: 60,
    },
    {
      name: 'outsideDhaka',
      label: 'Outside Dhaka',
      type: 'number',
      required: true,
      defaultValue: 120,
    },
    {
      label: 'Free Shipping Amount',
      name: 'freeShippingAmount',
      type: 'number',
    },
    {
      name: 'paymentOptions',
      label: 'Payment Options',
      type: 'select',
      hasMany: true,
      options: [
        {
          label: 'Cash On Delivery',
          value: 'Cash On Delivery',
        },
        {
          label: 'SSLCommerz',
          value: 'SSLCommerz',
        },
        {
          label: 'Bkash',
          value: 'Bkash',
        },
        {
          label: 'UddoktaPay',
          value: 'UddoktaPay',
        },
      ],
    },
  ],
}
