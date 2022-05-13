import { useState } from 'react'
import { Box, Slide, styled, Typography, useTheme, keyframes } from '@mui/material'
import { useSubscriptions } from 'state/application/hooks'
import { CloseIcon, Dots } from 'theme/components'

const listId = 'subscription_list'

const ripple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgb(49 176 71 / 40%), 0 0 0 13px rgb(49 176 71 / 40%);
  }
  100% {
    box-shadow: 0 0 0 13px rgb(49 176 71 / 40%), 0 0 0 23px rgb(49 176 71 / 0%);
`

const Count = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 14,
  height: 22,
  width: 22,
  borderRadius: '50%',
  userSelect: 'none',
  animation: `${ripple} 1s linear infinite`
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

const List = styled(Box)(({ theme }) => ({
  border: '1px solid transparent',
  background: '#ffffff',
  color: theme.palette.primary.main,
  position: 'relative',
  zIndex: theme.zIndex.modal + 2
}))

export default function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useTheme()
  const list = useSubscriptions()

  return (
    <>
      <Slide direction="left" in={!!list.length} mountOnEnter unmountOnExit>
        <Box
          position="fixed"
          top={{ xs: theme.height.mobileHeader, sm: theme.height.header }}
          zIndex={theme.zIndex.modal + 2}
          right="0"
          sx={{
            height: 40,
            borderTopLeftRadius: isOpen ? '15px' : '40px',
            borderBottomLeftRadius: isOpen ? 0 : '40px',
            background: theme.palette.primary.main,
            '&:hover': {
              cursor: 'pointer'
            },
            [`& #${listId}`]: {
              height: isOpen ? 'auto' : 0,
              width: isOpen ? 'auto' : 0,
              padding: isOpen ? '10px' : 0,
              borderColor: isOpen ? theme.palette.primary.main : 'transparent'
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
                    width: 20,
                    height: 20,
                    color: '#ffffff'
                  }
                }}
              />
            )}
            <Box
              height={40}
              width={40}
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
            <Subscribing>
              Subscribing
              <Dots />
            </Subscribing>
          </Box>
          <List id={listId}>
            {list.map(({ text, hash }) => (
              <Typography key={hash} maxWidth="250px" component="li">
                {text}
              </Typography>
            ))}
          </List>
        </Box>
      </Slide>
    </>
  )
}
