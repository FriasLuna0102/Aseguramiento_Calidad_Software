"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import type { Token, TokenListResponse } from "@/types/token"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

export function useTokens() {
  const { toast } = useToast()
  const { handleUnauthorized } = useAuth()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchTokens = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      
      // Agregar parámetros de paginación
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })
      
      const response = await fetch(`${BASE_URL}/api/v1/jwt/all?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(`Error al cargar tokens: ${response.status}`)
      }

      const data = await response.json()
      
      // Manejar tanto respuesta directa como paginada
      if (Array.isArray(data)) {
        // Respuesta directa (sin paginación del servidor)
        setTokens(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else if (data.content && Array.isArray(data.content)) {
        // Respuesta paginada
        setTokens(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || data.content.length)
        setCurrentPage(data.number || page)
      } else {
        setTokens([])
        setTotalPages(0)
        setTotalElements(0)
      }
    } catch (err) {
      console.error("Error al cargar tokens:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setTokens([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }

  const invalidateToken = async (tokenToInvalidate: string) => {
    try {
      const authToken = localStorage.getItem("token")
      
      // Verificar si estamos invalidando nuestro propio token
      const isOwnToken = authToken === tokenToInvalidate
      
      const response = await fetch(`${BASE_URL}/api/v1/jwt/invalidate/${encodeURIComponent(tokenToInvalidate)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
      })

      if (response.status === 401) {
        // Solo llamar handleUnauthorized si invalidamos nuestro propio token
        if (isOwnToken) {
          handleUnauthorized()
          return
        } else {
          // Si no es nuestro token, es un error de permisos real
          throw new Error("No tienes permisos para invalidar este token")
        }
      }

      if (!response.ok) {
        throw new Error(`Error al invalidar token: ${response.status}`)
      }

      // Actualizar la lista local marcando el token como inválido
      setTokens(prevTokens => 
        prevTokens.map(t => 
          t.token === tokenToInvalidate 
            ? { ...t, valid: false }
            : t
        )
      )

      if (isOwnToken) {
        toast({
          title: "Sesión cerrada",
          description: "Has invalidado tu propio token de sesión.",
        })
        setTimeout(() => {
          handleUnauthorized()
        }, 1000) 
      } else {
        toast({
          title: "Token invalidado",
          description: "El token ha sido invalidado correctamente.",
        })
      }
    } catch (err) {
      console.error("Error al invalidar token:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al invalidar token",
        variant: "destructive",
      })
      throw err
    }
  }

  const parseDate = (expirationDate: string | number): Date | null => {
    try {
      // Si es null o undefined
      if (!expirationDate) return null

      // Si es un timestamp en milisegundos (número)
      const timestamp = Number(expirationDate)
      if (!isNaN(timestamp) && timestamp > 0) {
        // Si el timestamp es muy pequeño, podría estar en segundos, no milisegundos
        if (timestamp < 10000000000) {
          return new Date(timestamp * 1000)
        }
        return new Date(timestamp)
      }

      // Si es una cadena de fecha
      if (typeof expirationDate === 'string') {
        // Intentar parsear como fecha ISO
        const date = new Date(expirationDate)
        
        // Verificar si la fecha es válida
        if (!isNaN(date.getTime())) {
          return date
        }

        // Si no funciona, intentar otros formatos comunes
        // Formato yyyy-MM-dd HH:mm:ss
        const sqlDatePattern = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/
        const sqlMatch = expirationDate.match(sqlDatePattern)
        if (sqlMatch) {
          const [, year, month, day, hour, minute, second] = sqlMatch
          return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
        }

        // Intentar con diferentes formatos de separadores
        const altPattern = /^(\d{4})[-\/](\d{2})[-\/](\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(?:Z|[+-]\d{2}:\d{2})?$/
        const altMatch = expirationDate.match(altPattern)
        if (altMatch) {
          const [, year, month, day, hour, minute, second, ms = '0'] = altMatch
          return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), Number(ms))
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  const isTokenExpired = (expirationDate: string | number): boolean => {
    try {
      const expDate = parseDate(expirationDate)
      if (!expDate) return false
      
      const now = new Date()
      return expDate < now
    } catch {
      return false
    }
  }

  const formatExpirationDate = (expirationDate: string | number): string => {
    try {
      const date = parseDate(expirationDate)
      
      if (!date) {
        return 'Fecha inválida'
      }
      
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const truncateToken = (token: string, length: number = 10): string => {
    return token.length > length ? `${token.substring(0, length)}...` : token
  }

  useEffect(() => {
    fetchTokens(0, pageSize)
  }, [])

  return {
    tokens,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    fetchTokens,
    invalidateToken,
    isTokenExpired,
    formatExpirationDate,
    truncateToken,
    setCurrentPage,
    setPageSize,
  }
}
