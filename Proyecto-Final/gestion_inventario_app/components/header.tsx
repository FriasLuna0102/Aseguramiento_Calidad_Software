"use client"

import { User, LogOut, Package, Shield, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  userName?: string
}

export function Header({ userName = "Usuario" }: HeaderProps) {
  const { logout, isAdmin } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  const handleAdminTokens = () => {
    router.push("/admin/tokens")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-[#007BFF] rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#003B73]">Inventario QAS</h1>
            <p className="text-sm text-gray-600">Sistema de Gestión</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-[#E0F0FF]">
              <div className="flex items-center justify-center w-8 h-8 bg-[#007BFF] rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#003B73] font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin() && (
              <>
                <DropdownMenuItem onClick={handleAdminTokens}>
                  <Shield className="w-4 h-4 mr-2" />
                  Administrar Tokens
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
