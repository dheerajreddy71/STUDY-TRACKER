"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    
    // Show success message
    toast.success("Logged out successfully")
    
    // Redirect to home or login page
    router.push("/")
    
    // Optionally reload to clear any cached data
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 pl-16 md:pl-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <span className="font-semibold hidden sm:inline">Study Tracker</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
