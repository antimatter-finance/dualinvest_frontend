import { useMemo, useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { Box, Typography } from '@mui/material'
import { Product } from 'utils/fetch/product'
import InputLabel from 'components/Input/InputLabel'
import TextButton from 'components/Button/TextButton'
import { OutlinedCard } from 'components/Card/Card'
import { useActiveWeb3React } from 'hooks'
import { feeRate } from 'constants/index'
import { Axios } from 'utils/axios'
import useModal from 'hooks/useModal'
import ActionModal, { ActionType } from 'pages/Account/modals/ActionModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import TransactionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import { useDualInvestBalance } from 'hooks/useDualInvest'
import { tryParseAmount } from 'utils/parseAmount'
import { useAddPopup, useRemoveSubscription } from 'state/application/hooks'
import { InvesStatus, InvesStatusType, OrderRecord } from 'utils/fetch/record'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useDualInvestCallback } from 'hooks/useDualInvest'
import { trimNumberString } from 'utils/trimNumberString'
import { MgmtForm } from 'components/MgmtForm/MgmtForm'
import { CURRENCIES } from 'constants/currencies'
import useBreakpoint from 'hooks/useBreakpoint'
import SecondaryButton from 'components/Button/SecondaryButton'
import { NETWORK_CHAIN_ID } from 'constants/chain'

enum ErrorType {
  insufficientBalance = 'Insufficient Balance',
  singleLimitExceed = 'Single Limit Exceeded'
}

export default function SubscribeForm({
  product,
  setAmount,
  amount,
  id
}: {
  amount: string
  product?: Product
  setAmount: (val: string) => void
  id: string
}) {
  const { account, chainId } = useActiveWeb3React()
  const isDownMd = useBreakpoint('md')
  const [currentCurrency, setCurrentCurrency] = useState(
    CURRENCIES[chainId ?? NETWORK_CHAIN_ID][product?.investCurrency ?? 'BTC']
  )
  const [pending, setPending] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const multiplier = product ? (product.type === 'CALL' ? 1 : +product.strikePrice) : 1

  const balance = useDualInvestBalance(currentCurrency)
  const { showModal, hideModal } = useModal()

  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const { createOrderCallback, checkOrderStatusCallback } = useDualInvestCallback()
  const removeSubscription = useRemoveSubscription()

  const handleMax = useCallback(() => {
    if (!product) return
    const maxAvailable = balance ? Math.floor(+balance / ((product ? +product?.multiplier : 1) * multiplier)) : 0
    setAmount(trimNumberString(`${maxAvailable > +product?.orderLimit ? product.orderLimit : maxAvailable}`, 0))
  }, [balance, multiplier, product, setAmount])

  const handleChange = useCallback(
    e => {
      setAmount(e.target.value ? Math.floor(+e.target.value) + '' : '')
    },
    [setAmount]
  )

  const showDeposit = useCallback(() => {
    setIsDepositOpen(true)
  }, [])

  const hideDeposit = useCallback(() => {
    setIsDepositOpen(false)
  }, [])

  const confirmData = useMemo(
    () => ({
      ['Platform service fee']: feeRate,
      ['Spot Price']: product?.currentPrice ?? '-' + ' USDT',
      ['APY']: product?.apy ? (+product.apy * 100).toFixed(2) + '%' : '- %',
      ['Strike Price']: product?.strikePrice ?? '-' + ' USDT',
      ['Delivery Date']: product ? dayjs(product.expiredAt).format('DD MMM YYYY') + ' 08:30:00 AM UTC' : '-'
    }),
    [product]
  )

  const data = useMemo(
    () => ({
      ['Spot Price']: product?.currentPrice ?? '-' + ' USDT',
      ['APY']: product?.apy ? (+product.apy * 100).toFixed(2) + '%' : '- %',
      ['Strike Price']: product?.strikePrice || '-' + ' USDT',
      ['Delivery Date']: product ? dayjs(product.expiredAt).format('DD MMM YYYY') + ' 08:30:00 AM UTC' : '-'
    }),
    [product]
  )
  const error = useMemo(() => {
    if (!product || !balance) return ''
    let str = ''
    if (amount !== '' && +balance < +amount * +product.multiplier * multiplier) str = ErrorType.insufficientBalance
    if (
      amount !== '' &&
      (+amount > +product.orderLimit / +product.multiplier || +amount < getMinAmount(product).amount)
    )
      str = ErrorType.singleLimitExceed
    return str
  }, [amount, balance, multiplier, product])

  const handleSubscribe = useCallback(
    async (setIsConfirmed: (isConfirmed: boolean) => void) => {
      if (!product || !amount || !createOrderCallback || !checkOrderStatusCallback) return
      const valRaw = +amount * +product?.multiplier * multiplier

      const val = tryParseAmount(valRaw.toFixed(2), currentCurrency)?.raw?.toString()
      if (!val) return
      try {
        setPending(true)
        showModal(<TransacitonPendingModal />)
        const backendCall = await Axios.post<any>(
          'createOrder',
          {},
          {
            chainId,
            account,
            amount,
            product_id: id
          }
        )
        if (backendCall.data.code !== 200) throw Error('Backend Error')
        if (!backendCall.data.data) throw Error(backendCall.data.msg)
        const { orderId, productId } = backendCall.data.data
        const orderStatusRes = await checkOrderStatusCallback(orderId)
        if (orderStatusRes.status !== 0) {
          throw Error('Order Exist')
        }

        const createOrderRes = await createOrderCallback(orderId, productId, val, currentCurrency.address, 0)
        addTransaction(createOrderRes, {
          createOrder: true,
          summary: `Subscribe ${(+amount * +product?.multiplier * multiplier).toFixed(2)} ${
            product.investCurrency
          } to ${product?.currency} [${product?.type === 'CALL' ? 'Upward' : 'Downward'}]`
        })
        hideModal()
        setPending(false)
        setIsConfirmed(false)
        setAmount('')
        showModal(<TransactionSubmittedModal />)
        let fail = 0
        const polling = new Promise((resolve, reject) => {
          const timeoutId = setInterval(() => {
            Axios.get<{ records: OrderRecord[] }>('getOrderRecord?orderId=' + orderId, { address: account, chainId })
              .then(r => {
                const statusCode = r.data.data.records[0].investStatus as keyof typeof InvesStatus
                if (InvesStatus[statusCode] === InvesStatusType.ERROR) {
                  removeSubscription(createOrderRes.hash)
                  clearInterval(timeoutId)
                  reject('Subscription fail')
                  throw Error('Subscription failed, please try again later')
                }
                if (InvesStatus[statusCode] === InvesStatusType.SUCCESS) {
                  clearInterval(timeoutId)
                  removeSubscription(createOrderRes.hash)
                  resolve(() => {})
                  showModal(
                    <TransactionSubmittedModal header="Successful Subscription!">
                      Your subscription will be shown in the position section shortly.
                    </TransactionSubmittedModal>
                  )
                }
              })
              .catch(() => {
                if (fail > 6) {
                  clearInterval(timeoutId)
                  reject('Confirm Order timeout')
                  throw Error('Confirm Order timeout')
                }
                fail++
              })
          }, 5000)
        })
        await polling

        addPopup(
          {
            txn: {
              success: true,
              summary: `Subscribed ${(+amount * +product?.multiplier * multiplier).toFixed(2)} ${
                product.investCurrency
              } successfully to ${product?.currency} [${
                product?.type === 'CALL' ? 'Upward' : 'Downward'
              }], order ID:${orderId}`
            }
          },
          orderId + ''
        )

        setIsConfirmed(false)
      } catch (e) {
        setPending(false)
        setIsConfirmed(false)
        setAmount('')
        showModal(<MessageBox type="error">{(e as any)?.error?.message || (e as Error).message || e}</MessageBox>)
        console.error(e)
      }
    },
    [
      account,
      addPopup,
      addTransaction,
      amount,
      chainId,
      checkOrderStatusCallback,
      createOrderCallback,
      currentCurrency,
      hideModal,
      id,
      multiplier,
      product,
      removeSubscription,
      setAmount,
      showModal
    ]
  )

  useEffect(() => {
    setCurrentCurrency(CURRENCIES[chainId ?? NETWORK_CHAIN_ID][product?.investCurrency ?? 'BTC'])
  }, [chainId, product?.investCurrency])

  return (
    <>
      <ActionModal isOpen={isDepositOpen} onDismiss={hideDeposit} token={currentCurrency} type={ActionType.DEPOSIT} />
      <MgmtForm
        confirmData={confirmData}
        product={product}
        data={data}
        inputPlaceholder={`Each unit represents ${
          product ? +product.multiplier * multiplier : '-'
        } ${product?.investCurrency || ''}`}
        amount={amount}
        onChange={handleChange}
        onMax={handleMax}
        error={error}
        account={account}
        pending={pending}
        onSubscribe={handleSubscribe}
        currentCurrency={currentCurrency}
        infoText={"Once subscribed the APY will get locked in, the product can't be cancelled after subscription."}
      >
        <Box>
          <Box display="flex" justifyContent="space-between" maxWidth={'100%'} flexWrap="wrap">
            <InputLabel>Investment Amount</InputLabel>
            <Box display="flex" alignItems="baseline">
              {!!balance && (
                <InputLabel style={{ fontSize: '12px' }}>
                  Available: {balance || '-'} {product ? product.investCurrency : ''}
                </InputLabel>
              )}

              {isDownMd ? (
                <SecondaryButton width={20} height={20} fontSize={12} style={{ marginLeft: 8 }} onClick={showDeposit}>
                  +
                </SecondaryButton>
              ) : (
                <TextButton fontSize={12} color="#11BF2D" style={{ marginLeft: 8 }} onClick={showDeposit}>
                  Deposit
                </TextButton>
              )}
            </Box>
          </Box>
          <OutlinedCard>
            <Box height="60px" display="flex" alignItems="center" padding="16px" justifyContent="space-between">
              {product && (
                <>
                  <Typography
                    component="span"
                    color="primary"
                    fontSize={16}
                    maxWidth={'55%'}
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {(+product.multiplier * +amount * multiplier).toFixed(4)} {product.investCurrency}
                  </Typography>
                  <Typography
                    component="span"
                    fontSize={12}
                    sx={{ color: theme => theme.palette.text.secondary, wordBreak: 'break-all' }}
                    maxWidth={'45%'}
                  >
                    ={+amount}*{product.multiplier} {product.currency}
                    {product?.type !== 'CALL' ? `*${product.strikePrice}` : ''}
                  </Typography>
                </>
              )}
            </Box>
          </OutlinedCard>
          <Box display="flex" mt={12} justifyContent="space-between">
            <Typography fontSize={12} sx={{ opacity: 0.5, whiteSpace: 'pre' }}>
              <span>Min: {getMinAmount(product).string}</span>
            </Typography>
            <Typography fontSize={12} sx={{ opacity: 0.5, whiteSpace: 'pre' }}>
              <span>Max: {getMaxAmount(product)}</span>
            </Typography>
          </Box>
        </Box>
      </MgmtForm>
    </>
  )
}

export const getMinAmount = (product: Product | undefined) => {
  if (!product) return { string: '-', amount: 1 }
  const multiplier = product.type === 'CALL' ? 1 : +product.strikePrice
  const amount = Math.ceil(100 / +product.strikePrice)
  return {
    string: `${amount} (${(amount * multiplier * +product.multiplier).toFixed(4)} ${product.investCurrency})`,
    amount
  }
}

export const getMaxAmount = (product: Product | undefined) => {
  if (!product) return '-'
  const multiplier = product.type === 'CALL' ? 1 : +product.strikePrice
  return `${+product.orderLimit} (${+product.orderLimit * multiplier} ${product.investCurrency})`
}
