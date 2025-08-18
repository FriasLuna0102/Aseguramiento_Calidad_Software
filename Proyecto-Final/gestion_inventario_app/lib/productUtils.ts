import type { Product } from "@/types/product"

// Función para obtener la cantidad actual de un producto
export function getCurrentQuantity(product: Product): number {
  return product.quantityCurrent || 0
}

// Función para obtener la cantidad inicial de un producto
export function getInitialQuantity(product: Product): number {
  return product.quantityInitial || 0
}

// Función para crear datos de producto para la API
export function createProductForAPI(productData: {
  name: string
  description: string
  category: string
  price: number
  quantity: number
  stockMinimalQuantity: number
}) {
  return {
    ...productData,
    quantityCurrent: productData.quantity,
    quantityInitial: productData.quantity,
    stockMinimalQuantity: productData.stockMinimalQuantity,
    
  }
}

// Función para actualizar datos de producto para la API
export function updateProductForAPI(productData: {
  name?: string
  description?: string
  category?: string
  price?: number
  quantity?: number
  stockMinimalQuantity?: number
}) {
  const result: any = { ...productData }
  
  if (productData.quantity !== undefined) {
    result.quantityCurrent = productData.quantity
    // Note: No actualizamos quantityInitial en updates, solo quantityCurrent
    delete result.quantity
  }
  
  // Asegurar que stockMinimalQuantity se incluya si está presente
  if (productData.stockMinimalQuantity !== undefined) {
    result.stockMinimalQuantity = productData.stockMinimalQuantity
  }
  
  return result
}

// Función para obtener el stock mínimo de un producto
export function getMinimalStock(product: Product): number {
  return product.stockMinimalQuantity || 0
}

// Función para determinar el estado del stock (simplificado)
export function getStockStatus(product: Product): 'low' | 'in-stock' {
  const current = getCurrentQuantity(product)
  
  if (current === 0) {
    return 'low' // Sin stock
  } else if (current <= getMinimalStock(product)) {
    return 'low' // Stock bajo
  } else {
    return 'in-stock' // En stock
  }
}

// Función para obtener el texto del estado del stock
export function getStockStatusText(status: 'low' | 'in-stock'): string {
  switch (status) {
    case 'low': return 'Stock Bajo'
    case 'in-stock': return 'En Stock'
    default: return 'Desconocido'
  }
}

// Función para determinar el rango de precio
export function getPriceRange(price: number): 'range1' | 'range2' | 'range3' {
  if (price >= 0 && price <= 1000) {
    return 'range1'
  } else if (price >= 1001 && price <= 5000) {
    return 'range2'
  } else {
    return 'range3'
  }
}

// Función para obtener el texto del rango de precio
export function getPriceRangeText(range: 'range1' | 'range2' | 'range3'): string {
  switch (range) {
    case 'range1': return '$0 - $1,000'
    case 'range2': return '$1,001 - $5,000'
    case 'range3': return '$5,001 o más'
    default: return 'Desconocido'
  }
}
