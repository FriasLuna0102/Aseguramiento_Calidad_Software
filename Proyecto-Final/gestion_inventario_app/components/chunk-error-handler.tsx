"use client"

import { useEffect } from "react"

export function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: any) => {
      // Verificar si es un error de chunk
      if (
        event.error?.name === "ChunkLoadError" ||
        event.reason?.name === "ChunkLoadError" ||
        (event.error?.message && event.error.message.includes("Loading chunk")) ||
        (event.reason?.message && event.reason.message.includes("Loading chunk"))
      ) {
        console.warn("ChunkLoadError detectado, recargando página...")
        // Recargar la página después de un pequeño delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    // Escuchar errores no capturados
    window.addEventListener("error", handleChunkError)
    window.addEventListener("unhandledrejection", handleChunkError)

    return () => {
      window.removeEventListener("error", handleChunkError)
      window.removeEventListener("unhandledrejection", handleChunkError)
    }
  }, [])

  return null
}
