import { useEffect, useState } from 'react'
import { Axios } from 'utils/axios'
import { ProductList, productListFormatter, productFormatter, Product } from 'utils/fetch/product'
import { AccountRecord, accountRecordFormatter, fetchAccountRecord } from 'utils/fetch/account'

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

export function useAccountRecord() {
  const [accountRecord, setAccountRecord] = useState<AccountRecord | undefined>(undefined)

  useEffect(() => {
    const id = setInterval(() => {
      fetchAccountRecord()
        .then(r => {
          if (r.data.code !== 200) {
            throw Error(r.data.msg)
          }
          setAccountRecord(accountRecordFormatter(r.data.data))
        })
        .catch(e => {
          console.error(e)
        })
    }, 3000)

    return () => {
      clearInterval(id)
    }
  })
  return accountRecord
}