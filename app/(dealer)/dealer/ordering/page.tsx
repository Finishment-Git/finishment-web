'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { BasicInfoSection } from '@/components/dealer/ordering/basic-info-section'
import { StairDetailsSection } from '@/components/dealer/ordering/stair-details-section'
import { FlooringDetailsSection } from '@/components/dealer/ordering/flooring-details-section'
import { ImageUploadSection } from '@/components/dealer/ordering/image-upload-section'
import { ShippingSection } from '@/components/dealer/ordering/shipping-section'
import { PaymentSection } from '@/components/dealer/ordering/payment-section'
import { OrderConfirmation } from '@/components/dealer/ordering/order-confirmation'
import {
  type OrderFormData, type ShippingAddress, type PaymentMethod, type ProjectImage,
  INITIAL_FORM_DATA, INITIAL_SHIPPING,
} from '@/components/dealer/ordering/types'

export default function DealerOrderingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null)
  const [dealer, setDealer] = useState<Record<string, unknown> | null>(null)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM_DATA)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(INITIAL_SHIPPING)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [notes, setNotes] = useState('')
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [needsShipping, setNeedsShipping] = useState(false)

  const updateFormData = (updates: Partial<OrderFormData>) =>
    setFormData(prev => ({ ...prev, ...updates }))

  useEffect(() => {
    const checkAuthorization = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      setUser(authUser)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, dealers (*)')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profileData) {
        console.error('Profile error:', profileError)
        alert(`Error loading profile: ${profileError?.message || 'Profile not found'}. Please contact support.`)
        router.push('/dealer-login')
        return
      }

      setUserProfile(profileData)
      setDealer(profileData.dealers)

      const fullName = authUser.user_metadata?.full_name || ''
      const nameParts = fullName.split(' ')

      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        company: profileData.dealers?.company_name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
      }))

      setShippingAddress(prev => ({
        ...prev,
        name: fullName,
        company: profileData.dealers?.company_name || '',
        phone: authUser.phone || '',
      }))

      if (profileData.status === 'ACTIVE' && (profileData.is_primary || profileData.can_order)) {
        setAuthorized(true)
      } else {
        router.push('/dealer/dashboard')
      }
      setLoading(false)
    }

    checkAuthorization()
  }, [router, supabase])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!formSubmitted && !success) {
        e.preventDefault()
        e.returnValue = 'Order not submitted. You will lose your work if you exit now.'
        return e.returnValue
      }
    }

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && !formSubmitted && !success) {
        const href = link.getAttribute('href')
        if (href && href !== '/dealer/ordering' && !href.startsWith('#')) {
          e.preventDefault()
          if (window.confirm('Order not submitted. You will lose your work if you exit now. Are you sure you want to leave?')) {
            router.push(href)
          }
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [formSubmitted, success, router])

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) { setError('First Name is required'); return false }
    if (!formData.lastName.trim()) { setError('Last Name is required'); return false }
    if (!formData.purchaseOrderNumber.trim()) { setError('Purchase Order # is required'); return false }
    if (!formData.email.trim()) { setError('Email is required'); return false }
    if (!formData.sidemark.trim()) { setError('Sidemark/Project Name is required'); return false }
    if (!formData.phone.trim()) { setError('Phone is required'); return false }
    const totalSteps = formData.stepsNoOpenReturn + formData.stepsOneOpenReturn + formData.stepsTwoOpenReturn
    if (totalSteps === 0) { setError('Please enter the number of steps for at least one stair layout option'); return false }
    if (!formData.longestPlankSize.trim()) { setError('Longest plank size is required'); return false }
    if (!formData.stepsDetails.trim()) { setError('Steps details are required (e.g., "18 Steps at 55 inches")'); return false }
    if (!formData.manufacturer.trim()) { setError('Manufacturer is required'); return false }
    if (!formData.style.trim()) { setError('Style is required'); return false }
    if (!formData.color.trim()) { setError('Color is required'); return false }
    if (needsShipping && (!shippingAddress.name.trim() || !shippingAddress.address1.trim() ||
        !shippingAddress.city.trim() || !shippingAddress.state.trim() ||
        !shippingAddress.zip.trim() || !shippingAddress.phone.trim())) {
      setError('Please complete all required shipping address fields'); return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    setError('')

    try {
      const orderData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        purchase_order_number: formData.purchaseOrderNumber,
        sidemark: formData.sidemark,
        phone: formData.phone,
        email: formData.email,
        stair_type: formData.stairType,
        steps_no_open_return: formData.stepsNoOpenReturn,
        steps_one_open_return: formData.stepsOneOpenReturn,
        steps_two_open_return: formData.stepsTwoOpenReturn,
        longest_plank_size: formData.longestPlankSize,
        steps_details: formData.stepsDetails,
        manufacturer: formData.manufacturer,
        style: formData.style,
        color: formData.color,
        floor_match_description: formData.floorMatchDescription,
        rail_cap_trim_needed: formData.railCapTrimNeeded,
        rail_cap_trim_details: formData.railCapTrimDetails || null,
        project_images: projectImages.map(img => img.url),
        image_metadata: projectImages,
        payment_method: paymentMethod,
        total_amount_cents: 0,
        shipping_address: needsShipping ? shippingAddress : null,
        contact_info: { email: formData.email, phone: formData.phone, name: `${formData.firstName} ${formData.lastName}` },
        notes: notes.trim() || null,
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create order')

      setOrderNumber(data.order.order_number)
      setSuccess(true)
      setFormSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit order. Please try again.'
      console.error('Order submission error:', err)
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', color: '#000000' }}>
        <p style={{ color: '#000000' }}>Loading...</p>
      </div>
    )
  }

  if (!authorized) return null

  if (success) {
    return (
      <OrderConfirmation
        orderNumber={orderNumber}
        paymentMethod={paymentMethod}
        onPlaceAnother={() => {
          setSuccess(false)
          setFormData({
            ...INITIAL_FORM_DATA,
            company: (dealer as Record<string, string>)?.company_name || '',
            email: (user as Record<string, string>)?.email || '',
            phone: (user as Record<string, string>)?.phone || '',
          })
          setProjectImages([])
        }}
      />
    )
  }

  return (
    <>
      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
      <div style={{
        maxWidth: '1000px', margin: '0 auto', padding: '40px 20px',
        backgroundColor: '#f5f0e8', color: '#3d2817', minHeight: '100vh'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px', color: '#3d2817', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
          We Look Forward to Helping You
        </h1>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          <BasicInfoSection formData={formData} onChange={updateFormData} />
          <StairDetailsSection formData={formData} onChange={updateFormData} />
          <FlooringDetailsSection formData={formData} onChange={updateFormData} />
          <ImageUploadSection userId={(user as Record<string, string>)?.id} projectImages={projectImages} setProjectImages={setProjectImages} />
          <ShippingSection needsShipping={needsShipping} setNeedsShipping={setNeedsShipping}
            shippingAddress={shippingAddress} setShippingAddress={setShippingAddress} />
          <PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            notes={notes} setNotes={setNotes} submitting={submitting} />
        </form>
      </div>
    </>
  )
}
