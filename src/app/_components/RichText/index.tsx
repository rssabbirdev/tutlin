import React from 'react'
import escapeHTML from 'escape-html'

import serialize from './serialize'

import './richText.css'

import classes from './index.module.scss'

const RichText: React.FC<{ className?: string; content: any }> = ({ className, content }) => {
  if (!content) {
    return null
  }
  let text = <span dangerouslySetInnerHTML={{ __html: content }} />
  return (
    <div className={`richTextCustom`}>
      {/* {serialize(content)} */}
      {text}
      <span />
    </div>
  )
}

export default RichText
