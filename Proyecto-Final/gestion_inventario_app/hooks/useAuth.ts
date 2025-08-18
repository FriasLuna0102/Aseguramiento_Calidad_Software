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
    console.log("Usuario obtenido:", user) // Debug log
    const role = user?.role || null
    console.log("Rol extraído:", role) // Debug log
    return role
  }

  const hasRole = (role: string): boolean => {
    const userRole = getUserRole()
    const result = userRole === role
    console.log(`¿Usuario tiene rol '${role}'?`, result) // Debug log
    return result
  }

  const canDelete = (): boolean => {
    // Solo los usuarios que NO son ROLE_EMPLOYEE pueden eliminar
    const result = !hasRole('ROLE_EMPLOYEE')
    console.log("¿Puede eliminar?", result) // Debug log
    return result
  }

  return {
    logout,
    isAuthenticated,
    getUser,
    getUserRole,
    hasRole,
    canDelete,
  }
}
