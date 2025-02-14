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
  useEffect(() => initialThemeHandler())

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
