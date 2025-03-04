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
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      syncHost={SYNC_HOST}>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-[600px] plasmo-w-[800px] plasmo-flex-col">
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
            <UserButton />
          </SignedIn>
        </header>
        <main className="plasmo-grow">
          <CountButton />
        </main>
      </div>
    </ClerkProvider>
  )
}

export default IndexPopup
