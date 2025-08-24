"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/useAuth"
import { useTokens } from "@/hooks/useTokens"
import { AlertTriangle, Shield, Trash2, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function TokensAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isAdmin, getUser } = useAuth()
  const {
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
  } = useTokens()

  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuario")
  const [invalidatingTokens, setInvalidatingTokens] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)

    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Verificar si es administrador
    if (!isAdmin()) {
      router.push("/products") // Redirigir si no es admin
      return
    }

    // Obtener información del usuario
    const user = getUser()
    if (user) {
      setUserName(user.name || user.username || "Administrador")
    }
  }, [isAuthenticated, isAdmin, getUser, router])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchTokens(newPage, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
    fetchTokens(0, newSize)
  }

  const handleInvalidateToken = async (tokenToInvalidate: string) => {
    try {
      setInvalidatingTokens(prev => new Set(prev).add(tokenToInvalidate))
      await invalidateToken(tokenToInvalidate)
    } catch (error) {
      // El error ya se maneja en el hook useTokens
    } finally {
      setInvalidatingTokens(prev => {
        const newSet = new Set(prev)
        newSet.delete(tokenToInvalidate)
        return newSet
      })
    }
  }

  const getStatusBadge = (token: any) => {
    const isExpired = isTokenExpired(token.expirationDate)
    
    if (!token.valid) {
      return <Badge variant="destructive">Invalidado</Badge>
    } else if (isExpired) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Expirado</Badge>
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Activo</Badge>
    }
  }

  const shouldDisableInvalidate = (token: any) => {
    return !token.valid || isTokenExpired(token.expirationDate)
  }

  // Evitar renderizado hasta que el componente esté mounted
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
            <p className="text-[#003B73]">Cargando tokens...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header userName={userName} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchTokens(currentPage, pageSize)} className="bg-[#007BFF] hover:bg-[#003B73]">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="mb-4 text-[#007BFF] hover:text-[#003B73] hover:bg-[#E0F0FF]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Productos
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#007BFF] rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#003B73]">Administración de Tokens</CardTitle>
                  <p className="text-gray-600">Gestiona los tokens JWT del sistema</p>
                </div>
              </div>
              <Button
                onClick={() => fetchTokens(currentPage, pageSize)}
                variant="outline"
                className="border-[#007BFF] text-[#007BFF] hover:bg-[#E0F0FF]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {tokens.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tokens disponibles</h3>
                <p className="text-gray-500">No se encontraron tokens en el sistema.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F5]">
                      <TableHead className="font-semibold text-[#003B73]">Token</TableHead>
                      <TableHead className="font-semibold text-[#003B73]">Usuario</TableHead>
                      <TableHead className="font-semibold text-[#003B73]">Rol</TableHead>
                      <TableHead className="font-semibold text-[#003B73]">Expiración</TableHead>
                      <TableHead className="font-semibold text-[#003B73]">Estado</TableHead>
                      <TableHead className="font-semibold text-[#003B73] text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.token} className="hover:bg-[#E0F0FF] transition-colors">
                        <TableCell className="font-mono text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {truncateToken(token.token)}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium text-[#003B73]">{token.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#007BFF] text-[#007BFF]">
                            {token.rolesString}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatExpirationDate(token.expirationDate)}
                        </TableCell>
                        <TableCell>{getStatusBadge(token)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={shouldDisableInvalidate(token) || invalidatingTokens.has(token.token)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {invalidatingTokens.has(token.token) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4"/>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Invalidación</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro que deseas invalidar este token?
                                    <br />
                                    <br />
                                    <strong>Usuario:</strong> {token.username}
                                    <br />
                                    <strong>Token:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{truncateToken(token.token, 20)}</code>
                                    <br />
                                    <br />
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleInvalidateToken(token.token)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Invalidar Token
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>
                        Mostrando {tokens.length} de {totalElements} tokens
                      </span>
                      <span>•</span>
                      <span>Página {currentPage + 1} de {totalPages}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
