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
  
  return result
}
