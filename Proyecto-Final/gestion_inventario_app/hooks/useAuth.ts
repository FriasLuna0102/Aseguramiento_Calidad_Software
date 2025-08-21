"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

export function useAuth() {
  const router = useRouter()
  const { toast } = useToast()

  const logout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      
      if (token) {
        // Llamar al endpoint de logout para invalidar el token en el servidor
        const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        // Aunque el endpoint falle, seguimos con el logout local
        if (!response.ok) {
          console.warn("Error al hacer logout en el servidor:", response.status)
        }
      }

      // Limpiar datos locales
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Mostrar mensaje de éxito
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      })

      // Redirigir al login
      router.push("/login")
      
    } catch (error) {
      console.error("Error durante el logout:", error)
      
      // Aunque haya error, limpiamos los datos locales y redirigimos
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      toast({
        title: "Sesión cerrada",
        description: "Se ha cerrado la sesión.",
        variant: "destructive",
      })
      
      router.push("/login")
    }
  }

  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem("token")
  }

  const getUser = () => {
    if (typeof window === 'undefined') return null
    
    const userString = localStorage.getItem("user")
    if (!userString) return null
    
    try {
      return JSON.parse(userString)
    } catch {
      return null
    }
  }

  const getUserRole = (): string | null => {
    const user = getUser()
    return user?.role || null
  }

  const hasRole = (role: string): boolean => {
    const userRole = getUserRole()
    return userRole === role
  }

  const canDelete = (): boolean => {
    // Solo los usuarios que NO son ROLE_EMPLOYEE ni ROLE_GUEST pueden eliminar
    return !hasRole('ROLE_EMPLOYEE') && !hasRole('ROLE_GUEST')
  }

  const canCreate = (): boolean => {
    // Los usuarios ROLE_GUEST no pueden crear productos
    return !hasRole('ROLE_GUEST')
  }

  const canEdit = (): boolean => {
    // Los usuarios ROLE_GUEST no pueden editar productos
    return !hasRole('ROLE_GUEST')
  }

  const isAdmin = (): boolean => {
    // Solo los usuarios ROLE_ADMIN pueden acceder a administración de tokens
    return hasRole('ROLE_ADMIN')
  }

  return {
    logout,
    isAuthenticated,
    getUser,
    getUserRole,
    hasRole,
    canDelete,
    canCreate,
    canEdit,
    isAdmin,
  }
}
