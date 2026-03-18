import { useEffect } from 'react'

export default function Toast({ message, action, onAction, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="toast">
      <span className="toast-message">{message}</span>
      {action && (
        <button className="toast-action" onClick={onAction}>{action}</button>
      )}
      <button className="toast-close" onClick={onDismiss}>&times;</button>
    </div>
  )
}
