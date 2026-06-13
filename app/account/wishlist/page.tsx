'use client'

import { Redirect } from 'wouter'

export default function UserWishlistPage() {
  return <Redirect to="/account?tab=wishlist" />
}

export const dynamic = 'force-dynamic'
