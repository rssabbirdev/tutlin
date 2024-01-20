// import { sendGTMEvent } from '@next/third-parties/google'

// interface GoogleTagManagerEventDataProps {
//   eventName: string
//   transaction_id?: string
//   currency?: 'BDT'
//   value?: number
//   email_address?: string
//   phone_number?: string
//   customerName?: string
//   city?: string
//   region?: string
//   postal_code?: string
//   country?: string
//   items?: [
//     {
//       item_name?: string
//       quantity?: number
//       price?: number
//       item_category?: string
//       item_brand?: string
//     },
//   ]
// }
// export const sendGoogleTagManagerEvent = ({
//   eventName,
//   transaction_id,
//   value,
//   email_address,
//   phone_number,
//   customerName,
//   city,
// }: GoogleTagManagerEventDataProps): void => {
//   // const getName = (cName: string, position: number): string => {
//   //   const nameArray = cName.split(' ')
//   //   if (nameArray.length > 2 && position === 1) {
//   //     return nameArray[0] + ' ' + nameArray.filter((n, i) => i !== 0).join(' ')
//   //   }
//   //   if (nameArray.length === 1 && position === 1) {
//   //     return ''
//   //   }
//   //   return cName.split(' ')[position]
//   // }
// }

// // return gtag('event', 'purchase', {
// //   transaction_id: 't_12345',
// //   currency: 'USD',
// //   value: 1.23,
// //   user_data: {
// //     email_address: 'johnsmith@email.com',
// //     phone_number: '1234567890',
// //     address: {
// //       first_name: 'john',
// //       last_name: 'smith',
// //       city: 'menlopark',
// //       region: 'ca',
// //       postal_code: '94025',
// //       country: 'usa',
// //     },
// //   },
// //   items: [
// //     {
// //       item_name: 'foo',
// //       quantity: 5,
// //       price: 123.45,
// //       item_category: 'bar',
// //       item_brand: 'baz',
// //     },
// //   ],
// // })

// // return sendGTMEvent({
// //   event: eventName,
// //   transaction_id: transaction_id,
// //   currency: 'BDT',
// //   value: value,
// //   user_data: {
// //     email_address: email_address,
// //     phone_number: phone_number,
// //     address: {
// //       first_name: getName(customerName, 0),
// //       last_name: getName(customerName, 1),
// //       city: city,
// //       region: 'BD',
// //       postal_code: '',
// //       country: 'Bangladesh',
// //     },
// //   },
// //   items: [
// //     {
// //       item_name: 'foo',
// //       quantity: 5,
// //       price: 123.45,
// //       item_category: 'bar',
// //       item_brand: 'baz',
// //     },
// //   ],
// // })
