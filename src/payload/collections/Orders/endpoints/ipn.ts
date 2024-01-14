import type { PayloadHandler } from 'payload/config'

export const ipnHandler: PayloadHandler = async (req, res): Promise<void> => {
  // const { user, payload } = req
  console.log('IPN Post Success')
  console.log('Request', req)
  //   if (!user) {
  //     res.status(401).send('Unauthorized')
  //     return
  //   }
  //   const fullUser = await payload.findByID({
  //     collection: 'users',
  //     id: user?.id,
  //   })
  //   if (!fullUser) {
  //     res.status(404).json({ error: 'User not found' })
  //     return
  //   }

  try {
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // payload.logger.error(message)
    res.json({ error: message })
  }
}
