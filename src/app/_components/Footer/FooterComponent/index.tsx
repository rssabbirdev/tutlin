'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Footer, Media } from '../../../../payload/payload-types'
import { inclusions, noHeaderFooterUrls } from '../../../constants'
import { Button } from '../../Button'
import { Gutter } from '../../Gutter'

import classes from './index.module.scss'
// import { Button } from '../../Button'

function FooterComponent({ footer }: { footer: Footer }) {
  const pathname = usePathname()
  const navItems = footer?.navItems || []
  return (
    <footer className={noHeaderFooterUrls.includes(pathname) ? classes.hide : ''}>
      <Gutter>
        <ul className={classes.inclusions}>
          {inclusions.map((inclusion, index) => (
            <li key={inclusion.title} className={classes.box}>
              <Image
                src={inclusion.icon}
                alt={inclusion.title}
                height={36}
                width={36}
                className={classes.icon}
              />
              <h5 className={classes.title}>{inclusion.title}</h5>
              <p>{inclusion.description}</p>
            </li>
          ))}
        </ul>
      </Gutter>
      <div className={classes.footer}>
        <Gutter>
          <div className={classes.wrap}>
            <Link href="/">
              {/* <Image src="/logo-white.svg" alt="logo" width={170} height={50} /> */}
              <h3 style={{ color: 'white' }}>TUTLIN</h3>
              <p className={classes.copyright}>{footer?.copyright}</p>
            </Link>
          </div>
          <div className={classes.socialLinks}>
            {navItems.map(item => {
              const icon = item?.link?.icon as Media
              return (
                <Button
                  key={item.link.label}
                  el="link"
                  href={item.link.url}
                  newTab={true}
                  className={classes.socialLinkItem}
                >
                  <Image
                    src={icon?.url}
                    alt={icon?.alt}
                    height={24}
                    width={24}
                    className={classes.socialIcon}
                  />
                </Button>
              )
            })}
          </div>
        </Gutter>
        <Gutter>
          <div className={classes.payment}>
            <Image
              src={`/assets/images/sslcommerz-payment-options.avif`}
              alt="sslcommerz payment options"
              width={500}
              height={200}
            />
          </div>
        </Gutter>
      </div>
    </footer>
  )
}

export default FooterComponent
