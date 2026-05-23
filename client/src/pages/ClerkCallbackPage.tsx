import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function ClerkCallbackPage() {
  return <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />;
}
