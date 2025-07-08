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
import { type Product, CATEGORIES } from "@/types/product"
import { getCurrentQuantity } from "@/lib/productUtils"
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, Filter } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"


export default function ProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    products,
    loading,
    error,
    deleteProduct,
    fetchProducts,
    currentPage,
    pageSize
  } = useProducts()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuario")
  
  
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

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    product: Product | null
  }>({ isOpen: false, product: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!products?.content) return []

    return products.content.filter((product) => {
      const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = !categoryFilter || categoryFilter === "all" || product.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const stats = useMemo(() => {
    const productsArray = products?.content || []
    const totalProducts = products?.totalElements || 0
    const totalValue = productsArray.reduce((sum, product) => {
      return sum + (product.price * getCurrentQuantity(product))
    }, 0)
    const lowStockProducts = productsArray.filter((product) => getCurrentQuantity(product) < 10).length

    return { totalProducts, totalValue, lowStockProducts }
  }, [products])


  const handlePageChange = async (newPage: number) => {
    try {
      await fetchProducts(newPage, pageSize)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar la página",
        variant: "destructive",
      })
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

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>
    } else if (quantity < 10) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
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
                    <p className="text-2xl font-bold text-[#003B73]">{stats.totalProducts}</p>
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
                      ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                    <p className="text-2xl font-bold text-[#003B73]">{stats.lowStockProducts}</p>
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
                <Button
                    onClick={() => router.push("/products/add")}
                    className="bg-[#007BFF] text-white hover:bg-[#003B73] focus:ring-[#007BFF] transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                      placeholder="Buscar productos por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF]">
                      <SelectValue placeholder="Filtrar por categoría" />
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
                </div>
              </div>

              {/* Products Table */}
              {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {products.content.length === 0 ? "No hay productos" : "No se encontraron productos"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {products.content.length === 0
                          ? "Comienza agregando tu primer producto al inventario."
                          : "Intenta ajustar los filtros de búsqueda."}
                    </p>
                    {products.content.length === 0 && (
                        <Button
                            onClick={() => router.push("/products/add")}
                            className="bg-[#007BFF] text-white hover:bg-[#003B73]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
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
                            <TableHead className="font-semibold text-[#003B73]">Estado</TableHead>
                            <TableHead className="font-semibold text-[#003B73] text-center">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                              <TableRow key={product.id} className="hover:bg-[#E0F0FF] transition-colors">
                                <TableCell className="font-medium text-[#003B73]">{product.name}</TableCell>
                                <TableCell className="text-gray-600 max-w-xs truncate">{product.description}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-[#007BFF] text-[#007BFF]">
                                    {product.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-[#003B73]">
                                  ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="font-medium">{getCurrentQuantity(product)}</TableCell>
                                <TableCell>{getStockBadge(getCurrentQuantity(product))}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/products/edit/${product.id}`)}
                                        className="text-[#007BFF] hover:text-[#003B73] hover:bg-[#E0F0FF]"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(product)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Mostrando {products.content.length} de {products.totalElements} productos
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: products.totalPages }, (_, i) => (
                            <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(i)}
                            >
                              {i + 1}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === products.totalPages - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
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
            onClose={() => setDeleteModal({ isOpen: false, product: null })}
            onConfirm={handleDeleteConfirm}
            productName={deleteModal.product ? deleteModal.product.name : ""}
            isLoading={isDeleting}
        />
      </div>
  )}