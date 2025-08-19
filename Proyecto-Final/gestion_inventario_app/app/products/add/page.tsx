"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"
import { useAuth } from "@/hooks/useAuth"

export default function AddProductPage() {
  const router = useRouter()
  const { canCreate } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuario")

  useEffect(() => {
    setMounted(true) // marcar montado en cliente

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Verificar si el usuario puede crear productos
    if (!canCreate()) {
      router.push("/products") // Redirigir si no tiene permisos
      return
    }

    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserName(user.name || user.username || "Usuario")
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [router])

  // Evita el renderizado hasta que el componente esté montado para prevenir hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />
      <ProductForm />
    </div>
  )
}
