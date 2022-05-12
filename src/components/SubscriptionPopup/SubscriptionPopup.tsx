import { useState } from 'react'
import { Box, Collapse, styled, Typography, useTheme } from '@mui/material'
import { useSubscriptions } from 'state/application/hooks'
import { CloseIcon } from 'theme/components'

const Count = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 14,
  height: 20,
  width: 20,
  borderRadius: '50%',
  userSelect: 'none'
}))

const Subscribing = styled(Box)({
  color: '#ffffff',
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  fontWeight: 500,
  userSelect: 'none'
})

export default function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useTheme()
  const list = useSubscriptions()

  return (
    <>
      <Collapse in={!!list.length} orientation="horizontal">
        <Box
          position="fixed"
          top={{ xs: theme.height.mobileHeader, sm: theme.height.header }}
          zIndex={theme.zIndex.modal + 2}
          right="0"
          sx={{
            borderTopLeftRadius: isOpen ? '15px' : '30px',
            borderBottomLeftRadius: isOpen ? 0 : '30px',
            background: theme.palette.primary.main,
            overflow: 'hidden',
            '& .list': {
              height: isOpen ? 'auto' : 0,
              width: isOpen ? 'auto' : 0,
              padding: isOpen ? '10px' : 0
            }
          }}
        >
          <Box
            display="flex"
            position="relative"
            sx={{ paddingRight: isOpen ? '20px' : 0 }}
            onClick={() => {
              setIsOpen(prev => !prev)
            }}
          >
            {isOpen && (
              <CloseIcon
                top={3}
                right={3}
                sx={{
                  '& svg': {
                    color: '#ffffff'
                  }
                }}
              />
            )}
            <Box
              height={30}
              width={30}
              sx={{
                color: theme.palette.primary.main,
                borderTopLeftRadius: '50%',
                borderBottomLeftRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Count>{list.length}</Count>
            </Box>
            <Subscribing>Subscribing...</Subscribing>
          </Box>
          <Box
            className="list"
            zIndex={theme.zIndex.modal + 2}
            sx={{
              border: '1px solid ' + theme.palette.primary.main,
              background: '#ffffff',
              color: theme.palette.primary.main,
              position: 'relative'
            }}
          >
            {list.map(({ text, hash }) => (
              <Typography key={hash} maxWidth="250px" component="li">
                {text}
              </Typography>
            ))}
          </Box>
        </Box>
      </Collapse>
    </>
  )
}
