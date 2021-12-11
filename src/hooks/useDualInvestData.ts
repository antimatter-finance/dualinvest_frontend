import { useEffect, useState } from 'react'
import { Axios } from 'utils/axios'
import { ProductList, productListFormatter, productFormatter, Product, OrderRecord } from 'utils/fetch/product'
import { AccountRecord } from 'utils/fetch/account'
import { useActiveWeb3React } from 'hooks'

export enum InvestStatus {
  Confirming = 1,
  Ordered = 2,
  ReadyToSettle = 3,
  Settled = 4,
  OrderFailed = 5,
  OrderSuccess = 6
}

export function useProductList() {
  const [productList, setProductList] = useState<ProductList | undefined>(undefined)

  useEffect(() => {
    const id = setInterval(() => {
      Axios.get('getProducts')
        .then(r => {
          if (r.data.code !== 200) {
            throw Error(r.data.msg)
          }
          setProductList(productListFormatter(r.data.data))
        })
        .catch(e => {
          console.error(e)
        })
    }, 3000)

    return () => {
      clearInterval(id)
    }
  })
  return productList
}

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | undefined>(undefined)

  useEffect(() => {
    const id = setInterval(() => {
      Axios.get('getProducts?productId=' + productId)
        .then(r => {
          if (r.data.code !== 200) {
            throw Error(r.data.msg)
          }
          setProduct(productFormatter(r.data.data))
        })
        .catch(e => {
          console.error(e)
        })
    }, 3000)

    return () => {
      clearInterval(id)
    }
  })
  return product
}

export function useAccountRecord(pageNum = 1, pageSize = 8) {
  const { account } = useActiveWeb3React()
  const [accountRecord, setAccountRecord] = useState<AccountRecord | undefined>(undefined)
  const [pageParams, setPageParams] = useState<{ count: number; perPage: number; total: number }>({
    count: 0,
    perPage: 0,
    total: 0
  })

  useEffect(() => {
    const id = setInterval(() => {
      Axios.get('getAccountRecord', { address: account, pageNum, pageSize })
        .then(r => {
          if (r.data.code !== 200) {
            throw Error(r.data.msg)
          }
          setAccountRecord(r.data.data)
          setPageParams({
            count: parseInt(r.data.data.pages, 10),
            perPage: parseInt(r.data.data.size, 10),
            total: parseInt(r.data.data.total, 10)
          })
        })
        .catch(e => {
          console.error(e)
        })
    }, 3000)

    return () => {
      clearInterval(id)
    }
  }, [account, pageNum, pageSize])
  return { accountRecord, pageParams }
}

export function useOrderRecords(investStatus?: number, pageNum?: number, pageSize?: number) {
  const { account } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<OrderRecord[] | undefined>(undefined)
  const [pageParams, setPageParams] = useState<{ count: number; perPage: number; total: number }>({
    count: 0,
    perPage: 0,
    total: 0
  })

  useEffect(() => {
    const fn = () =>
      Axios.get<{ records: OrderRecord[]; pages: string; size: string; total: string }>('getOrderRecord', {
        address: null,
        investStatus,
        pageNum,
        pageSize
      })

    const callback = (r: any) => {
      if (r.data.code !== 200) {
        throw Error(r.data.msg)
      }
      setOrderList(r.data.data.records)
      setPageParams({
        count: parseInt(r.data.data.pages, 10),
        perPage: parseInt(r.data.data.size, 10),
        total: parseInt(r.data.data.total, 10)
      })
    }

    const id = setInterval(() => {
      fn()
        .then(r => callback(r))
        .catch(e => {
          clearInterval(id)
          retryRequest(fn, 3000, 5)
          console.error(e)
        })
    }, 3000)
  }, [account, investStatus, pageNum, pageSize])
  return {
    orderList,
    pageParams
  }
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

const retryRequest = (request: () => Promise<any>, delay: number, retries: number): Promise<any> =>
  new Promise((resolve, reject) => {
    return request()
      .then(resolve)
      .catch(reason => {
        if (retries > 0) {
          return wait(delay)
            .then(retryRequest.bind(null, request, delay, retries - 1))
            .then(resolve)
            .catch(reject)
        }
        return reject(reason)
      })
  })
