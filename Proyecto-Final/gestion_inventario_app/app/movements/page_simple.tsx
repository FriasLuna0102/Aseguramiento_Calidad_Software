"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/useAuth"
import { useMovements } from "@/hooks/useMovements"
import type { MovementFilters } from "@/types/movement"
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle 
} from "lucide-react"

export default function MovementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, hasRole, getUser } = useAuth()
  const {
    movements,
    loading,
    error,
    fetchMovements,
    formatDate,
    getMovementLabel,
    getMovementColor,
  } = useMovements()

  const [userName, setUserName] = useState("Usuario")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Inicialización
  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated()) {
        router.replace("/login")
        return
      }

      if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE')) {
        router.replace("/products")
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para acceder al historial de movimientos.",
          variant: "destructive",
        })
        return
      }

      const user = getUser()
      if (user && user.name) {
        setUserName(user.name || user.username || "Usuario")
      }

      // Cargar datos iniciales
      loadMovements(0, pageSize)
    }

    initializePage()
  }, [isAuthenticated, hasRole, getUser, router, toast, pageSize])

  // Función simple para cargar movimientos
  const loadMovements = (page: number, size: number) => {
    const filters: MovementFilters = {
      productName: '',
      username: '',
      searchTerm: '',
      fromDate: '',
      toDate: '',
      page: page,
      size: size,
      sortBy: 'dateModified',
      sortDirection: 'DESC',
      minStockDifference: undefined,
      maxStockDifference: undefined,
    }
    
    fetchMovements(filters)
  }

  // Cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    loadMovements(newPage, pageSize)
  }

  // Cambio de tamaño de página
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
    loadMovements(0, newSize)
  }

  // Estados de carga
  if (!isAuthenticated()) {
    return null
  }

  if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE')) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="mb-4 text-[#007BFF] hover:text-[#003B73] hover:bg-[#E0F0FF]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver a Productos
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#007BFF] rounded-lg flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#003B73]">Historial de Movimientos</CardTitle>
                <p className="text-gray-600">Registro de entradas y salidas de productos</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Estado de error */}
            {error && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => loadMovements(currentPage, pageSize)} className="bg-[#007BFF] hover:bg-[#003B73]">
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            {/* Estado de carga */}
            {loading && !error && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
              </div>
            )}

            {/* Estado vacío */}
            {!loading && !error && movements.content.filter(m => m.stockDifference !== 0).length === 0 && (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
                <p className="text-gray-500">No se encontraron entradas o salidas de productos.</p>
              </div>
            )}

            {/* Tabla de movimientos */}
            {!loading && !error && movements.content.filter(m => m.stockDifference !== 0).length > 0 && (
              <div className="space-y-4">
                {/* Información de resultados */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Mostrando {movements.content.filter(m => m.stockDifference !== 0).length} de {movements.totalElements} movimientos
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>Mostrar:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F5F5F5]">
                        <TableHead className="font-semibold text-[#003B73]">Producto</TableHead>
                        <TableHead className="font-semibold text-[#003B73]">Tipo</TableHead>
                        <TableHead className="font-semibold text-[#003B73]">Diferencia</TableHead>
                        <TableHead className="font-semibold text-[#003B73]">Fecha</TableHead>
                        <TableHead className="font-semibold text-[#003B73]">Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.content
                        .filter(movement => movement.stockDifference !== 0)
                        .map((movement) => {
                          const movementLabel = getMovementLabel(movement.stockDifference)
                          const movementColor = getMovementColor(movement.stockDifference)
                          
                          if (!movementLabel || !movementColor) return null
                          
                          return (
                            <TableRow key={movement.id} className="hover:bg-[#E0F0FF]">
                              <TableCell className="font-medium text-[#003B73]">
                                {movement.productName || movement.productId}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  <Badge className={movementColor}>
                                    {movementLabel}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {movement.modificationType}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono">
                                  {Math.abs(movement.stockDifference)}
                                </span>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatDate(movement.dateModified)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {movement.username}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {movements.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {movements.number + 1} de {movements.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(movements.number - 1)}
                        disabled={movements.first}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(movements.number + 1)}
                        disabled={movements.last}
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
