"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { useProducts } from "@/hooks/useProducts"
import { useAuth } from "@/hooks/useAuth"
import { type Product, CATEGORIES, PaginatedProducts } from "@/types/product"
import { getCurrentQuantity, getStockStatus, getPriceRange, getMinimalStock } from "@/lib/productUtils"
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, Filter } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

export default function ProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { canDelete, canCreate, canEdit } = useAuth()
  const {
    products,
    loading,
    error,
    deleteProduct,
    fetchProducts,
    refreshProducts,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize
  } = useProducts()

  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuario")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PaginatedProducts>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    last: true,
    first: true
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    product: Product | null
  }>({ isOpen: false, product: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalStats, setGlobalStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockProducts: 0
  })
  // Estado para todos los productos (cuando se necesiten filtros locales)
  const [allProducts, setAllProducts] = useState<PaginatedProducts>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    last: true,
    first: true
  })

  const debouncedSearchTerm = useDebounce(searchTerm, 150) // Reducido de 300ms a 150ms
  const debouncedCategory = useDebounce(categoryFilter, 100) // Reducido de 300ms a 100ms (instantáneo casi)
  const debouncedStock = useDebounce(stockFilter, 100) // Reducido de 300ms a 100ms (filtro local, rápido)
  const debouncedPrice = useDebounce(priceFilter, 100) // Reducido de 300ms a 100ms (filtro local, rápido)

  // Función para obtener estadísticas globales
  const fetchGlobalStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BASE_URL}/api/v1/products/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const stats = await response.json()
        setGlobalStats(stats)
      } else {
        // Si no existe el endpoint de stats, calcular manualmente
        await fetchAllProductsForStats()
      }
    } catch (error) {
      console.error("Error fetching global stats:", error)
      // Fallback: calcular estadísticas manualmente
      await fetchAllProductsForStats()
    }
  }

  // Función de respaldo para calcular estadísticas manualmente
  const fetchAllProductsForStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BASE_URL}/api/v1/products?size=9999`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const data = await response.json()
        const allProducts = data.content

        const totalValue = allProducts.reduce((sum: number, product: Product) => {
          return sum + (product.price * getCurrentQuantity(product))
        }, 0)

        const lowStockProducts = allProducts.filter((product: Product) => {
          const stockStatus = getStockStatus(product)
          return stockStatus === 'low'
        }).length

        setGlobalStats({
          totalProducts: data.totalElements,
          totalValue,
          lowStockProducts
        })
      }
    } catch (error) {
      console.error("Error calculating global stats:", error)
    }
  }

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)

    // Obtener información del usuario del localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserName(user.name || user.username || "Usuario")
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Manejar errores de chunks
  useEffect(() => {
    const handleChunkError = (event: any) => {
      if (event.error?.message?.includes("Loading chunk") || event.reason?.message?.includes("Loading chunk")) {
        window.location.reload()
      }
    }

    window.addEventListener("error", handleChunkError)
    window.addEventListener("unhandledrejection", handleChunkError)

    return () => {
      window.removeEventListener("error", handleChunkError)
      window.removeEventListener("unhandledrejection", handleChunkError)
    }
  }, [])

  // Efecto para refrescar productos cuando la página se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        refreshProducts()
        fetchGlobalStats() // También refrescar estadísticas globales
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [mounted, refreshProducts])

  // Efecto para refrescar productos cuando se navega de vuelta
  useEffect(() => {
    if (mounted) {
      refreshProducts()
      fetchGlobalStats() // Cargar estadísticas globales
    }
  }, [mounted])

  // Efecto para escuchar eventos de actualización de estadísticas globales
  useEffect(() => {
    const handleRefreshStats = () => {
      fetchGlobalStats()
    }

    window.addEventListener('refreshGlobalStats', handleRefreshStats)
    
    return () => {
      window.removeEventListener('refreshGlobalStats', handleRefreshStats)
    }
  }, [])

  // Función para obtener todos los productos cuando se necesiten filtros locales
  const fetchAllProductsForFiltering = async () => {
    try {
      const token = localStorage.getItem("token")
      // Obtener un número razonable de productos para filtrar (ajustable según necesidad)
      const response = await fetch(`${BASE_URL}/api/v1/products?size=1500&page=0`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllProducts(data)
        return data
      }
    } catch (error) {
      console.error("Error fetching all products for filtering:", error)
    }
    return null
  }

  // Efecto para la búsqueda y filtros
  useEffect(() => {
    let isActive = true;

    const performSearch = async () => {
      if (!mounted) return;
      setIsSearching(true);

      try {
        const params = new URLSearchParams({
          page: "0",
          // Si hay filtros de stock o precio, necesitamos más productos para filtrar
          size: (debouncedStock !== 'all' || debouncedPrice !== 'all') ? "1000" : pageSize.toString(),
        });

        if (debouncedSearchTerm.trim() !== '') {
          params.append('searchTerm', debouncedSearchTerm.trim());
        }

        if (debouncedCategory !== 'all') {
          params.append('category', debouncedCategory);
        }

        const token = localStorage.getItem("token");
        const response = await fetch(
            `${BASE_URL}/api/v1/products?${params.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            }
        );

        if (!response.ok) {
          throw new Error(`Error al buscar productos: ${response.status}`);
        }

        const data = await response.json();

        if (isActive) {
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        toast({
          title: "Error",
          description: "Error al buscar productos",
          variant: "destructive",
        });
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    return () => {
      isActive = false;
    };
  }, [debouncedSearchTerm, debouncedCategory, debouncedStock, debouncedPrice, mounted, pageSize]);

  // Efecto optimizado para filtros de stock y precio
  useEffect(() => {
    const needsAllProducts = (debouncedStock !== 'all' || debouncedPrice !== 'all');
    const hasAllProducts = allProducts.content.length > 0;
    
    // Solo obtener productos si realmente los necesitamos y no los tenemos
    if (mounted && needsAllProducts && !hasAllProducts) {
      fetchAllProductsForFiltering();
    }
    
    // Limpiar allProducts cuando ya no se necesiten filtros locales para liberar memoria
    if (!needsAllProducts && hasAllProducts) {
      setAllProducts({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        last: true,
        first: true
      });
    }
  }, [debouncedStock, debouncedPrice, mounted, allProducts.content.length]);

  const [localPage, setLocalPage] = useState(0)

  // Resetear página local cuando cambian los filtros
  useEffect(() => {
    setLocalPage(0)
  }, [debouncedSearchTerm, debouncedCategory, debouncedStock, debouncedPrice])

  const stats = useMemo(() => {
    const hasLocalFilters = debouncedStock !== 'all' || debouncedPrice !== 'all';
    const hasServerFilters = debouncedSearchTerm || debouncedCategory !== 'all';

    // Determinar qué productos usar como base
    let baseProducts = [];
    
    if (hasLocalFilters && allProducts.content.length > 0) {
      // Usar todos los productos para filtros locales
      baseProducts = allProducts.content;
    } else if (hasServerFilters) {
      // Usar resultados de búsqueda
      baseProducts = searchResults.content;
    } else {
      // Usar productos de página actual
      baseProducts = products.content;
    }

    // Aplicar filtros de stock y precio del lado del cliente
    let filteredProducts = baseProducts;
    
    if (debouncedStock !== 'all') {
      filteredProducts = filteredProducts.filter(product => {
        const stockStatus = getStockStatus(product);
        return stockStatus === debouncedStock;
      });
    }

    if (debouncedPrice !== 'all') {
      filteredProducts = filteredProducts.filter(product => {
        const priceRange = getPriceRange(product.price);
        return priceRange === debouncedPrice;
      });
    }

    const totalProducts = filteredProducts.length;

    // Aplicar paginación local si hay filtros de stock o precio
    let pagedProducts = filteredProducts;
    if (hasLocalFilters) {
      const startIndex = localPage * pageSize;
      const endIndex = startIndex + pageSize;
      pagedProducts = filteredProducts.slice(startIndex, endIndex);
    }

    const totalValue = filteredProducts.reduce((sum, product) => {
      return sum + (product.price * getCurrentQuantity(product))
    }, 0)

    const lowStockProducts = filteredProducts.filter((product) => {
      const stockStatus = getStockStatus(product);
      return stockStatus === 'low';
    }).length

    return { 
      totalProducts, 
      totalValue, 
      lowStockProducts, 
      displayedProducts: hasLocalFilters ? pagedProducts : baseProducts,
      allFilteredProducts: filteredProducts,
      hasLocalFilters,
      currentPageToUse: hasLocalFilters ? localPage : (hasServerFilters ? searchResults.number : currentPage)
    }
  }, [allProducts, products, searchResults, debouncedSearchTerm, debouncedCategory, debouncedStock, debouncedPrice, localPage, currentPage, pageSize])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
  }

  const handleStockChange = (value: string) => {
    setStockFilter(value)
  }

  const handlePriceChange = (value: string) => {
    setPriceFilter(value)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStockFilter("all")
    setPriceFilter("all")
    setLocalPage(0) // Reset página local
  }

  const handlePageChange = async (newPage: number) => {
    // Si hay filtros de stock o precio activos, usar paginación local
    if (debouncedStock !== 'all' || debouncedPrice !== 'all') {
      setLocalPage(newPage)
    } else {
      // Sin filtros locales, usar paginación del servidor
      try {
        if (debouncedSearchTerm || debouncedCategory !== 'all') {
          // Hay filtros del servidor, actualizar resultados de búsqueda
          setIsSearching(true);
          
          const params = new URLSearchParams({
            page: newPage.toString(),
            size: "1000", // Mantener tamaño grande para filtros locales posteriores
          });

          if (debouncedSearchTerm.trim() !== '') {
            params.append('searchTerm', debouncedSearchTerm.trim());
          }

          if (debouncedCategory !== 'all') {
            params.append('category', debouncedCategory);
          }

          const token = localStorage.getItem("token");
          const response = await fetch(
              `${BASE_URL}/api/v1/products?${params.toString()}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              }
          );

          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
          setIsSearching(false);
        } else {
          // Sin filtros, usar paginación básica
          await fetchProducts(newPage, pageSize)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar la página",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (product: Product) => {
    setDeleteModal({ isOpen: true, product })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return

    setIsDeleting(true)
    try {
      await deleteProduct(deleteModal.product.id)
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
      })
      setDeleteModal({ isOpen: false, product: null })
      
      // Refrescar estadísticas globales después de eliminar
      await fetchGlobalStats()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar producto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStockBadge = (product: Product) => {
    const stockStatus = getStockStatus(product)
    const quantity = getCurrentQuantity(product)
    
    if (quantity === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>
    } else if (stockStatus === 'low') {
      return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Stock Bajo
          </Badge>
      )
    } else {
      return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            En Stock
          </Badge>
      )
    }
  }

  // Determinar qué productos mostrar (filtros híbridos)
  const displayedProducts = useMemo(() => {
    const hasLocalFilters = stats.hasLocalFilters
    const hasServerFilters = debouncedSearchTerm || debouncedCategory !== 'all'
    
    // Si hay filtros locales, usar información calculada localmente
    if (hasLocalFilters) {
      const totalPages = Math.ceil(stats.totalProducts / pageSize)
      const currentPageToUse = stats.currentPageToUse
      
      return {
        content: stats.displayedProducts,
        totalElements: stats.totalProducts,
        totalPages: totalPages,
        size: pageSize,
        number: currentPageToUse,
        first: currentPageToUse === 0,
        last: currentPageToUse >= totalPages - 1 || totalPages === 0
      }
    } else if (hasServerFilters) {
      // Usar resultados de búsqueda
      return searchResults
    } else {
      // Usar productos principales del servidor
      return products
    }
  }, [stats, pageSize, searchResults, products, debouncedSearchTerm, debouncedCategory])

  // Evitar renderizado hasta que el componente esté mounted
  if (!mounted) {
    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
        </div>
    )
  }

  if (loading && !isSearching) {
    return (
        <div className="min-h-screen bg-[#F5F5F5]">
          <Header userName={userName} />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
              <p className="text-[#003B73]">Cargando productos...</p>
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
              <Button onClick={() => window.location.reload()} className="bg-[#007BFF] hover:bg-[#003B73]">
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-[#003B73]">{globalStats.totalProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#E0F0FF] rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#007BFF]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-[#003B73]">
                      ${globalStats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#E0F0FF] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#007BFF]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-[#003B73]">{globalStats.lowStockProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-white border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle className="text-2xl font-bold text-[#003B73]">Gestión de Productos</CardTitle>
                {canCreate() && (
                  <Button
                      onClick={() => router.push("/products/add")}
                      className="bg-[#007BFF] text-white hover:bg-[#003B73] focus:ring-[#007BFF] transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                  <Input
                      key="search-input"
                      placeholder="Buscar productos por nombre o descripción..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]"
                      autoComplete="off"
                  />
                  {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007BFF]"></div>
                      </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500"/>
                  <Select
                      value={categoryFilter}
                      onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-48 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]">
                      <SelectValue placeholder="Filtrar por categoría"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                      value={stockFilter}
                      onValueChange={handleStockChange}
                  >
                    <SelectTrigger className="w-44 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]">
                      <SelectValue placeholder="Filtrar por stock"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los stocks</SelectItem>
                      <SelectItem value="low">Stock Bajo</SelectItem>
                      <SelectItem value="in-stock">En Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                      value={priceFilter}
                      onValueChange={handlePriceChange}
                  >
                    <SelectTrigger className="w-48 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]">
                      <SelectValue placeholder="Filtrar por precio"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los precios</SelectItem>
                      <SelectItem value="range1">$0 - $1,000</SelectItem>
                      <SelectItem value="range2">$1,001 - $5,000</SelectItem>
                      <SelectItem value="range3">$5,001 o más</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || priceFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              </div>

              {/* Products Table */}
              {displayedProducts.content.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {displayedProducts.totalElements === 0 ? "No hay productos" : "No se encontraron productos"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {displayedProducts.totalElements === 0
                          ? "Comienza agregando tu primer producto al inventario."
                          : "Intenta ajustar los filtros de búsqueda."}
                    </p>
                    {displayedProducts.totalElements === 0 && canCreate() && (
                        <Button
                            onClick={() => router.push("/products/add")}
                            className="bg-[#007BFF] text-white hover:bg-[#003B73]"
                        >
                          <Plus className="w-4 h-4 mr-2"/>
                          Agregar Primer Producto
                        </Button>
                    )}
                  </div>
              ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F5F5F5]">
                            <TableHead className="font-semibold text-[#003B73]">Nombre</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Descripción</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Categoría</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Precio</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Cantidad</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Stock Mínimo</TableHead>
                            <TableHead className="font-semibold text-[#003B73]">Estado</TableHead>
                            {(canEdit() || canDelete()) && (
                              <TableHead className="font-semibold text-[#003B73] text-center">Acciones</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedProducts.content.map((product) => (
                              <TableRow key={product.id} className="hover:bg-[#E0F0FF] transition-colors">
                                <TableCell className="font-medium text-[#003B73]">{product.name}</TableCell>
                                <TableCell className="text-gray-600 max-w-xs truncate">{product.description}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-[#007BFF] text-[#007BFF]">
                                    {product.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-[#003B73]">
                                  ${product.price.toLocaleString("en-US", {minimumFractionDigits: 2})}
                                </TableCell>
                                <TableCell className="font-medium">{getCurrentQuantity(product)}</TableCell>
                                <TableCell className="font-medium text-gray-600">{getMinimalStock(product)}</TableCell>
                                <TableCell>{getStockBadge(product)}</TableCell>
                                {(canEdit() || canDelete()) && (
                                  <TableCell>
                                    <div className="flex items-center justify-center space-x-2">
                                      {canEdit() && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/products/edit/${product.id}`)}
                                            className="text-[#007BFF] hover:text-[#003B73] hover:bg-[#E0F0FF]"
                                        >
                                          <Edit className="w-4 h-4"/>
                                        </Button>
                                      )}
                                      {canDelete() && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(product)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4"/>
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-gray-600">
                        Mostrando {(displayedProducts.number * displayedProducts.size) + 1}-{Math.min((displayedProducts.number * displayedProducts.size) + displayedProducts.content.length, displayedProducts.totalElements)} de {displayedProducts.totalElements} productos
                        <br />
                        Página {displayedProducts.number + 1} de {displayedProducts.totalPages}
                      </div>
                      
                      {/* Selector de tamaño de página */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Mostrar:</span>
                        <Select 
                          value={pageSize.toString()} 
                          onValueChange={(value) => {
                            const newSize = parseInt(value)
                            setPageSize(newSize)
                            handlePageChange(0) // Reset to first page
                          }}
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
                      
                      <div className="flex items-center space-x-2">
                        {/* Botón primera página */}
                        {displayedProducts.number > 5 && (
                          <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(0)}
                            >
                              1
                            </Button>
                            <span className="text-gray-400">...</span>
                          </>
                        )}
                        
                        {/* Botón anterior */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(displayedProducts.number - 1)}
                            disabled={displayedProducts.first}
                        >
                          <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        
                        {/* Páginas del rango */}
                        {Array.from({length: Math.min(displayedProducts.totalPages, 10)}, (_, i) => {
                          // Mostrar solo un rango de páginas alrededor de la página actual
                          const totalPages = displayedProducts.totalPages;
                          const currentPageNum = displayedProducts.number;
                          let startPage = Math.max(0, currentPageNum - 4);
                          let endPage = Math.min(totalPages - 1, startPage + 9);
                          
                          // Ajustar si estamos cerca del final
                          if (endPage - startPage < 9) {
                            startPage = Math.max(0, endPage - 9);
                          }
                          
                          if (i < startPage || i > endPage) return null;
                          
                          return (
                            <Button
                                key={i}
                                variant={displayedProducts.number === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(i)}
                            >
                              {i + 1}
                            </Button>
                          );
                        }).filter(Boolean)}
                        
                        {/* Botón siguiente */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(displayedProducts.number + 1)}
                            disabled={displayedProducts.last}
                        >
                          <ChevronRight className="h-4 w-4"/>
                        </Button>
                        
                        {/* Botón última página */}
                        {displayedProducts.number < displayedProducts.totalPages - 6 && (
                          <>
                            <span className="text-gray-400">...</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(displayedProducts.totalPages - 1)}
                            >
                              {displayedProducts.totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({isOpen: false, product: null})}
            onConfirm={handleDeleteConfirm}
            productName={deleteModal.product ? deleteModal.product.name : ""}
            isLoading={isDeleting}
        />
      </div>
  )
}