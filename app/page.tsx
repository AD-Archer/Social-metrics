import { redirect } from "next/navigation"

export default function HomePage() {
  // In a real app, you would check if the user is logged in
  // and if they've seen the welcome page before

  // For now, always redirect to the welcome page
  redirect("/welcome")

  // This won't be reached due to the redirect
  return null
}
