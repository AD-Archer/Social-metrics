/**
 * @fileoverview This component wraps the application and provides theme context using next-themes.
 * It's configured here to force the 'light' theme and disable system preference integration and theme switching,
 * effectively removing dark mode capability from the application.
 */
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force light theme and disable theme switching/system preference
  return (
    <NextThemesProvider
      {...props}
      attribute="class" // Keep attribute consistent if needed elsewhere, though theme is fixed
      defaultTheme="light" // Set the default theme to light
      forcedTheme="light" // Force the theme to always be light
      enableSystem={false} // Disable listening to system preference
    >
      {children}
    </NextThemesProvider>
  )
}
