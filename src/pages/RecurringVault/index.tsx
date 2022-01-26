import React from 'react'
import { useHistory } from 'react-router-dom'
import { Box, useTheme } from '@mui/material'
import ProductBanner from 'components/ProductBanner'
import VaultCard from './VaultProductCard'
import { routes } from 'constants/routes'
import { ReactComponent as RecurVault } from 'assets/svg/recurVault.svg'
import { useRecurProcuctList } from 'hooks/useRecurData'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'

const SUPPORTED = ['BTC']

export default function RecurringVault() {
  const history = useHistory()
  const data = useRecurProcuctList()
  const theme = useTheme()

  return (
    <Box
      id="recurring_values"
      display="grid"
      justifyItems={{ xs: 'flex-start', md: 'center' }}
      width="100%"
      alignContent="flex-start"
      marginBottom="auto"
      gap={{ xs: 36, md: 48 }}
    >
      <ProductBanner
        title="Recurring Vault"
        checkpoints={['Automated strategy for yield generation']}
        val1={'$ 57,640'}
        val2={'$ 114,375'}
        unit1={''}
        unit2={''}
        subVal1={'Total BTC Subscribed'}
        subVal2={'Total USDT Subscribed'}
        img={<RecurVault />}
      />
      {SUPPORTED.map(key => {
        return (
          <React.Fragment key={key}>
            <VaultCard
              product={data?.[key as keyof typeof data]?.call}
              logoCurSymbol={key}
              priceCurSymbol={key}
              title={`${key} Covered Call Vault`}
              description={`Generates yield by running an automated ${key} covered call strategy`}
              deposit="13.2 BTC"
              onClick={() => {
                history.push(routes.recurringVaultMgmt.replace(':currency', key).replace(':type', 'call'))
              }}
              color={SUPPORTED_CURRENCIES[key].color ?? theme.palette.primary.main}
            />
            <VaultCard
              product={data?.[key as keyof typeof data]?.put}
              logoCurSymbol="USDT"
              priceCurSymbol={key}
              title={`${key} Put Selling Vault`}
              description="Generates yield by running an automated put selling strategy"
              deposit="132,567 USDT"
              onClick={() => {
                history.push(routes.recurringVaultMgmt.replace(':currency', key).replace(':type', 'put'))
              }}
              color={SUPPORTED_CURRENCIES['USDT'].color ?? theme.palette.primary.main}
            />
          </React.Fragment>
        )
      })}
    </Box>
  )
}
