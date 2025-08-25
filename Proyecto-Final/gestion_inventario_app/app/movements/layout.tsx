// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export default function MovementsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
