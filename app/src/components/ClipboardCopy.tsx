import useNotification from '@/hooks/useNotification'
import { NotificationSeverity } from '@/models/notification'
import { Copy } from 'lucide-react'

function CopyAddress({ content, address }: { content: string; address: string }) {
  const { addNotification } = useNotification()

  const handleClipboardCopy = (str: string) => {
    try {
      navigator.clipboard.writeText(str)
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
      onClick={() => handleClipboardCopy(address)}
      className="flex cursor-pointer items-center space-x-2 text-sm"
    >
      <p>{content}</p>
      <Copy className="h-3 w-3" />
    </div>
  )
}
export default CopyAddress
