export interface Business {
  id: string
  name: string
  slug: string
  industry: string | null
  contact_email: string | null
  brand_color: string
  status: 'active' | 'pending' | 'paused' | 'archived'
  created_at: string
}

export interface Lead {
  id: string
  business_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_needed: string | null
  preferred_time: string | null
  message: string | null
  status: 'new' | 'contacted' | 'booked' | 'follow_up' | 'lost' | 'archived'
  source: string
  created_at: string
}

export interface Message {
  id: string
  type: string
  direction: 'inbound' | 'outbound' | 'internal'
  content: string
  created_at: string
}

export interface APIResponse<T> {
  ok: boolean
  data: T | null
}
