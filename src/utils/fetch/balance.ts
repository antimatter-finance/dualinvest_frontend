import { ZERO_ADDRESS } from 'constants/index'
import { Token, TokenAmount } from 'constants/token'
import { trimNumberString } from 'utils/trimNumberString'
// import { trimNumberString } from 'utils/trimNumberString'

// interface assetBalanceRaw {
//   Investing: string
//   Available: string
//   Deposit_Amount: string
//   PnL: string
// }

export type BalanceInfo = {
  available: undefined | string
  locked: undefined | string
  pnl: undefined | string
  totalInvest: undefined | string
  recurLocked?: undefined | string
  recurTotal?: undefined | string
  recurAvailable?: undefined | string
}

enum BalanceOrder {
  available,
  investing,
  earned
}

export function assetBalanceFormatter(data: any[][] | any[], precision: number): BalanceInfo | undefined {
  if (!data) return undefined
  const token = new Token(1, ZERO_ADDRESS, precision)
  const available = new TokenAmount(token, data[BalanceOrder.available].toString())
  const locked = new TokenAmount(token, data[BalanceOrder.investing].toString())

  return {
    available: available.toFixed(4),
    locked: locked.toFixed(4),
    pnl: data[BalanceOrder.earned]?.data?.data?.PnL
      ? trimNumberString(data[BalanceOrder.earned]?.data?.data?.PnL, 4)
      : '-',
    totalInvest: available.add(locked).toFixed(4)
  }
  // return {
  //   available: trimNumberString(data.Available, 4),
  //   locked: trimNumberString(data.Investing, 4),
  //   pnl: trimNumberString(data.PnL, 4),
  //   totalInvest: trimNumberString(data.Deposit_Amount, 4)
  // }
}
