'use client'

import { Redirect } from 'wouter'

export default function UserOrdersPage() {
  return <Redirect to="/account?tab=orders" />
}

export const dynamic = 'force-dynamic'
