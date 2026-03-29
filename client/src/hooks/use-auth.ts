import { useClerk, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();

  const mappedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        profileImageUrl: user.imageUrl ?? null,
      }
    : null;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await clerk.signOut({ redirectUrl: "/auth" });
    },
  });

  return {
    user: mappedUser,
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    logoutMutation,
  };
}
