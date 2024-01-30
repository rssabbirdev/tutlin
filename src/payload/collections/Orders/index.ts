import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { ipnHandler } from './endpoints/ipn'
import { sslcommerzSuccessHandler } from './endpoints/sslcommerz/sslcommerz-success'
import { submitOrder } from './endpoints/submit-order'
import { uddoktapaySuccessHandler } from './endpoints/uddoktapay/uddoktapay-success'
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
    {
      path: '/ipn',
      method: 'post',
      handler: ipnHandler,
    },
    {
      path: '/sslcommerz-success',
      method: 'post',
      handler: sslcommerzSuccessHandler,
    },
    {
      path: '/uddoktapay-success',
      method: 'post',
      handler: uddoktapaySuccessHandler,
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
      defaultValue: 0,
      required: true,
      min: 0,
    },
    {
      label: 'Paid Amount',
      name: 'paidAmount',
      type: 'number',
      defaultValue: 0,
      required: true,
      min: 0,
    },
    {
      label: 'Due Amount',
      name: 'dueAmount',
      type: 'number',
      defaultValue: 0,
      required: true,
      min: 0,
    },
    {
      label: 'Phone Number',
      name: 'phoneNumber',
      type: 'text',
      required: true,
    },
    {
      label: 'District',
      name: 'district',
      type: 'text',
      required: true,
    },
    {
      label: 'Delivery Full Address',
      name: 'deliveryFullAddress',
      type: 'text',
      required: true,
    },
    {
      label: 'Delivery Option',
      name: 'deliveryOption',
      type: 'text',
      required: true,
    },
    {
      label: 'Delivery Fee',
      name: 'deliveryFee',
      type: 'number',
      required: true,
    },
    {
      label: 'Payment Option',
      name: 'paymentOption',
      type: 'text',
      required: true,
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
      name: 'orderId',
      label: 'Order Id',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      required: true,
    },
    {
      name: 'valId',
      label: 'Val Id',
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
