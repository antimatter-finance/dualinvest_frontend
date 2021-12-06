import { Box, Typography } from '@mui/material'
import Button from 'components/Button/Button'
import OutlineButton from 'components/Button/OutlineButton'
import Modal from 'components/Modal'

export default function ConfirmDepositModal({
  onDismiss,
  isOpen,
  children
}: {
  onDismiss: () => void
  isOpen: boolean
  children: React.ReactNode
}) {
  return (
    <Modal closeIcon customIsOpen={isOpen} customOnDismiss={onDismiss}>
      <Box padding="22px 32px" display="grid" gap="32px">
        <Typography fontSize={20} sx={{ color: theme => theme.palette.text.secondary }}>
          Confirm Deposit
        </Typography>
        <Box>{children}</Box>
        <Box>
          <Box display="flex" gap="16px">
            <OutlineButton onClick={onDismiss} primary>
              Cancel
            </OutlineButton>
            <Button onClick={onDismiss}>Confirm</Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
