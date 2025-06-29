"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"
import type { Product } from "@/types/product"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
  }, [router])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token")
        
        console.log("Obteniendo producto con ID:", productId) // Debug log

        const response = await fetch(`http://localhost:8080/api/v1/products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Response status:", response.status) // Debug log

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", errorText) // Debug log
          throw new Error(`Producto no encontrado: ${response.status} - ${errorText}`)
        }

        const productData: Product = await response.json()
        console.log("Producto obtenido:", productData) // Debug log
        setProduct(productData)
      } catch (err) {
        console.error("Error al obtener producto:", err) // Debug log
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header />
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
        <Header />
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
      <Header />
      <ProductForm product={product} isEditing={true} />
    </div>
  )
}
