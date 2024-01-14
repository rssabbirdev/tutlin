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
  ],
}
