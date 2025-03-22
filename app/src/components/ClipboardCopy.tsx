import useNotification from '@/hooks/useNotification'
import { NotificationSeverity } from '@/models/notification'
import { Copy, CopyCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CopyAddressProps {
  content: string
  address: string
  showIcon?: boolean
}

function CopyAddress({ content, address, showIcon = true }: CopyAddressProps) {
  const { addNotification } = useNotification()
  const [showCopyIndicator, setShowCopyIndicator] = useState(false)

  useEffect(() => {
    if (showCopyIndicator) {
      const timer = setTimeout(() => {
        setShowCopyIndicator(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showCopyIndicator])

  const handleClipboardCopy = (str: string) => {
    try {
      navigator.clipboard.writeText(str.toLowerCase())
      addNotification({
        message: 'Address copied',
        severity: NotificationSeverity.Success,
        dismissible: true,
      })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div
      onClick={() => {
        handleClipboardCopy(address)
        setShowCopyIndicator(true)
      }}
      className="flex cursor-pointer items-center space-x-2 text-sm"
    >
      <p>{content}</p>

      {showIcon &&
        (showCopyIndicator ? (
          <CopyCheck className="h-3 w-3 text-turtle-secondary-dark" />
        ) : (
          <Copy className="h-3 w-3 text-turtle-level4" />
        ))}
    </div>
  )
}
export default CopyAddress
