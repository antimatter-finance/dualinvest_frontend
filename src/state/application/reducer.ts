import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  ApplicationModal,
  setOpenModal,
  addSubscription,
  removeSubscription
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

type SubscriptionList = Array<{ hash: string; text: string }>
export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly subscriptionList: SubscriptionList
  readonly openModal: ApplicationModal | null
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  subscriptionList: [],
  openModal: null
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter(popup => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs
        }
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach(p => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(removeSubscription, (state, { payload: { hash } }) => {
      const index = state.subscriptionList.findIndex(p => {
        return p.hash === hash
      })
      if (index === -1) return
      state.subscriptionList.splice(index, 1)
    })
    .addCase(addSubscription, (state, { payload: { hash, text } }) => {
      state.subscriptionList = (hash
        ? state.subscriptionList.filter(item => item.hash !== hash)
        : state.subscriptionList
      ).concat([
        {
          hash,
          text
        }
      ])
    })
)
