"use client"

import { createContext, useContext, useEffect, useState } from "react"

type TThemeContext = {
  isDarkTheme: boolean
  toggleThemeHandler: () => void
}

const themeContextDefaultValues: TThemeContext = {
  isDarkTheme: true,
  toggleThemeHandler: () => {},
}

const ThemeContext = createContext<TThemeContext>(themeContextDefaultValues)

export function useTheme() {
  return useContext(ThemeContext)
}

type TProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: TProps) {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true)

  function isLocalStorageEmpty(): boolean {
    return !localStorage.getItem("isDarkTheme")
  }

  function initialThemeHandler(): void {
    if (isLocalStorageEmpty()) {
      localStorage.setItem("isDarkTheme", `true`)
      document!.querySelector("body")!.classList.add("dark")
      setIsDarkTheme(true)
    } else {
      const isDarkTheme: boolean = JSON.parse(
        localStorage.getItem("isDarkTheme")!
      )
      if (isDarkTheme) {
        document!.querySelector("body")!.classList.add("dark")
        setIsDarkTheme(true)
      } else {
        setIsDarkTheme(false)
      }
    }
  }

  // Declared after initialThemeHandler so the effect isn't reading a binding
  // before its declaration. The empty dep array is also a fix: without it this
  // re-ran on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => initialThemeHandler(), [])

  function toggleThemeHandler(): void {
    const isDarkTheme: boolean = JSON.parse(
      localStorage.getItem("isDarkTheme")!
    )
    setIsDarkTheme(!isDarkTheme)
    toggleDarkClassToBody()
    setValueToLocalStorage()
  }

  function toggleDarkClassToBody(): void {
    document!.querySelector("body")!.classList.toggle("dark")
  }

  function setValueToLocalStorage(): void {
    localStorage.setItem("isDarkTheme", `${!isDarkTheme}`)
  }

  return (
    <ThemeContext.Provider
      value={{ isDarkTheme: isDarkTheme, toggleThemeHandler }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
