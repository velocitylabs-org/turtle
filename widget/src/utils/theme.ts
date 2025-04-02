// Type for hex colors that must start with #
type HexColor = `#${string}`

// Type for RGB format (e.g. "161, 132, 220")
type RGBValues = `${number}, ${number}, ${number}`

export interface WidgetTheme {
  // Primary colors
  primary?: HexColor
  primaryDark?: HexColor
  primaryLight?: HexColor

  // Secondary colors
  secondary?: HexColor
  secondaryDark?: HexColor
  secondaryLight?: HexColor
  secondaryTransparent?: HexColor
  secondary50?: HexColor
  secondaryDark40?: HexColor
  secondaryLight50?: HexColor

  // Tertiary colors
  tertiary?: HexColor
  tertiaryDark?: HexColor
  tertiaryLight?: HexColor
  tertiary70?: HexColor
  tertiaryDark60?: HexColor

  // Background and foreground
  background?: HexColor
  foreground?: HexColor

  // Level colors
  level1?: HexColor
  level2?: HexColor
  level3?: HexColor
  level4?: HexColor
  level5?: HexColor
  level6?: HexColor

  // Status colors
  success?: HexColor
  successDark?: HexColor
  successLight?: HexColor

  warning?: HexColor
  warningDark?: HexColor
  warningLight?: HexColor

  error?: HexColor
  errorDark?: HexColor
  errorLight?: HexColor
  error10?: HexColor

  // Dialog overlay
  dialogOverlayRgb?: RGBValues
  dialogOverlayOpacity?: number

  // Note
  noteWarn?: HexColor
}

// Validation function for opacity
function isValidOpacity(value: number): boolean {
  return value >= 0 && value <= 1
}

export function generateWidgetTheme(theme?: WidgetTheme) {
  if (!theme) return

  const key = 'turtle'
  const root = document.documentElement

  if (theme.dialogOverlayOpacity !== undefined && !isValidOpacity(theme.dialogOverlayOpacity))
    console.warn('dialogOverlayOpacity must be between 0 and 1')

  // Primary colors
  if (theme.primary) root.style.setProperty(`--${key}-primary`, theme.primary)
  if (theme.primaryDark) root.style.setProperty(`--${key}-primary-dark`, theme.primaryDark)
  if (theme.primaryLight) root.style.setProperty(`--${key}-primary-light`, theme.primaryLight)

  // Secondary colors
  if (theme.secondary) root.style.setProperty(`--${key}-secondary`, theme.secondary)
  if (theme.secondaryDark) root.style.setProperty(`--${key}-secondary-dark`, theme.secondaryDark)
  if (theme.secondaryLight) root.style.setProperty(`--${key}-secondary-light`, theme.secondaryLight)
  if (theme.secondaryTransparent)
    root.style.setProperty(`--${key}-secondary-transparent`, theme.secondaryTransparent)
  if (theme.secondary50) root.style.setProperty(`--${key}-secondary-50`, theme.secondary50)
  if (theme.secondaryDark40)
    root.style.setProperty(`--${key}-secondary-dark-40`, theme.secondaryDark40)
  if (theme.secondaryLight50)
    root.style.setProperty(`--${key}-secondary-light-50`, theme.secondaryLight50)

  // Tertiary colors
  if (theme.tertiary) root.style.setProperty(`--${key}-tertiary`, theme.tertiary)
  if (theme.tertiaryDark) root.style.setProperty(`--${key}-tertiary-dark`, theme.tertiaryDark)
  if (theme.tertiaryLight) root.style.setProperty(`--${key}-tertiary-light`, theme.tertiaryLight)
  if (theme.tertiary70) root.style.setProperty(`--${key}-tertiary-70`, theme.tertiary70)
  if (theme.tertiaryDark60)
    root.style.setProperty(`--${key}-tertiary-dark-60`, theme.tertiaryDark60)

  // Background and foreground
  if (theme.background) root.style.setProperty(`--${key}-background`, theme.background)
  if (theme.foreground) root.style.setProperty(`--${key}-foreground`, theme.foreground)

  // Level colors
  if (theme.level1) root.style.setProperty(`--${key}-level1`, theme.level1)
  if (theme.level2) root.style.setProperty(`--${key}-level2`, theme.level2)
  if (theme.level3) root.style.setProperty(`--${key}-level3`, theme.level3)
  if (theme.level4) root.style.setProperty(`--${key}-level4`, theme.level4)
  if (theme.level5) root.style.setProperty(`--${key}-level5`, theme.level5)
  if (theme.level6) root.style.setProperty(`--${key}-level6`, theme.level6)

  // Status colors
  if (theme.success) root.style.setProperty(`--${key}-success`, theme.success)
  if (theme.successDark) root.style.setProperty(`--${key}-success-dark`, theme.successDark)
  if (theme.successLight) root.style.setProperty(`--${key}-success-light`, theme.successLight)

  if (theme.warning) root.style.setProperty(`--${key}-warning`, theme.warning)
  if (theme.warningDark) root.style.setProperty(`--${key}-warning-dark`, theme.warningDark)
  if (theme.warningLight) root.style.setProperty(`--${key}-warning-light`, theme.warningLight)

  if (theme.error) root.style.setProperty(`--${key}-error`, theme.error)
  if (theme.errorDark) root.style.setProperty(`--${key}-error-dark`, theme.errorDark)
  if (theme.errorLight) root.style.setProperty(`--${key}-error-light`, theme.errorLight)
  if (theme.error10) root.style.setProperty(`--${key}-error-10`, theme.error10)

  // Dialog overlay
  if (theme.dialogOverlayRgb)
    root.style.setProperty(`--${key}-dialog-overlay-rgb`, theme.dialogOverlayRgb)
  if (theme.dialogOverlayOpacity)
    root.style.setProperty(`--${key}-dialog-overlay-opacity`, theme.dialogOverlayOpacity.toString())

  // Note
  if (theme.noteWarn) root.style.setProperty(`--${key}-note-warn`, theme.noteWarn)
}
