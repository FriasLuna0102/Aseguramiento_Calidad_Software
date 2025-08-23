"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/useAuth"
import { 
  BarChart3, 
  Package, 
  TrendingDown,
  Eye,
  PieChart,
  AlertTriangle,
  Grid3X3,
  ArrowRight,
  List
} from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

interface Product {
  id: string;
  name: string;
  category: string;
  quantityCurrent: number;
  stockMinimalQuantity: number;
  description?: string;
  price?: number;
  quantityInitial?: number;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

export default function ReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, hasRole, getUser } = useAuth()
  const [userName, setUserName] = useState("Usuario")
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    stockProducts: 0,
    lowStockProducts: 0,
    stockPercentage: 0,
    lowStockPercentage: 0
  })
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])

  // Función para obtener productos usando el endpoint correcto
  const fetchProductsFromAPI = async () => {
    try {
      setLoading(true)
      setError("")
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      console.log('Fetching from:', `${BASE_URL}/api/v1/products?page=0&size=1000`)
      
      const response = await fetch(`${BASE_URL}/api/v1/products?page=0&size=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data && data.content && Array.isArray(data.content)) {
        setProducts(data.content)
        calculateStats(data.content)
      } else if (Array.isArray(data)) {
        // Si la respuesta es directamente un array
        setProducts(data)
        calculateStats(data)
      } else {
        console.warn('Unexpected API response structure:', data)
        setProducts([])
        calculateStats([])
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Error al cargar los productos')
      setProducts([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular estadísticas usando la lógica correcta
  const calculateStats = (productList: Product[]) => {
    // Asegurar que tenemos un array válido
    if (!Array.isArray(productList) || productList.length === 0) {
      console.log('Product list is empty or not an array:', productList)
      setStats({
        totalProducts: 0,
        stockProducts: 0,
        lowStockProducts: 0,
        stockPercentage: 0,
        lowStockPercentage: 0
      })
      setCategoryStats([])
      return
    }

    const total = productList.length
    // Stock normal: cantidad actual > stock mínimo
    const stockNormal = productList.filter(p => p.quantityCurrent > (p.stockMinimalQuantity || 0)).length
    // Stock bajo: cantidad actual <= stock mínimo
    const lowStock = productList.filter(p => p.quantityCurrent <= (p.stockMinimalQuantity || 0)).length

    const stockPercentage = total > 0 ? Math.round((stockNormal / total) * 100) : 0
    const lowStockPercentage = total > 0 ? Math.round((lowStock / total) * 100) : 0

    setStats({
      totalProducts: total,
      stockProducts: stockNormal,
      lowStockProducts: lowStock,
      stockPercentage,
      lowStockPercentage
    })

    // Calcular estadísticas por categoría
    const categoryMap = new Map<string, number>()
    productList.forEach(product => {
      const category = product.category || 'Sin categoría'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const categoryStatsArray = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)

    setCategoryStats(categoryStatsArray)
    console.log('Stats calculated:', { 
      total, 
      stockNormal, 
      lowStock, 
      stockPercentage, 
      lowStockPercentage,
      categoryStatsArray 
    })
  }

  useEffect(() => {
    if (initialized) return
    
    const initializePage = async () => {
      if (!isAuthenticated()) {
        router.replace("/login")
        return
      }

      if (!hasRole('ROLE_GUEST')) {
        router.replace("/products")
        toast({
          title: "Acceso denegado",
          description: "Esta página es solo para usuarios invitados.",
          variant: "destructive",
        })
        return
      }

      const user = getUser()
      if (user?.name) {
        setUserName(user.name || user.username || "Usuario")
      }

      // Llamar a la API directamente con el endpoint correcto
      await fetchProductsFromAPI()
      setInitialized(true)
    }

    initializePage()
  }, [initialized, isAuthenticated, hasRole, getUser, router, toast])

  // Control de acceso simple
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28A745]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header userName={userName} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#28A745] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#003B73]">Reporte Básico</h1>
                <p className="text-gray-600">Resumen general del inventario</p>
              </div>
            </div>
            
            {/* Botón de atajo para ver productos */}
            <Button
              onClick={() => router.push("/products")}
              className="bg-[#007BFF] hover:bg-[#0056b3] text-white flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>Ver Productos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28A745]"></div>
            <span className="ml-2 text-gray-600">Cargando productos...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchProductsFromAPI}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Stock Normal */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Stock Normal
                  </CardTitle>
                  <Package className="h-4 w-4 text-[#28A745]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#28A745]">{stats.stockProducts}</div>
                  <p className="text-xs text-gray-500">
                    Stock actual &gt; stock mínimo ({stats.stockPercentage}%)
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#28A745] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(stats.stockPercentage, 2)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Bajo */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Stock Bajo
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-[#FFC107]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#FFC107]">{stats.lowStockProducts}</div>
                  <p className="text-xs text-gray-500">
                    Stock actual ≤ stock mínimo ({stats.lowStockPercentage}%)
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#FFC107] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(stats.lowStockPercentage, 2)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfica de Distribución de Stock */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-[#007BFF]" />
                    Distribución de Stock
                  </CardTitle>
                  <p className="text-sm text-gray-600">Comparación visual entre stock normal y bajo</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#28A745] rounded"></div>
                        <span className="text-sm">Stock Normal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{stats.stockProducts}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#28A745] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.max(stats.stockPercentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#FFC107] rounded"></div>
                        <span className="text-sm">Stock Bajo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{stats.lowStockProducts}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#FFC107] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.max(stats.lowStockPercentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfica de Productos por Categoría */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                    <Grid3X3 className="w-5 h-5 mr-2 text-[#007BFF]" />
                    Productos por Categoría
                  </CardTitle>
                  <p className="text-sm text-gray-600">Distribución de productos según categoría</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.slice(0, 5).map((category, index) => {
                      const colors = ['#28A745', '#007BFF', '#FFC107', '#DC3545', '#6C757D']
                      const color = colors[index] || '#6C757D'
                      
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-sm truncate max-w-[120px]" title={category.category}>
                              {category.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{category.count}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${Math.max(category.percentage, 5)}%`,
                                  backgroundColor: color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {categoryStats.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No hay categorías para mostrar
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen Total */}
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-[#007BFF]" />
                  Resumen Total
                </CardTitle>
                <p className="text-sm text-gray-600">Vista general del inventario</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#003B73]">{stats.totalProducts}</div>
                    <div className="text-sm text-gray-500">Total Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#28A745]">{stats.stockProducts}</div>
                    <div className="text-sm text-gray-500">Stock Normal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFC107]">{stats.lowStockProducts}</div>
                    <div className="text-sm text-gray-500">Stock Bajo</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de productos con stock bajo */}
            {products.length > 0 && stats.lowStockProducts > 0 && (
              <Card className="border-0 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-[#FFC107]" />
                    Productos con Stock Bajo
                  </CardTitle>
                  <p className="text-sm text-gray-600">Productos que requieren reabastecimiento</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products
                      .filter(product => product.quantityCurrent <= (product.stockMinimalQuantity || 0))
                      .slice(0, 5)
                      .map(product => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-[#003B73]">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              className="bg-[#FFF3CD] text-[#856404] border-[#FFEAA7]"
                            >
                              Stock: {product.quantityCurrent}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Min: {product.stockMinimalQuantity || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información para invitados */}
            <Card className="border-0 shadow-lg bg-[#E3F2FD]">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#003B73] flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-[#1976D2]" />
                    Vista de Invitado
                  </div>
                  <Button
                    onClick={() => router.push("/products")}
                    variant="outline"
                    size="sm"
                    className="border-[#1976D2] text-[#1976D2] hover:bg-[#1976D2] hover:text-white"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Ver Lista Completa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Como usuario invitado, tienes acceso de solo lectura a este resumen básico del inventario. 
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={() => router.push("/products")}
                      className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
                    >
                      <List className="w-5 h-5" />
                      <span className="font-medium">Explorar Todos los Productos</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {products.length === 0 && !loading && !error && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        No se encontraron productos. Verifica que el backend esté ejecutándose y que tengas productos registrados.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
