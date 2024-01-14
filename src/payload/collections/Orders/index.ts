import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { submitOrder } from './endpoints/submit-order'
import { clearUserCart } from './hooks/clearUserCart'
import { populateOrderedBy } from './hooks/populateOrderedBy'
import { updateUserPurchases } from './hooks/updateUserPurchases'
import { LinkToPaymentIntent } from './ui/LinkToPaymentIntent'

export const Orders: CollectionConfig = {
  slug: 'orders',
  endpoints: [
    {
      path: '/submit-order',
      method: 'post',
      handler: submitOrder,
    },
  ],
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['createdAt', 'orderedBy', 'orderStatus', 'total'],
    preview: doc => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/orders/${doc.id}`,
  },
  hooks: {
    afterChange: [updateUserPurchases, clearUserCart],
  },
  access: {
    read: adminsOrOrderedBy,
    update: admins,
    create: adminsOrLoggedIn,
    delete: admins,
  },
  fields: [
    {
      name: 'orderedBy',
      type: 'relationship',
      relationTo: 'users',
      hooks: {
        beforeChange: [populateOrderedBy],
      },
    },
    {
      name: 'stripePaymentIntentID',
      label: 'Stripe Payment Intent ID',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: {
          Field: LinkToPaymentIntent,
        },
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      label: 'Payment Amount',
      name: 'paidAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      label: 'Due Amount',
      name: 'dueAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'orderStatus',
      label: 'Order Status',
      type: 'select',
      defaultValue: 'Pending',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Pending',
          value: 'Pending',
        },
        {
          label: 'Processing',
          value: 'Processing',
        },
        {
          label: 'Shipped',
          value: 'Shipped',
        },
        {
          label: 'Delivered',
          value: 'Delivered',
        },
        {
          label: 'Cancelled',
          value: 'Cancelled',
        },
      ],
    },
    {
      name: 'transactionId',
      label: 'Transaction Id',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentStatus',
      label: 'Payment Status',
      type: 'select',
      defaultValue: 'Unpaid',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Unpaid',
          value: 'Unpaid',
        },
        {
          label: 'Partial Paid',
          value: 'Partial Paid',
        },
        {
          label: 'Paid',
          value: 'Paid',
        },
      ],
    },
  ],
}
