import useNotification from '@/hooks/useNotification'
import { NotificationSeverity } from '@/models/notification'
import { Copy, CopyCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

function CopyAddress({ content, address }: { content: string; address: string }) {
  const { addNotification } = useNotification()
  const [isCopyIndicator, setIsCopyIndicator] = useState(false)

  useEffect(() => {
    if (isCopyIndicator) {
      const timer = setTimeout(() => {
        setIsCopyIndicator(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopyIndicator])

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
        handleClipboardCopy(address), setIsCopyIndicator(true)
      }}
      className="flex cursor-pointer items-center space-x-2 text-sm"
    >
      <p>{content}</p>
      {isCopyIndicator ? (
        <CopyCheck className="h-3 w-3 text-turtle-primary" />
      ) : (
        <Copy className="h-3 w-3 text-turtle-secondary-dark" />
      )}
    </div>
  )
}
export default CopyAddress
