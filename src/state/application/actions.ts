import { createAction } from '@reduxjs/toolkit'

export type PopupContent = {
  txn: {
    hash?: string
    success: boolean
    summary?: string
  }
}

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  MENU
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const addSubscription = createAction<{ hash: string; text: string }>('application/addSubscription')
export const removeSubscription = createAction<{ hash: string }>('application/removeSubscription')
