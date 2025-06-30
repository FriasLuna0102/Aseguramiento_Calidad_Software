"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/types/product"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchProducts = async () => {
    if (!mounted) return
    
    try {
      setLoading(true)
      setError(null)

      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      const response = await fetch("http://localhost:8080/api/v1/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`)
      }

      const data: Product[] = await response.json()
      console.log("Productos cargados desde API:", data)
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      
      console.log("Enviando producto:", productData) // Debug log
      
      const response = await fetch("http://localhost:8080/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Error al crear producto: ${response.status} - ${errorText}`)
      }

      const newProduct: Product = await response.json()
      console.log("Producto creado:", newProduct) // Debug log
      setProducts((prev) => [...prev, newProduct])
      return newProduct
    } catch (err) {
      console.error("Error en addProduct:", err)
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      
      console.log("Actualizando producto:", id, productData) // Debug log
      
      const response = await fetch(`http://localhost:8080/api/v1/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Error al actualizar producto: ${response.status} - ${errorText}`)
      }

      const updatedProduct: Product = await response.json()
      console.log("Producto actualizado:", updatedProduct) // Debug log
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)))
      return updatedProduct
    } catch (err) {
      console.error("Error en updateProduct:", err)
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      const response = await fetch(`http://localhost:8080/api/v1/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar producto: ${response.status}`)
      }

      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const getProductById = (id: string): Product | undefined => {
    return products.find((product) => product.id === id)
  }

  useEffect(() => {
    if (mounted) {
      fetchProducts()
    }
  }, [mounted])

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  }
}

