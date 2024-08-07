"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

const Redirect = (props: { url: string, delay?: number }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackData: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    trackData[key] = value
  })
  useEffect(() => {
    setTimeout(() => {
      router.replace(props.url)
    }, props.delay || 300)
  }, [props, router])
  return (
    null
  )
}

export default Redirect