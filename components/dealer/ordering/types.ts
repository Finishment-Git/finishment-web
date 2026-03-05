export interface OrderFormData {
  firstName: string
  lastName: string
  company: string
  purchaseOrderNumber: string
  email: string
  sidemark: string
  phone: string
  stairType: 'standard_bullnose' | 'other' | ''
  stepsNoOpenReturn: number
  stepsOneOpenReturn: number
  stepsTwoOpenReturn: number
  longestPlankSize: string
  stepsDetails: string
  railCapTrimNeeded: boolean
  railCapTrimDetails: string
  manufacturer: string
  style: string
  color: string
  floorMatchDescription: string
}

export interface ShippingAddress {
  name: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  phone: string
}

export interface ProjectImage {
  url: string
  fileName: string
  fileSize: number
  fileType: string
}

export type PaymentMethod = 'card' | 'check' | 'ach'
export type StepsFieldKey = 'stepsNoOpenReturn' | 'stepsOneOpenReturn' | 'stepsTwoOpenReturn'

export const INITIAL_FORM_DATA: OrderFormData = {
  firstName: '',
  lastName: '',
  company: '',
  purchaseOrderNumber: '',
  email: '',
  sidemark: '',
  phone: '',
  stairType: '',
  stepsNoOpenReturn: 0,
  stepsOneOpenReturn: 0,
  stepsTwoOpenReturn: 0,
  longestPlankSize: '',
  stepsDetails: '',
  railCapTrimNeeded: false,
  railCapTrimDetails: '',
  manufacturer: '',
  style: '',
  color: '',
  floorMatchDescription: '',
}

export const INITIAL_SHIPPING: ShippingAddress = {
  name: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '300px',
  padding: '10px 12px',
  border: '1px solid #e5ddd4',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#faf8f3',
  color: '#3d2817',
  transition: 'all 0.2s',
  outline: 'none',
}

export const inputStyleFull: React.CSSProperties = {
  ...inputStyle,
  maxWidth: '100%',
}

export const sectionStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '32px',
  borderRadius: '12px',
  marginBottom: '28px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '24px',
  color: '#3d2817',
  fontFamily: 'Georgia, serif',
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '500',
  fontSize: '14px',
  color: '#3d2817',
}

export function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#c9a882'
  e.target.style.backgroundColor = '#ffffff'
}

export function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#e5ddd4'
  e.target.style.backgroundColor = '#faf8f3'
}
