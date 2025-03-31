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

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file"
  )
}

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false)

  const capturePageContent = async () => {
    try {
      setIsLoading(true)
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      // Execute script to get the page's HTML content
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Get the full HTML content using XMLSerializer
          const serializer = new XMLSerializer()
          const htmlContent = serializer.serializeToString(document)

          return {
            url: window.location.href,
            title: document.title,
            html: htmlContent
          }
        }
      })

      // Access the result data
      const pageData = result[0].result

      // Log the URL and title
      console.log("Page URL:", pageData.url)
      console.log("Page Title:", pageData.title)

      // Log the full HTML content
      console.log("Full HTML Content:", pageData.html)

      // Send the data to the API
      try {
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
          console.log("API Response:", responseData)
          alert(`Successfully sent page content to API: ${pageData.title}`)
        } else {
          console.error(
            "API Error:",
            apiResponse.status,
            apiResponse.statusText
          )
          alert(
            `Error sending to API: ${apiResponse.status} ${apiResponse.statusText}`
          )
        }
      } catch (apiError) {
        console.error("API Request Error:", apiError)
        alert(`Error sending to API: ${apiError.message}`)
      }
    } catch (error) {
      console.error("Error capturing page content:", error)
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
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-[200px] plasmo-w-[200px] plasmo-flex-col">
        <header className="plasmo-w-full">
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
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-w-full plasmo-p-4">
              <UserButton />
              <button
                onClick={capturePageContent}
                disabled={isLoading}
                className="plasmo-bg-blue-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-hover:plasmo-bg-blue-600 plasmo-transition-colors plasmo-disabled:plasmo-opacity-50 plasmo-disabled:plasmo-cursor-not-allowed">
                {isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </SignedIn>
        </header>
      </div>
    </ClerkProvider>
  )
}

export default IndexPopup
