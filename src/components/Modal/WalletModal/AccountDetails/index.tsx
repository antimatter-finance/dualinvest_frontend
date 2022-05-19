import { Typography, Box, useTheme, styled, Button as MuiButton } from '@mui/material'
import { useActiveWeb3React } from 'hooks/'
import { shortenAddress } from 'utils/'
import Copy from 'components/essential/Copy'
import { SUPPORTED_WALLETS } from 'constants/index'
import { injected, walletlink } from 'connectors/'
import OutlineButton from 'components/Button/OutlineButton'
import Button from 'components/Button/Button'

import SecondaryButton from 'components/Button/SecondaryButton'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { clearAllTransactions } from 'state/transactions/actions'
import Transaction from './Transaction'

const Dot = styled('span')({
  width: 24,
  height: 24,
  background: 'linear-gradient(135deg, #ffffff 4.17%, rgba(255, 255, 255, 0) 75%)',
  border: '0.6px solid #ffffff',
  borderRadius: '50%'
})

interface AccountDetailsProps {
  toggleWalletModal: () => void
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

export default function AccountDetails({
  toggleWalletModal,
  ENSName,
  openOptions,
  pendingTransactions,
  confirmedTransactions
}: AccountDetailsProps) {
  const { account, connector, chainId } = useActiveWeb3React()
  const theme = useTheme()
  const dispatch = useDispatch()

  function formatConnectorName() {
    const { ethereum } = window
    const isMetaMask = !!(ethereum && ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0]

    return (
      <Typography fontSize="0.825rem" fontWeight={500}>
        Connected with {name}
      </Typography>
    )
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <Box display="grid" width="100%" padding="16px" gridTemplateRows="50px 20px 20px" gap="12px" marginBottom="20px">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginBottom="20px"
          color={theme.textColor.text3}
        >
          {formatConnectorName()}
          {connector !== injected && connector !== walletlink && connector?.constructor.name !== 'BscConnector' && (
            <SecondaryButton
              style={{ marginRight: '8px' }}
              onClick={() => {
                ;(connector as any).close()
              }}
            >
              Disconnect
            </SecondaryButton>
          )}
        </Box>

        <Box
          display="flex"
          fontSize={24}
          fontWeight={500}
          gap="16px"
          alignItems="center"
          width="100%"
          justifyContent="center"
          id="web3-account-identifier-row"
        >
          {connector && <Dot />}
          {ENSName ? <span> {ENSName}</span> : <span> {account && shortenAddress(account)}</span>}
        </Box>

        <Box display="flex" justifyContent="center" width="100%" color={theme.textColor.text3}>
          {account && (
            <Copy toCopy={account}>
              <Typography variant="body2">Copy Address</Typography>
            </Copy>
          )}
        </Box>
      </Box>
      <Box display="flex" gap="10px" width="100%" justifyContent="center">
        <OutlineButton onClick={toggleWalletModal} primary>
          Close
        </OutlineButton>
        <Button
          onClick={() => {
            openOptions()
          }}
        >
          Change
        </Button>
      </Box>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <Box display="grid" gap="16px" width="100%" mt={20} padding={20}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Typography fontWeight={500}>Recent Transactions</Typography>
            <MuiButton variant="text" onClick={clearAllTransactionsCallback}>
              (clear all)
            </MuiButton>
          </Box>
          <Box display="grid">
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </Box>
        </Box>
      ) : (
        <Box display="flex" width="100%" justifyContent="center" marginTop={1}>
          <Typography> Your transactions will appear here...</Typography>
        </Box>
      )}
    </>
  )
}

function renderTransactions(transactions: string[]) {
  return (
    <Box>
      {transactions.slice(0, 7).map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </Box>
  )
}
