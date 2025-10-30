// Force dynamic rendering for register page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
