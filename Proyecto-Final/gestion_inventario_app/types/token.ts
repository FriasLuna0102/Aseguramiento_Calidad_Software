export interface Token {
  token: string
  username: string
  valid: boolean
  expirationDate: string | number
  rolesString: string
}

export interface TokenListResponse {
  content?: Token[]
  // En caso de que sea una respuesta paginada
  totalElements?: number
  totalPages?: number
  size?: number
  number?: number
  last?: boolean
  first?: boolean
}
