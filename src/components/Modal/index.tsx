import React from 'react'
import { Dialog, useTheme } from '@mui/material'
import useModal from 'hooks/useModal'
import { useRef } from 'react'
import { CloseIcon } from 'theme/components'

interface Props {
  children?: React.ReactNode
  closeIcon?: boolean
  width?: string
  maxWidth?: string
  isCardOnMobile?: boolean
  customIsOpen?: boolean
  customOnDismiss?: () => void
  padding?: string
  hasBorder?: boolean
}

export default function Modal(props: Props) {
  const {
    children,
    closeIcon,
    isCardOnMobile,
    customIsOpen,
    customOnDismiss,
    hasBorder = true,
    width,
    maxWidth,
    padding
  } = props
  const { isOpen, hideModal } = useModal()
  const node = useRef<any>()
  const theme = useTheme()
  const hide = customOnDismiss ? customOnDismiss : hideModal

  return (
    <>
      <Dialog
        open={customIsOpen !== undefined ? !!customIsOpen : isOpen}
        sx={{
          '& *': {
            boxSizing: 'border-box'
          },
          '& .MuiDialog-container ': {
            alignItems: { xs: !isCardOnMobile ? 'flex-end' : 'center', sm: 'center' }
          }
        }}
        PaperProps={{
          ref: node,
          sx: {
            ...{
              width: { xs: 'calc(100vw - 32px)!important', sm: width || 488 },
              maxWidth: maxWidth || 488,
              background: theme => theme.palette.background.paper,
              border: hasBorder ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
              boxShadow: 'unset',
              padding: padding || 0,
              boxSizing: 'border-box',
              borderRadius: 2,
              marginBottom: { xs: 0, sm: 100 },
              overflowX: 'hidden',
              position: 'absolute',
              overflowY: 'auto',
              maxHeight: theme => `calc(100vh - ${theme.height.header})`
            },
            ...(!isCardOnMobile
              ? {
                  [theme.breakpoints.down('sm')]: {
                    border: 'none',
                    width: '100%!important',
                    maxWidth: 'unset!important',
                    maxHeight: 'unset',
                    height: 'auto',
                    borderRadius: '0',
                    marginTop: theme.height.mobileHeader,
                    marginBottom: 0,
                    pb: '20px',
                    pt: '10px'
                  }
                }
              : {})
          }
        }}
        BackdropProps={{
          sx: {
            ...{
              backgroundColor: 'rgba(0,0,0,0.6)',
              [theme.breakpoints.down('sm')]: { top: theme.height.mobileHeader }
            }
          }
        }}
        onClose={hide}
      >
        {closeIcon && <CloseIcon onClick={hide} />}
        {children}
      </Dialog>
    </>
  )
}
