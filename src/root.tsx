import { Outlet, useNavigation } from "react-router-dom"
import { ThemeProvider } from "@/contexts/theme-context"
import Header from "@/components/layout/header"
import SearchDialog from "@/components/layout/search-dialog"
import { SearchProvider } from "@/contexts/search-provider"
import { QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import LoadingBar from "react-top-loading-bar"
import type { LoadingBarRef } from "react-top-loading-bar"
import { useEffect, useRef } from "react"
import { IQXChatbot } from "@/components/chatbot/IQXChatbot"

export default function Root() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="iqx-ui-theme">
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>  
    </ThemeProvider>
  )
}

function InnerApp() {
  const navigation = useNavigation()
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const loadingRef = useRef<LoadingBarRef | null>(null)

  useEffect(() => {
    const busy = navigation.state !== "idle" || isFetching > 0 || isMutating > 0
    if (busy) {
      loadingRef.current?.continuousStart()
    } else {
      loadingRef.current?.complete()
    }
  }, [navigation.state, isFetching, isMutating])

  return (
    <SearchProvider>
      <div className="min-h-screen bg-background">
        <LoadingBar color="#22c55e" height={2} ref={loadingRef} shadow={false} className="z-[60]" />
        <Header />
        <SearchDialog />
        <main>
          <Outlet />
        </main>
        <IQXChatbot options={{ showSuggestions: true }} />
      </div>
    </SearchProvider>
  )
}
