'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Header } from '../../../../payload/payload-types'
import { noHeaderFooterUrls } from '../../../constants'
import { Gutter } from '../../Gutter'
import MobileNav from '../MobileNav'
import { HeaderNav } from '../Nav'

import classes from './index.module.scss'

function HeaderComponent({ header }: { header: Header }) {
  const pathname = usePathname()
  return (
    <nav
      className={[classes.header, noHeaderFooterUrls.includes(pathname) && classes.hide]
        .filter(Boolean)
        .join(' ')}
    >
      <Gutter className={[classes.wrap].filter(Boolean).join(' ')}>
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
