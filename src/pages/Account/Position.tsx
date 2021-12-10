import { useCallback, useState, useMemo } from 'react'
import { Box, Typography, useTheme, IconButton, Container } from '@mui/material'
import NoDataCard from 'components/Card/NoDataCard'
import Table from 'components/Table'
import Button from 'components/Button/Button'
import Card from 'components/Card/Card'
import NumericalCard from 'components/Card/NumericalCard'
import Pagination from 'components/Pagination'
import useBreakpoint from 'hooks/useBreakpoint'
import { ReactComponent as AccordionArrowDownIcon } from 'assets/componentsIcon/accordion_arrow_down.svg'
import { ReactComponent as AccordionArrowUpIcon } from 'assets/componentsIcon/accordion_arrow_up.svg'
import Divider from 'components/Divider'
import StatusTag from 'components/Status/StatusTag'
import { useActiveWeb3React } from 'hooks'
import { useOrderRecords } from 'hooks/useDualInvestData'

enum PositionTableHeaderIndex {
  investAmount,
  apy,
  deliveryDate,
  strikePrice,
  estimatedReceive,
  date,
  status
}

const PositionTableHeader = [
  'Invest Amount',
  'APY',
  'Delivery Date',
  'Strike Price',
  'Estimated Receive',
  'Date',
  'Status',
  ''
]

const PositionMoreHeader = ['Order ID', 'Product ID', 'Holding Days', 'Settlement Price']

export default function Position() {
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const isDownMd = useBreakpoint('md')
  const { account } = useActiveWeb3React()
  const orderList = useOrderRecords()

  console.log(orderList)

  const data = useMemo(() => {
    if (!orderList) return []

    return orderList.map(({}) => {
      return {
        summary: [
          '1.290909 BTC',
          <Typography color="primary" key="1" variant="inherit">
            140.21%
          </Typography>,
          'Sep 21,2021',
          '62800.00',
          '1.954241',
          'Sep 21,2021 10:42 AM',
          <Box display="flex" key="action" gap={10} sx={{ mr: -37 }}>
            <StatusTag status="progressing" />
            <ClaimButton onClick={() => {}} />
          </Box>
        ],
        details: ['767858724324', 'BTC-UP-62800-20211129', '7 Days', '62091.35']
      }
    })
  }, [orderList])

  const hiddenParts = useCallback(() => {
    return data.map(datum => (
      <>
        {datum.details.map((datum, idx) => (
          <Box key={idx}>
            <Typography color={theme.palette.text.secondary} component="span" mr={8}>
              {PositionMoreHeader[idx]}:
            </Typography>
            <Typography component="span">{datum}</Typography>
          </Box>
        ))}
      </>
    ))
  }, [theme.palette.text.secondary])

  if (!account)
    return (
      <Container disableGutters sx={{ mt: 48 }}>
        <NoDataCard />
      </Container>
    )

  return (
    <>
      <Box sx={{ mt: 48, width: '100%' }}>
        <Card>
          <Box padding="38px 24px">
            <NumericalCard title="BTC latest spot price" value="57640.00" border={true} />

            {data && isDownMd ? (
              <PositionTableCards data={data} />
            ) : data ? (
              <Table
                header={PositionTableHeader}
                rows={data.map(datum => datum.summary)}
                hiddenParts={hiddenParts()}
                collapsible
              />
            ) : (
              <NoDataCard height="20vh" />
            )}

            <Pagination count={10} page={page} setPage={setPage} perPage={12} boundaryCount={-1} />
          </Box>
        </Card>
      </Box>
    </>
  )
}

function PositionTableCards({ data }: { data: { summary: any[]; details: any[] }[] }) {
  const [expanded, setExpanded] = useState<null | number>(null)

  return (
    <Box display="flex" flexDirection="column" gap={8} mt={24}>
      {data.map((dataRow, idx) => (
        <Card key={idx} color="#F2F5FA" padding="17px 16px">
          <Box display="flex" flexDirection="column" gap={16}>
            {dataRow.summary.map((datum, idx) => {
              if (idx === PositionTableHeaderIndex.status) return null
              return (
                <Box key={idx} display="flex" justifyContent="space-between">
                  <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }}>
                    {PositionTableHeader[idx]}
                  </Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    {datum}
                  </Typography>
                </Box>
              )
            })}
          </Box>
          <Box display="flex" gap={8} mt={20} alignItems="center" mb={18}>
            <StatusTag status="progressing" width={'120px'} />
            <ClaimButton width={84} onClick={() => {}} />
            <AccordionButton
              onClick={() => {
                expanded === idx ? setExpanded(null) : setExpanded(idx)
              }}
              expanded={expanded === idx}
            />
          </Box>
          {expanded === idx && dataRow.details && (
            <>
              <Divider extension={16} color="1px solid #252525" />
              <Box display="flex" flexDirection="column" gap={16} mt={20}>
                {dataRow.details.map((datum, idx) => {
                  return (
                    <Box key={idx} display="flex" justifyContent="space-between">
                      <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }}>
                        {PositionMoreHeader[idx]}
                      </Typography>
                      <Typography fontSize={12} fontWeight={600}>
                        {datum}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </>
          )}
        </Card>
      ))}
    </Box>
  )
}

function ClaimButton({ width, onClick }: { width?: number; onClick: () => void }) {
  return (
    <Button onClick={onClick} fontSize={14} style={{ width: width || 60, borderRadius: 4, height: 36 }}>
      Claim
    </Button>
  )
}

function AccordionButton({ onClick, expanded }: { onClick: () => void; expanded: boolean }) {
  return <IconButton onClick={onClick}>{expanded ? <AccordionArrowUpIcon /> : <AccordionArrowDownIcon />}</IconButton>
}
