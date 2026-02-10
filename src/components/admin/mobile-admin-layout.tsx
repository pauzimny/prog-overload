"use client";

import React from "react";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminToast } from "@/hooks/use-admin-toast";

interface MobileAdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function MobileAdminLayout({
  children,
  title,
  subtitle,
  onMenuToggle,
  isMenuOpen,
}: MobileAdminLayoutProps) {
  const { toast } = useAdminToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {subtitle && (
          <div className="px-4 pb-2">
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="fixed inset-0 bg-black/20" onClick={onMenuToggle} />
          <div className="fixed right-0 top-0 h-full w-80 bg-background shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Admin Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuToggle}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 pb-20 pt-4 py-20">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-muted-foreground">{subtitle}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      message: "Test toast notification!",
                      type: "success",
                    })
                  }
                >
                  Test Toast
                </Button>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 pb-20 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
