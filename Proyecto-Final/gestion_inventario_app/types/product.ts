export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  quantityCurrent: number
  quantityInitial: number
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedProducts {
  content: Product[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  last: boolean
  first: boolean
}

export interface ProductFormData {
  name: string
  description: string
  category: string
  price: string
  quantity: string
}

export const CATEGORIES = [
  "Electrónicos",
  "Alimentos y Bebidas",
  "Ropa y Accesorios",
  "Hogar y Jardín",
  "Deportes",
  "Libros",
  "Salud y Belleza",
  "Automóviles",
  "Otros",
]