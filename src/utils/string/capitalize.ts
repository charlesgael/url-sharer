export default function capitalize(str: string | null | undefined): string {
  return str && str.length ? str[0].toUpperCase() + str.substring(1) : ''
}
