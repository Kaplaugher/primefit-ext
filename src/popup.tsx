import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/chrome-extension"
import { useState } from "react"

import "~style.css"

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const EXTENSION_URL = chrome.runtime.getURL(".")
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST

if (!PUBLISHABLE_KEY || !SYNC_HOST) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY and PLASMO_PUBLIC_CLERK_SYNC_HOST to the .env.development file"
  )
}

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const capturePageContent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const serializer = new XMLSerializer()
          const htmlContent = serializer.serializeToString(document)

          return {
            url: window.location.href,
            title: document.title,
            html: htmlContent
          }
        }
      })

      const pageData = result[0].result

      const apiResponse = await fetch("http://localhost:3000/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: pageData.url,
          title: pageData.title,
          html: pageData.html
        })
      })

      if (apiResponse.ok) {
        const responseData = await apiResponse.json()
        setSuccess(`Added`)
        // Auto-close after success
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        setError(`Failed`)
      }
    } catch (error) {
      setError("Error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      syncHost={SYNC_HOST}>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-w-[240px] plasmo-p-3 plasmo-bg-white">
        <SignedOut>
          <SignInButton
            mode="modal"
            appearance={{
              elements: {
                socialButtonsRoot: "plasmo-hidden",
                dividerRow: "plasmo-hidden"
              }
            }}
          />
        </SignedOut>
        <SignedIn>
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-w-full">
            <UserButton />
            {error ? (
              <div className="plasmo-text-red-600 plasmo-text-sm plasmo-flex-1 plasmo-text-center">
                {error}
              </div>
            ) : success ? (
              <div className="plasmo-text-green-600 plasmo-text-sm plasmo-flex-1 plasmo-text-center">
                {success}
              </div>
            ) : (
              <button
                onClick={capturePageContent}
                disabled={isLoading}
                className="plasmo-bg-blue-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded-md plasmo-text-sm plasmo-font-medium plasmo-flex-1 plasmo-hover:plasmo-bg-blue-600 plasmo-transition-colors plasmo-disabled:plasmo-opacity-50">
                {isLoading ? (
                  <span className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2">
                    <svg
                      className="plasmo-animate-spin plasmo-h-4 plasmo-w-4"
                      viewBox="0 0 24 24">
                      <circle
                        className="plasmo-opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="plasmo-opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                ) : (
                  "Add Page"
                )}
              </button>
            )}
          </div>
        </SignedIn>
      </div>
    </ClerkProvider>
  )
}

export default IndexPopup
