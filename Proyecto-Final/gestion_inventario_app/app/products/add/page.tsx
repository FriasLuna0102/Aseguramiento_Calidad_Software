"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"

export default function AddProductPage() {
  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <ProductForm />
    </div>
  )
}
