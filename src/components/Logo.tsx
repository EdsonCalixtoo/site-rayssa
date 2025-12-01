export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl'
  };

  // Simple elegant "R" with a diamond accent
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden`}>
      {/* Subtle diamond accent in corner */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 transform rotate-45"></div>
      
      {/* Main R text */}
      <span className={`${textSizeClasses[size]} font-bold tracking-tighter leading-none`} style={{
        color: 'white',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontWeight: '700'
      }}>
        R
      </span>
    </div>
  );
}
