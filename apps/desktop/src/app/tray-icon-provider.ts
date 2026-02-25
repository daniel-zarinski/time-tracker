import { nativeImage } from 'electron'
import type { NativeImage } from 'electron'

const TRAY_ICON_SIZE = 16

/**
 * 16x16 PNG icons for Windows/Linux fallback.
 * Source: iconsdb.com (CC0 Public Domain)
 */
const FALLBACK_ICON_RUNNING =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABNElEQVQ4jZXTPyuGURgG8J+XJEmUJGGQQQaZjEhWJQuDjDIYJYMvYJAPIOIjKEoZKWG3GN7JQCFJIv+Gc16d93UoV52e5/5z3ed+7vt6yGMBz3iK5xETucSaXwp0oq7C1/ZLbhb92MRnPGvo+k8BKGAwFiuhDjvo/YvYgQ08JB1cYx3dOEcRtVBVQR7CLj6whVNhTsOYxR2mYnfHlTd34T6SWqNvBmPxvRuX8fbGXOubuE3IsBSLlNCHF6yUHIXkOYlt3CSEZjQk9gX24meUoV0Y1nTiaxEEdKVcL8uxC5LAW4UNr8LQ7oShppzU/saVsL4UhUzeIU5yBVYF/f8lkhG8Yz4XbBJWVMRAJj4qbKmkDfwUUg/2hZ0fCKqrFgQ2gjOMK9/UD9RjMZIfBUkfYU7m7/0Cn7JBJb41+ksAAAAASUVORK5CYII='
const FALLBACK_ICON_IDLE =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABRUlEQVQ4jX3TQSvsYRQG8F/TNEnC6n4ACwsLWVtOmoV0kyQLO6XsbC0sZCFNd6Gb5CPIhizERlZWkqzkA0jcNF03ctNY/M/w9/qbZ/ee85znPe95zstX9KOOMzyggQusY6CA/44y1vAfTfzFHf6ESBOv2EBHUfFekK4wiQpGMB75seikieNUZDUSh+jKxYdRy507sBPcrVawL9q+TophActJrILzeM5QCbPR4hIeE3I3OpPYCxZRwnwZVTxj11f0FAjAEe6j1q3Mrp8JqStyDfxIciO4wb9SgXoepXhGvR3pFE8KvEUvVmRTX0mE72SWv1s43eaSOZlTM3GuRc0m7W3MYxRTEhtbybVQPFA89RYq2JYsEtke7PtY5YmIVWXulKOD8+Cc+OY/1H3+TLeyYT34+EybRcV59ONX3NYIoUv8xmBKfgN9xVVQaHcP/AAAAABJRU5ErkJggg=='

export class TrayIconProvider {
  getIcon(isRunning: boolean): NativeImage {
    if (process.platform === 'darwin') {
      return this.getMacOSIcon(isRunning)
    }
    return this.getFallbackIcon(isRunning)
  }

  private getMacOSIcon(isRunning: boolean): NativeImage {
    const sfSymbol = isRunning ? 'stopwatch.fill' : 'clock'
    try {
      let img = nativeImage.createFromNamedImage(sfSymbol)
      if (img.isEmpty()) {
        return this.getFallbackIcon(isRunning)
      }
      img = img.resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE })
      img.setTemplateImage(true)
      return img
    } catch {
      return this.getFallbackIcon(isRunning)
    }
  }

  private getFallbackIcon(isRunning: boolean): NativeImage {
    const base64 = isRunning ? FALLBACK_ICON_RUNNING : FALLBACK_ICON_IDLE
    const dataUrl = `data:image/png;base64,${base64}`
    let img = nativeImage.createFromDataURL(dataUrl)
    img = img.resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE })
    if (process.platform === 'darwin') {
      img.setTemplateImage(true)
    }
    return img
  }
}
