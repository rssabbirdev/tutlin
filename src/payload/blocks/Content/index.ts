import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload/types'

import { invertBackground } from '../../fields/invertBackground'
import link from '../../fields/link'
// import richText from '../../fields/richText'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        value: 'oneThird',
        label: 'One Third',
      },
      {
        value: 'half',
        label: 'Half',
      },
      {
        value: 'twoThirds',
        label: 'Two Thirds',
      },
      {
        value: 'full',
        label: 'Full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    // Pass the Lexical editor here and override base settings as necessary
    editor: lexicalEditor({
      features: ({ defaultFeatures }) => [
        ...defaultFeatures,
        // The HTMLConverter Feature is the feature which manages the HTML serializers.
        // If you do not pass any arguments to it, it will use the default serializers.
        HTMLConverterFeature({}),
      ],
    }),
  },
  lexicalHTML('richText', { name: 'richText_html' }),
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_, { enableLink }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  fields: [
    invertBackground,
    {
      name: 'columns',
      type: 'array',
      fields: columnFields,
    },
  ],
}
