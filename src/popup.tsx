import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/chrome-extension"

import { CountButton } from "~features/count-button"

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
  const capturePageContent = async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      // Execute script to get the page's HTML content
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Get the current URL
          return window.location.href
        }
      })

      // Log the URL
      console.log("Current URL:", result[0].result)

      // Here you would send the full data to your API
      // Example:
      // await fetch('your-api-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: result[0].result })
      // });

      alert(`Page captured: ${result[0].result}`)
    } catch (error) {
      console.error("Error capturing page content:", error)
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
                className="plasmo-bg-blue-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-hover:plasmo-bg-blue-600 plasmo-transition-colors">
                Add
              </button>
            </div>
          </SignedIn>
        </header>
      </div>
    </ClerkProvider>
  )
}

export default IndexPopup
