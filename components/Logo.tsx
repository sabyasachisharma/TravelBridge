interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-[10px]' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', tagline: 'text-xs' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', tagline: 'text-sm' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', tagline: 'text-base' },
  }

  const { icon, text, tagline } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Plane with Cargo Box */}
      <div className={`relative ${icon} flex-shrink-0`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            {/* Gradient Definition */}
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            {/* Shadow for depth */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Circle */}
          <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" opacity="0.1"/>
          <circle cx="32" cy="32" r="28" fill="none" stroke="url(#logoGradient)" strokeWidth="2"/>
          
          {/* Cargo Box (on bottom) */}
          <g filter="url(#shadow)">
            <rect x="24" y="34" width="12" height="10" rx="1.5" fill="#f59e0b" stroke="white" strokeWidth="1.5"/>
            <line x1="24" y1="39" x2="36" y2="39" stroke="white" strokeWidth="1" opacity="0.6"/>
            <line x1="30" y1="34" x2="30" y2="44" stroke="white" strokeWidth="1" opacity="0.6"/>
            {/* Package tape lines */}
            <path d="M26 34 L26 44" stroke="#fff" strokeWidth="0.8" opacity="0.4"/>
            <path d="M34 34 L34 44" stroke="#fff" strokeWidth="0.8" opacity="0.4"/>
          </g>
          
          {/* Airplane (on top, flying over the box) */}
          <g filter="url(#shadow)">
            {/* Plane body */}
            <path 
              d="M18 24 L32 20 L46 24 L44 26 L32 24 L20 26 Z" 
              fill="url(#logoGradient)" 
              stroke="white" 
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Plane wings */}
            <path 
              d="M24 24 L20 28 L22 29 L26 26 Z" 
              fill="url(#logoGradient)" 
              stroke="white" 
              strokeWidth="1.2"
            />
            <path 
              d="M40 24 L44 28 L42 29 L38 26 Z" 
              fill="url(#logoGradient)" 
              stroke="white" 
              strokeWidth="1.2"
            />
            {/* Plane tail */}
            <path 
              d="M18 24 L16 20 L18 19 L20 22 Z" 
              fill="url(#logoGradient)" 
              stroke="white" 
              strokeWidth="1.2"
            />
            {/* Cockpit window */}
            <circle cx="44" cy="24" r="2" fill="white" opacity="0.8"/>
          </g>
          
          {/* Motion lines (speed effect) */}
          <line x1="10" y1="22" x2="14" y2="22" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          <line x1="12" y1="26" x2="16" y2="26" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          <line x1="8" y1="18" x2="12" y2="18" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${text} font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent`}>
            CarryBridge
          </div>
          <div className={`${tagline} text-slate-500 font-medium -mt-1`}>
            Connect. Carry. Deliver.
          </div>
        </div>
      )}
    </div>
  )
}

