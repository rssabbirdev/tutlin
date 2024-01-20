export const getFirstNameLastName = (cName: string, position: number): string => {
  const nameArray = cName.split(' ')
  if (nameArray.length > 2 && position === 1) {
    return nameArray[0] + ' ' + nameArray.filter((n, i) => i !== 0).join(' ')
  }
  if (nameArray.length === 1 && position === 1) {
    return ''
  }
  return cName.split(' ')[position]
}
