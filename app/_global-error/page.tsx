import GlobalErrorClient from "./global-error-client"

export default function GlobalErrorPage(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <GlobalErrorClient {...props} />
}
