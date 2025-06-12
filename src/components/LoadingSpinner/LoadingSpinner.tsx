import { Spinner } from '../ui'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <Spinner 
      variant="dots" 
      size={size} 
      color="primary" 
      message={message}
      centered
    />
  )
}