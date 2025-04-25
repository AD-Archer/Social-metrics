import { redirect } from "next/navigation"

export default function page() {
  redirect("/landing")

  // This won't be reached due to the redirect
  return null
}
