"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Clock, Palette, Shirt, Package } from 'lucide-react'

function MerchPageContent() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">KTP Merch Store</h1>

        {/* Coming Soon Card */}
        <Card>
          <CardContent className="text-center py-12 md:py-16">
            <ShoppingBag className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto mb-4 md:mb-6" />
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Store Coming Soon</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto px-4">
              We&apos;re working on creating awesome KTP merchandise designs! 
              We&apos;ll update the site with the purchase link as soon as it&apos;s ready.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Designs in progress</span>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shirt className="h-5 w-5" />
                <span>Apparel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Quality clothing coming soon:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Hoodies & Sweatshirts</li>
                <li>• T-Shirts & Polo Shirts</li>
                <li>• Tank Tops & Long Sleeves</li>
                <li>• Professional Button-ups</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Accessories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Perfect for everyday use:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Laptop Stickers</li>
                <li>• Water Bottles</li>
                <li>• Backpacks & Tote Bags</li>
                <li>• Phone Cases</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Design Process</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                What we&apos;re working on:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Modern KTP logo designs</li>
                <li>• Tech-inspired graphics</li>
                <li>• Indiana University themes</li>
                <li>• Member input & feedback</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MerchPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <MerchPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 