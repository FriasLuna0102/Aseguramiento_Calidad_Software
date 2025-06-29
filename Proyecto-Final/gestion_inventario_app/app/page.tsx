"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/products")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
        <p className="text-[#003B73]">Cargando Inventario QAS...</p>
      </div>
    </div>
  )
}
