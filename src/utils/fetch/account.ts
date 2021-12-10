interface Record {
  id: string
  account: string
  hash: string
  currency: string
  amount: string
  timestamp: string
  type: number
}

interface Order {
  column: string
  asc: boolean
}

export interface AccountRecord {
  records: Record[]
  total: string
  size: string
  current: string
  orders: Order[]
  optimizeCountSql: boolean
  hitCount: boolean
  countId: null | string
  maxLimit: null | string
  searchCount: boolean
  pages: string
}
