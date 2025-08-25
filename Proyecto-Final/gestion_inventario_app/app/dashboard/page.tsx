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
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Activity,
  AlertTriangle,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft
} from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantityCurrent: number;
  stockMinimalQuantity: number;
}

interface Movement {
  productId: string;
  productName: string;
  stockDifference: number;
  dateModified: string;
  username: string;
}

interface KPIData {
  totalInventoryValue: number;
  totalUnits: number;
  lowStockPercentage: number;
  entriesLast7Days: number;
  exitsLast7Days: number;
}

interface ProductState {
  IN_STOCK: number;
  LOW_STOCK: number;
  OUT_OF_STOCK: number;
}

interface CategoryData {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  value: number;
  urgency: number;
}

interface DailyMovement {
  date: string;
  entries: number;
  exits: number;
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, hasRole, getUser } = useAuth()
  const [userName, setUserName] = useState("Usuario")
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Estados de datos
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [kpis, setKPIs] = useState<KPIData>({
    totalInventoryValue: 0,
    totalUnits: 0,
    lowStockPercentage: 0,
    entriesLast7Days: 0,
    exitsLast7Days: 0
  })
  const [productStates, setProductStates] = useState<ProductState>({
    IN_STOCK: 0,
    LOW_STOCK: 0,
    OUT_OF_STOCK: 0
  })
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [dailyMovements, setDailyMovements] = useState<DailyMovement[]>([])

  // Función para obtener productos de la API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No hay token de autenticación')

      const response = await fetch(`${BASE_URL}/api/v1/products?page=0&size=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      console.log('Products API response:', data)
      
      // Verificar que data.content existe y es un array
      if (!data || !Array.isArray(data.content)) {
        console.warn('Products API did not return expected array format:', data)
        return []
      }
      
      return data.content
    } catch (err: any) {
      console.error('Error fetching products:', err)
      throw err
    }
  }

  // Función para obtener movimientos de la API
  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No hay token de autenticación')

      // Agregar parámetros para obtener todos los movimientos sin paginación
      const params = new URLSearchParams({
        page: '0',
        size: '1000', // Obtener muchos registros para capturar todos los movimientos
        sortBy: 'dateModified',
        sortDirection: 'DESC'
      })

      const response = await fetch(`${BASE_URL}/api/v1/product-audit/all/history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      
      // Verificar que data tiene la estructura paginada esperada
      if (data && typeof data === 'object' && Array.isArray(data.content)) {
        return data.content // Devolver solo el array de contenido
      } else if (Array.isArray(data)) {
        return data
      } else {
        console.warn('Movements API did not return expected format:', data)
        return []
      }
      
    } catch (err: any) {
      console.error('Error fetching movements:', err)
      throw err
    }
  }

  // Función para calcular el estado de un producto
  const getProductState = (product: Product): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
    if (product.quantityCurrent === 0) return 'OUT_OF_STOCK'
    if (product.quantityCurrent <= product.stockMinimalQuantity) return 'LOW_STOCK'
    return 'IN_STOCK'
  }

  // Función para calcular KPIs
  const calculateKPIs = (products: Product[], movements: Movement[]) => {
    // Asegurar que tenemos arrays válidos
    const safeProducts = Array.isArray(products) ? products : []
    const safeMovements = Array.isArray(movements) ? movements : []
    
    const totalInventoryValue = safeProducts.reduce((sum, p) => sum + (p.price * p.quantityCurrent), 0)
    const totalUnits = safeProducts.reduce((sum, p) => sum + p.quantityCurrent, 0)
    
    const lowStockCount = safeProducts.filter(p => getProductState(p) === 'LOW_STOCK').length
    const lowStockPercentage = safeProducts.length > 0 ? (lowStockCount / safeProducts.length) * 100 : 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentMovements = safeMovements.filter(m => {
      const movementDate = new Date(m.dateModified)
      const isRecent = movementDate >= sevenDaysAgo
      return isRecent
    })
    
    const entriesLast7Days = recentMovements
      .filter(m => m.stockDifference > 0)
      .reduce((sum, m) => sum + m.stockDifference, 0)
    const exitsLast7Days = Math.abs(recentMovements
      .filter(m => m.stockDifference < 0)
      .reduce((sum, m) => sum + m.stockDifference, 0))

    return {
      totalInventoryValue,
      totalUnits,
      lowStockPercentage,
      entriesLast7Days,
      exitsLast7Days
    }
  }

  // Función para calcular estados de productos
  const calculateProductStates = (products: Product[]) => {
    // Asegurar que tenemos un array válido
    const safeProducts = Array.isArray(products) ? products : []
    
    const states = safeProducts.reduce((acc, product) => {
      const state = getProductState(product)
      acc[state]++
      return acc
    }, { IN_STOCK: 0, LOW_STOCK: 0, OUT_OF_STOCK: 0 })

    return states
  }

  // Función para calcular datos por categoría
  const calculateCategoryData = (products: Product[]) => {
    // Asegurar que tenemos un array válido
    const safeProducts = Array.isArray(products) ? products : []
    const categoryMap = new Map<string, CategoryData>()

    safeProducts.forEach(product => {
      const category = product.category || 'Sin categoría'
      const state = getProductState(product)
      const value = product.price * product.quantityCurrent

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0
        })
      }

      const categoryData = categoryMap.get(category)!
      categoryData.totalValue += value

      switch (state) {
        case 'IN_STOCK':
          categoryData.inStock++
          break
        case 'LOW_STOCK':
          categoryData.lowStock++
          break
        case 'OUT_OF_STOCK':
          categoryData.outOfStock++
          break
      }
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.totalValue - a.totalValue)
  }

  // Función para calcular top productos
  const calculateTopProducts = (products: Product[]) => {
    // Asegurar que tenemos un array válido
    const safeProducts = Array.isArray(products) ? products : []
    
    return safeProducts
      .map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        value: product.price * product.quantityCurrent,
        urgency: Math.max(0, product.stockMinimalQuantity - product.quantityCurrent)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  // Función para calcular movimientos diarios
  const calculateDailyMovements = (movements: Movement[]) => {
    // Asegurar que tenemos un array válido
    const safeMovements = Array.isArray(movements) ? movements : []
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMovements = safeMovements.filter(m => new Date(m.dateModified) >= thirtyDaysAgo)
    const dailyMap = new Map<string, { entries: number, exits: number }>()

    recentMovements.forEach(movement => {
      const date = movement.dateModified.split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { entries: 0, exits: 0 })
      }

      const dayData = dailyMap.get(date)!
      if (movement.stockDifference > 0) {
        dayData.entries += movement.stockDifference
      } else {
        dayData.exits += Math.abs(movement.stockDifference)
      }
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Función principal para cargar y procesar datos
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      const [productsData, movementsData] = await Promise.all([
        fetchProducts(),
        fetchMovements()
      ])

      // Asegurar que tenemos arrays válidos antes de procesar
      const safeProducts = Array.isArray(productsData) ? productsData : []
      const safeMovements = Array.isArray(movementsData) ? movementsData : []

      setProducts(safeProducts)
      setMovements(safeMovements)

      // Calcular todas las métricas con datos seguros
      const kpiData = calculateKPIs(safeProducts, safeMovements)
      const statesData = calculateProductStates(safeProducts)
      const categoriesData = calculateCategoryData(safeProducts)
      const topProductsData = calculateTopProducts(safeProducts)
      const dailyMovementsData = calculateDailyMovements(safeMovements)

      setKPIs(kpiData)
      setProductStates(statesData)
      setCategoryData(categoriesData)
      setTopProducts(topProductsData)
      setDailyMovements(dailyMovementsData)

      console.log('Dashboard data loaded successfully', {
        products: safeProducts.length,
        movements: safeMovements.length,
        kpis: kpiData
      })

    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Error al cargar el dashboard')
      
      // Establecer valores por defecto en caso de error
      setProducts([])
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized) return
    
    const initializePage = async () => {
      if (!isAuthenticated()) {
        router.replace("/login")
        return
      }

      if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE')) {
        router.replace("/products")
        toast({
          title: "Acceso denegado",
          description: "Esta página es solo para administradores y empleados.",
          variant: "destructive",
        })
        return
      }

      const user = getUser()
      if (user?.name) {
        setUserName(user.name || user.username || "Usuario")
      }

      await loadDashboardData()
      setInitialized(true)
    }

    initializePage()
  }, [initialized, isAuthenticated, hasRole, getUser, router, toast])

  // Control de acceso
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
        {/* Botón Volver */}
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

        {/* Header del Dashboard */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#007BFF] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#003B73]">Dashboard</h1>
              <p className="text-gray-600">Visión general del inventario y estadísticas clave</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
            <span className="ml-2 text-gray-600">Cargando dashboard...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Valor Total del Inventario */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Valor Total Inventario
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-[#28A745]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#003B73]">
                    ${kpis.totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Valor total de stock actual
                  </p>
                </CardContent>
              </Card>

              {/* Unidades Totales */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Unidades Totales
                  </CardTitle>
                  <Package className="h-4 w-4 text-[#007BFF]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#003B73]">
                    {kpis.totalUnits.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">
                    Total de unidades en inventario
                  </p>
                </CardContent>
              </Card>

              {/* Productos en Stock Bajo */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Stock Bajo
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-[#FFC107]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#FFC107]">
                    {kpis.lowStockPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500">
                    Productos con stock crítico
                  </p>
                </CardContent>
              </Card>

              {/* Movimientos Últimos 7 Días */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Movimientos (7 días)
                  </CardTitle>
                  <Activity className="h-4 w-4 text-[#6C757D]" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <ArrowUpRight className="h-3 w-3 text-[#28A745]" />
                      <span className="text-sm font-medium text-[#28A745]">
                        {kpis.entriesLast7Days}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ArrowDownRight className="h-3 w-3 text-[#DC3545]" />
                      <span className="text-sm font-medium text-[#DC3545]">
                        {kpis.exitsLast7Days}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Entradas / Salidas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficas Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Estado del Inventario - Donut Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-[#007BFF]" />
                    Estado del Inventario
                  </CardTitle>
                  <p className="text-sm text-gray-600">Distribución por estado de stock</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-[#28A745]">{productStates.IN_STOCK}</div>
                        <div className="text-xs text-gray-500">En Stock</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#FFC107]">{productStates.LOW_STOCK}</div>
                        <div className="text-xs text-gray-500">Stock Bajo</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#DC3545]">{productStates.OUT_OF_STOCK}</div>
                        <div className="text-xs text-gray-500">Agotado</div>
                      </div>
                    </div>
                    
                    {/* Simulación de gráfico donut con barras */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#28A745] rounded-full"></div>
                          <span className="text-sm">En Stock</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#28A745] h-2 rounded-full" 
                              style={{ 
                                width: `${products.length > 0 ? (productStates.IN_STOCK / products.length) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {products.length > 0 ? ((productStates.IN_STOCK / products.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#FFC107] rounded-full"></div>
                          <span className="text-sm">Stock Bajo</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#FFC107] h-2 rounded-full" 
                              style={{ 
                                width: `${products.length > 0 ? (productStates.LOW_STOCK / products.length) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {products.length > 0 ? ((productStates.LOW_STOCK / products.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#DC3545] rounded-full"></div>
                          <span className="text-sm">Agotado</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#DC3545] h-2 rounded-full" 
                              style={{ 
                                width: `${products.length > 0 ? (productStates.OUT_OF_STOCK / products.length) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {products.length > 0 ? ((productStates.OUT_OF_STOCK / products.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Valor por Categoría */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#007BFF]" />
                    Valor por Categoría
                  </CardTitle>
                  <p className="text-sm text-gray-600">Top 5 categorías por valor</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.slice(0, 5).map((category, index) => {
                      const maxValue = Math.max(...categoryData.map(c => c.totalValue))
                      const percentage = maxValue > 0 ? (category.totalValue / maxValue) * 100 : 0
                      const colors = ['#28A745', '#007BFF', '#FFC107', '#DC3545', '#6C757D']
                      const color = colors[index] || '#6C757D'
                      
                      return (
                        <div key={category.category} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category.category}</span>
                            <span className="text-sm text-gray-600">
                              ${category.totalValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: color
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{category.inStock + category.lowStock + category.outOfStock} productos</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 10 Productos por Valor */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-[#28A745]" />
                  Top 10 Productos por Valor
                </CardTitle>
                <p className="text-sm text-gray-600">Productos con mayor valor de inventario</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topProducts.map((product, index) => {
                    const maxValue = Math.max(...topProducts.map(p => p.value))
                    const percentage = maxValue > 0 ? (product.value / maxValue) * 100 : 0
                    
                    return (
                      <div key={product.id} className="flex items-center space-x-3 py-2">
                        <div className="w-6 h-6 bg-[#007BFF] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-medium text-sm">{product.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {product.category}
                              </Badge>
                            </div>
                            <span className="text-sm font-bold">
                              ${product.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-[#28A745] h-1 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estado por Categoría */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#003B73] flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-[#007BFF]" />
                  Estado por Categoría
                </CardTitle>
                <p className="text-sm text-gray-600">Distribución de estados dentro de cada categoría</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.slice(0, 6).map((category) => {
                    const total = category.inStock + category.lowStock + category.outOfStock
                    const inStockPerc = total > 0 ? (category.inStock / total) * 100 : 0
                    const lowStockPerc = total > 0 ? (category.lowStock / total) * 100 : 0
                    const outStockPerc = total > 0 ? (category.outOfStock / total) * 100 : 0
                    
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{category.category}</span>
                          <span className="text-sm text-gray-500">{total} productos</span>
                        </div>
                        <div className="flex w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                          {inStockPerc > 0 && (
                            <div 
                              className="bg-[#28A745] h-full" 
                              style={{ width: `${inStockPerc}%` }}
                              title={`En stock: ${category.inStock}`}
                            ></div>
                          )}
                          {lowStockPerc > 0 && (
                            <div 
                              className="bg-[#FFC107] h-full" 
                              style={{ width: `${lowStockPerc}%` }}
                              title={`Stock bajo: ${category.lowStock}`}
                            ></div>
                          )}
                          {outStockPerc > 0 && (
                            <div 
                              className="bg-[#DC3545] h-full" 
                              style={{ width: `${outStockPerc}%` }}
                              title={`Agotado: ${category.outOfStock}`}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>En stock: {category.inStock}</span>
                          <span>Stock bajo: {category.lowStock}</span>
                          <span>Agotado: {category.outOfStock}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
