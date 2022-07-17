import { useAllTransactions } from 'state/transactions/hooks'
import { ReactComponent as SuccessIcon } from 'assets/componentsIcon/statusIcon/success_icon.svg'
import { ReactComponent as Error } from 'assets/componentsIcon/statusIcon/error_icon.svg'
import { Box, styled, useTheme } from '@mui/material'
import { ExternalLink } from 'theme/components'
import { useActiveWeb3React } from 'hooks'
import Spinner from 'components/Spinner'
import { getEtherscanLink } from 'utils'

const TransactionStatusText = styled('div')`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  :hover {
    text-decoration: underline;
  }
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const theme = useTheme()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <ExternalLink
      href={getEtherscanLink(chainId, hash, 'transaction')}
      style={{
        fontSize: 14,
        color: theme.palette.text.primary,
        textDecorationColor: theme.palette.text.primary,
        display: 'block',
        marginBottom: 5
      }}
    >
      <Box display="flex" alignItems="center" gap="20px">
        {pending ? (
          <Spinner />
        ) : success ? (
          <SuccessIcon style={{ stroke: theme.palette.success.main, width: 16, height: 16 }} />
        ) : (
          <Error style={{ stroke: theme.palette.error.main, width: 16, height: 16 }} />
        )}

        <Box display="flex">
          <TransactionStatusText>{summary ? summary : hash} ↗</TransactionStatusText>
        </Box>
      </Box>
    </ExternalLink>
  )
}
