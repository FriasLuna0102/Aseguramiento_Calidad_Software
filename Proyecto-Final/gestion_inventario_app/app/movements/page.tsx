"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/useAuth"
import { useMovements } from "@/hooks/useMovements"
import type { MovementFilters, MovementType } from "@/types/movement"
import { History, Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, RefreshCw, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MovementsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuario")

  // Estados de filtros
  const [filters, setFilters] = useState<MovementFilters>({
    productName: searchParams.get('productName') || '',
    username: searchParams.get('username') || '',
    searchTerm: searchParams.get('searchTerm') || '',
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
    page: parseInt(searchParams.get('page') || '0'),
    size: parseInt(searchParams.get('size') || '10'),
    sortBy: searchParams.get('sortBy') || 'dateModified',
    sortDirection: (searchParams.get('sortDirection') as "ASC" | "DESC") || 'DESC',
  })

  const [movementType, setMovementType] = useState<MovementType>(
    searchParams.get('movementType') as MovementType || 'all'
  )

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: filters.fromDate ? new Date(filters.fromDate) : undefined,
    to: filters.toDate ? new Date(filters.toDate) : undefined,
  })

  // Verificación de permisos y inicialización
  useEffect(() => {
    setMounted(true)

    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Verificar si tiene permisos (ROLE_ADMIN o ROLE_EMPLOYEE)
    if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE')) {
      router.push("/products")
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder al historial de movimientos.",
        variant: "destructive",
      })
      return
    }

    // Obtener información del usuario
    const user = getUser()
    if (user) {
      setUserName(user.name || user.username || "Usuario")
    }
  }, [isAuthenticated, hasRole, getUser, router, toast])

  // Actualizar URL con filtros
  const updateURL = useCallback((newFilters: MovementFilters, newMovementType: MovementType) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      }
    })
    
    if (newMovementType !== 'all') {
      params.set('movementType', newMovementType)
    }

    router.push(`/movements?${params.toString()}`, { scroll: false })
  }, [router])

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    // Validar fechas
    if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
      toast({
        title: "Error en las fechas",
        description: "La fecha de inicio debe ser anterior a la fecha de fin.",
        variant: "destructive",
      })
      return
    }

    const newFilters: MovementFilters = {
      ...filters,
      fromDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
      toDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
      page: 0, // Reset page when applying filters
    }

    // Aplicar filtros de tipo de movimiento
    if (movementType === 'entrance') {
      newFilters.minStockDifference = 1
      delete newFilters.maxStockDifference
    } else if (movementType === 'exit') {
      newFilters.maxStockDifference = -1
      delete newFilters.minStockDifference
    } else {
      delete newFilters.minStockDifference
      delete newFilters.maxStockDifference
    }

    setFilters(newFilters)
    updateURL(newFilters, movementType)
    fetchMovements(newFilters)
  }, [filters, dateRange, movementType, fetchMovements, updateURL, toast])

  // Limpiar filtros
  const clearFilters = () => {
    const clearedFilters: MovementFilters = {
      productName: '',
      username: '',
      searchTerm: '',
      fromDate: '',
      toDate: '',
      page: 0,
      size: 10,
      sortBy: 'dateModified',
      sortDirection: 'DESC',
    }
    
    setFilters(clearedFilters)
    setMovementType('all')
    setDateRange({ from: undefined, to: undefined })
    updateURL(clearedFilters, 'all')
    fetchMovements(clearedFilters)
  }

  // Cambio de página
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    updateURL(newFilters, movementType)
    fetchMovements(newFilters)
  }

  // Cambio de tamaño de página
  const handlePageSizeChange = (newSize: number) => {
    const newFilters = { ...filters, page: 0, size: newSize }
    setFilters(newFilters)
    updateURL(newFilters, movementType)
    fetchMovements(newFilters)
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (mounted && (hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLOYEE'))) {
      fetchMovements(filters)
    }
  }, [mounted, hasRole, fetchMovements, filters])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
      </div>
    )
  }

  if (!isAuthenticated() || (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE'))) {
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#007BFF] rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#003B73]">Historial de Movimientos</CardTitle>
                  <p className="text-gray-600">Registro de entradas y salidas de productos</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda global */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Búsqueda general
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar producto o usuario..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Producto */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Producto
                  </label>
                  <Input
                    placeholder="Nombre del producto"
                    value={filters.productName}
                    onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
                  />
                </div>

                {/* Usuario */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Usuario
                  </label>
                  <Input
                    placeholder="Nombre de usuario"
                    value={filters.username}
                    onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                {/* Tipo de movimiento */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tipo de movimiento
                  </label>
                  <Select
                    value={movementType}
                    onValueChange={(value: MovementType) => setMovementType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="entrance">Entradas</SelectItem>
                      <SelectItem value="exit">Salidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Fecha desde
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Fecha hasta
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={applyFilters}
                  className="bg-[#007BFF] hover:bg-[#003B73]"
                  disabled={loading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  disabled={loading}
                >
                  Limpiar Filtros
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fetchMovements(filters)}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Estado de error */}
            {error && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => fetchMovements(filters)} className="bg-[#007BFF] hover:bg-[#003B73]">
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {!error && movements.content.filter(m => m.stockDifference !== 0).length === 0 && (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
                <p className="text-gray-500">No se encontraron entradas o salidas que coincidan con los filtros aplicados.</p>
              </div>
            )}

            {/* Tabla de movimientos */}
            {!error && movements.content.filter(m => m.stockDifference !== 0).length > 0 && (
              <div className="space-y-4">
                {/* Información de resultados */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Mostrando {movements.content.filter(m => m.stockDifference !== 0).length} de {movements.totalElements} movimientos
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>Mostrar:</span>
                    <Select
                      value={filters.size.toString()}
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
                        .filter(movement => movement.stockDifference !== 0) // Filtrar movimientos sin cambio
                        .map((movement) => {
                          const movementLabel = getMovementLabel(movement.stockDifference)
                          const movementColor = getMovementColor(movement.stockDifference)
                          
                          // Solo mostrar si tiene etiqueta y color válidos
                          if (!movementLabel || !movementColor) return null
                          
                          return (
                            <TableRow key={movement.id} className="hover:bg-[#E0F0FF] transition-colors">
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
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="font-mono">
                                        {Math.abs(movement.stockDifference)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Diferencia exacta: {movement.stockDifference}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
