import { useState } from 'react'
import { Box } from '@mui/material'
//import Tabs from 'components/Tabs/Tabs'
import TabButton from 'components/Button/TabButton'
import useBreakpoint from 'hooks/useBreakpoint'

enum Tabs {
  dualInvest = 'Dual Investment',
  chainType = 'Chain-Type Option',
  recurVault = 'Recurring Vault'
}

export default function InvestTabs({
  dualInvestContent,
  chainTypeContent,
  recurVaultContent
}: {
  dualInvestContent: JSX.Element
  chainTypeContent?: JSX.Element
  recurVaultContent?: JSX.Element
}) {
  const [currentTab, setCurrentTab] = useState(Tabs.dualInvest)
  const isDownMd = useBreakpoint('md')
  return (
    <Box
      sx={{
        maxWidth: theme => theme.width.maxContent,
        margin: { xs: '0 0 auto', md: '62px 0 auto' },
        width: '100%',
        padding: { xs: 20, md: 0 }
      }}
    >
      <TabButton
        onClick={() => {
          setCurrentTab(Tabs.dualInvest)
        }}
        active={currentTab === Tabs.dualInvest}
        sx={{ marginRight: 20, width: isDownMd ? 100 : 180 }}
      >
        {Tabs.dualInvest}
      </TabButton>
      {chainTypeContent && (
        <TabButton
          onClick={() => {
            setCurrentTab(Tabs.chainType)
          }}
          active={currentTab === Tabs.chainType}
          sx={{ width: isDownMd ? 140 : 180, marginRight: 20 }}
        >
          {Tabs.chainType}
        </TabButton>
      )}
      {recurVaultContent && (
        <TabButton
          onClick={() => {
            setCurrentTab(Tabs.recurVault)
          }}
          active={currentTab === Tabs.recurVault}
          sx={{ width: isDownMd ? 140 : 180 }}
        >
          {Tabs.recurVault}
        </TabButton>
      )}

      {currentTab === Tabs.dualInvest && dualInvestContent}
      {currentTab === Tabs.chainType && chainTypeContent}
      {currentTab === Tabs.recurVault && recurVaultContent}
    </Box>
  )
}

/* function Tab({ text }: { text: string }) {
  return (
    <Typography
      key="position"
      fontWeight={500}
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 8.45, md: 12 } }}
    >
      {text}
    </Typography>
  )
} */