"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { ProductAuditResponse, PaginatedProductAuditResponse, MovementFilters } from "@/types/movement"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

export function useMovements() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [movements, setMovements] = useState<PaginatedProductAuditResponse>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    last: true,
    first: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUnauthorized = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado.",
      variant: "destructive",
    })
    
    router.push("/login")
  }

  const fetchMovements = useCallback(async (filters: MovementFilters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Agregar parámetros básicos
      params.append('page', filters.page.toString())
      params.append('size', filters.size.toString())
      params.append('sortBy', filters.sortBy)
      params.append('sortDirection', filters.sortDirection)

      // Agregar filtros opcionales
      if (filters.productName?.trim()) {
        params.append('productName', filters.productName.trim())
      }
      
      if (filters.modificationType) {
        params.append('modificationType', filters.modificationType)
      }
      
      if (filters.username?.trim()) {
        params.append('username', filters.username.trim())
      }
      
      if (filters.minStockDifference !== undefined) {
        params.append('minStockDifference', filters.minStockDifference.toString())
      }
      
      if (filters.maxStockDifference !== undefined) {
        params.append('maxStockDifference', filters.maxStockDifference.toString())
      }
      
      if (filters.fromDate) {
        params.append('fromDate', filters.fromDate)
      }
      
      if (filters.toDate) {
        params.append('toDate', filters.toDate)
      }
      
      if (filters.searchTerm?.trim()) {
        params.append('searchTerm', filters.searchTerm.trim())
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`${BASE_URL}/api/v1/product-audit/all/history?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(`Error al cargar movimientos: ${response.status}`)
      }

      const data: PaginatedProductAuditResponse = await response.json()
      setMovements(data)
    } catch (err) {
      console.error("Error al cargar movimientos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setMovements({
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
  }, [router, toast])

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const getMovementType = (stockDifference: number) => {
    if (stockDifference > 0) return "entrance"
    if (stockDifference < 0) return "exit"
    return null // No mostrar movimientos sin cambio
  }

  const getMovementLabel = (stockDifference: number) => {
    if (stockDifference > 0) return "Entrada"
    if (stockDifference < 0) return "Salida"
    return null // No mostrar movimientos sin cambio
  }

  const getMovementColor = (stockDifference: number) => {
    if (stockDifference > 0) return "bg-green-100 text-green-800"
    if (stockDifference < 0) return "bg-red-100 text-red-800"
    return null // No mostrar movimientos sin cambio
  }

  return {
    movements,
    loading,
    error,
    fetchMovements,
    formatDate,
    getMovementType,
    getMovementLabel,
    getMovementColor,
  }
}
