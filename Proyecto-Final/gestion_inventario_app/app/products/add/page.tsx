"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"

export default function AddProductPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Usuario")

  // Verificar autenticación y obtener información del usuario
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Obtener información del usuario del localStorage
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />
      <ProductForm />
    </div>
  )
}
