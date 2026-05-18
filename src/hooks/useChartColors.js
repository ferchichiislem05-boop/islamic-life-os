import useAppStore from '../store/useAppStore.js'

export function useChartColors() {
  const { prefs } = useAppStore()
  const isLight = prefs.theme === 'light'
  return {
    grid: isLight ? '#D4B878' : '#4A3820',
    tick: isLight ? '#7A5530' : '#9A7E5C',
  }
}
