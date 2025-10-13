"use client"

import Image from "next/image"
import Link from "next/link"
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Palette, Shirt, Package } from 'lucide-react'

function MerchPageContent() {

  const portalImages = [
    { src: "/merch-images/flag.png", alt: "Flag" },
    { src: "/merch-images/hoodie.png", alt: "Collegiate Hoodie" },
    { src: "/merch-images/quarter-zip.png", alt: "Quarter Zip" },
    { src: "/merch-images/tote-bag.png", alt: "Dues Tote Bag" },
  ]

  // Duplicate images for seamless loop
  const duplicatedImages = [...portalImages, ...portalImages, ...portalImages]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">KTP Merch Store</h1>

        <Link
          href="https://ktp-store.printful.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {/* Card with Scrolling Background */}
          <Card className="relative overflow-hidden h-[324px]">
            {/* Scrolling Background Layer */}
            <div className="absolute inset-0">
              <div className="flex gap-6 animate-scroll-right h-full items-center">
                {duplicatedImages.map((image, index) => (
                  <div
                    key={`flow-${index}`}
                    className="flex-shrink-0 w-[576px] h-[324px]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={1920}
                      height={1080}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40 z-10" />
            </div>

            {/* Foreground Content */}
            <CardContent className="relative z-20 text-center py-12 md:py-16 text-white">
              <ShoppingBag className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-4 md:mb-6" />
              <h2 className="text-xl md:text-2xl font-semibold mb-4">
                Designs Out Now!
              </h2>
              <p className="text-base md:text-lg mb-4 md:mb-6 max-w-2xl mx-auto px-4">
                Great KTP merch is now available! Click here to buy your piece of KTP pride!
              </p>
            </CardContent>
          </Card>

        </Link>

        {/* Preview Cards */}
        <div className="max-w-6xl mx-auto">
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