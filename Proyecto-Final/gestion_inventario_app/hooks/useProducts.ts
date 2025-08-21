"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import type { Product, PaginatedProducts } from "@/types/product"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

export function useProducts() {
  const { handleUnauthorized } = useAuth()
  const [products, setProducts] = useState<PaginatedProducts>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    last: true,
    first: true
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchProducts = async (
      page = currentPage,
      size = pageSize,
      searchTerm?: string,
      category?: string
  ) => {
    if (!mounted) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })

      if (searchTerm && searchTerm.trim() !== '') {
        params.append('name', searchTerm.trim())
      }

      if (category && category !== 'all') {
        params.append('category', category)
      }

      const token = localStorage.getItem("token")
      const response = await fetch(
          `${BASE_URL}/api/v1/products?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
      )

      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`)
      }

      const data: PaginatedProducts = await response.json()
      setProducts(data)
      setCurrentPage(page)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProducts({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        last: true,
        first: true
      })
    } finally {
      setLoading(false)
    }
  }


  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

      console.log("Enviando producto:", productData)

      const response = await fetch(`${BASE_URL}/api/v1/products`, {
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
      console.log("Producto creado:", newProduct)

      // Refrescar los productos desde el servidor para mantener consistencia
      await fetchProducts(currentPage, pageSize)

      // Emitir evento personalizado para refrescar estadísticas globales
      window.dispatchEvent(new CustomEvent('refreshGlobalStats'))

      return newProduct
    } catch (err) {
      console.error("Error en addProduct:", err)
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

      console.log("Actualizando producto:", id, productData)

      const response = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
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
      console.log("Producto actualizado:", updatedProduct)

      // Refrescar los productos desde el servidor para mantener consistencia
      await fetchProducts(currentPage, pageSize)

      // Emitir evento personalizado para refrescar estadísticas globales
      window.dispatchEvent(new CustomEvent('refreshGlobalStats'))

      return updatedProduct
    } catch (err) {
      console.error("Error en updateProduct:", err)
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      const response = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar producto: ${response.status}`)
      }

      // Refrescar los productos desde el servidor para mantener consistencia
      await fetchProducts(currentPage, pageSize)

      // Emitir evento personalizado para refrescar estadísticas globales
      window.dispatchEvent(new CustomEvent('refreshGlobalStats'))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const getProductById = (id: string): Product | undefined => {
    return products.content.find(product => product.id === id)
  }

  const refreshProducts = async () => {
    await fetchProducts(currentPage, pageSize)
  }

  useEffect(() => {
    if (mounted) {
      fetchProducts()
    }
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    products,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage, 
    setPageSize,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts,
  }
}
