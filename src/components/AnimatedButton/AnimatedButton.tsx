interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: AnimatedButtonProps) => {
  const baseClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-md hover:from-gray-200 hover:to-gray-300',
    ghost: 'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:from-red-600 hover:to-pink-700'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        transform hover:scale-105 hover:shadow-xl active:scale-95
        ${baseClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

// Specialized button variants
export const PrimaryButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="secondary" {...props} />
)

export const GhostButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="ghost" {...props} />
)

export const DangerButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="danger" {...props} />
)