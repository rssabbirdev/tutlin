import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Header } from '../../../../payload/payload-types'
import { Gutter } from '../../Gutter'
import MobileNav from '../MobileNav'
import { HeaderNav } from '../Nav'

import classes from './index.module.scss'

function HeaderComponent({ header }: { header: Header }) {
  return (
    <nav className={[classes.header]}>
      <Gutter className={[classes.wrap]}>
        <Link href="/">
          <Image src="/logo-black.svg" alt="logo" height={50} width={170} />
        </Link>
        <HeaderNav header={header} />
        <MobileNav header={header} />
      </Gutter>
    </nav>
  )
}

export default HeaderComponent
