"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"
import type { Product } from "@/types/product"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [mounted, setMounted] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("Usuario")

  useEffect(() => {
    const verifyAndFetchProduct = async () => {
      setMounted(true) 

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
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

      try {
        console.log("Obteniendo producto con ID:", productId)

        const response = await fetch(`${BASE_URL}/api/v1/products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", errorText || "(respuesta vacía del servidor)")
          throw new Error(`Producto no encontrado o error: ${response.status} - ${errorText || "Sin detalles"}`)
        }

        const productData: Product = await response.json()
        console.log("Producto obtenido:", productData)
        setProduct(productData)
      } catch (err) {
        console.error("Error al obtener producto:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      verifyAndFetchProduct()
    }
  }, [router, productId])


  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header userName={userName} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
            <p className="text-[#003B73]">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header userName={userName} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || "Producto no encontrado"}</p>
            <Button onClick={() => window.history.back()} className="bg-[#007BFF] hover:bg-[#003B73]">
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />
      <ProductForm product={product} isEditing={true} />
    </div>
  )
}
