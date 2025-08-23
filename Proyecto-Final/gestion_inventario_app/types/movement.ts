export interface ProductAuditResponse {
  id: string
  productId: string
  productName?: string
  stockDifference: number
  dateModified: string // ISO string
  username: string
  modificationType: "ADD" | "MOD" | "DEL"
}

export interface PaginatedProductAuditResponse {
  content: ProductAuditResponse[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  last: boolean
  first: boolean
}

export interface MovementFilters {
  productName?: string
  modificationType?: "ADD" | "MOD" | "DEL"
  username?: string
  minStockDifference?: number
  maxStockDifference?: number
  fromDate?: string // yyyy-MM-dd
  toDate?: string // yyyy-MM-dd
  searchTerm?: string
  page: number
  size: number
  sortBy: string
  sortDirection: "ASC" | "DESC"
}

export type MovementType = "entrance" | "exit" | "all"
