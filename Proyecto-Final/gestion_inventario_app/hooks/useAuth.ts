"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useAuth() {
  const router = useRouter()
  const { toast } = useToast()

  const logout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      
      if (token) {
        // Llamar al endpoint de logout para invalidar el token en el servidor
        const response = await fetch("http://localhost:8080/api/v1/auth/logout", {
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

  return {
    logout,
    isAuthenticated,
    getUser,
  }
}
