import React from "react"

interface SMLogoProps {
  className?: string
}

const SMLogo: React.FC<SMLogoProps> = ({ className = "" }) => (
  <div className={`rounded-full bg-primary flex items-center justify-center border-4 border-indigo-200 ${className}`} style={{ width: 72, height: 72 }}>
    <span className="text-3xl md:text-4xl font-extrabold text-primary-foreground leading-none select-none">SM</span>
  </div>
)

export default SMLogo
