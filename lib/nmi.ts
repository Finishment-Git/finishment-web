/**
 * NMI Payment Gateway Integration
 * Sends sale requests to NMI's Payment API using Collect.js payment tokens.
 * Card data never touches our servers - only tokens from the frontend.
 */

export type NMISaleResult =
  | { success: true; transactionId: string; authCode?: string }
  | { success: false; message: string; responseCode?: string }

export interface NMISaleParams {
  paymentToken: string
  amountDollars: number
  orderId: string
  firstName: string
  lastName: string
  address1?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

/**
 * Process a credit card sale through NMI using a Collect.js payment token.
 * Uses the Payment API (transact.php) - token is single-use and expires in 24 hours.
 *
 * @param params Sale parameters including token, amount, order id, and billing info
 * @returns Success with transaction ID, or failure with message
 */
export async function processNMISale(params: NMISaleParams): Promise<NMISaleResult> {
  const apiUrl = process.env.NMI_API_URL
  const securityKey = process.env.NMI_SECURITY_KEY

  if (!apiUrl || !securityKey) {
    console.error('NMI: Missing NMI_API_URL or NMI_SECURITY_KEY in environment')
    return {
      success: false,
      message: 'Payment gateway is not configured. Please contact support.',
    }
  }

  const {
    paymentToken,
    amountDollars,
    orderId,
    firstName,
    lastName,
    address1,
    city,
    state,
    zip,
    country = 'US',
  } = params

  if (!paymentToken?.trim()) {
    return { success: false, message: 'Payment token is required' }
  }
  if (amountDollars <= 0) {
    return { success: false, message: 'Amount must be greater than zero' }
  }
  if (!orderId?.trim()) {
    return { success: false, message: 'Order ID is required' }
  }

  const formData = new URLSearchParams({
    type: 'sale',
    payment_token: paymentToken,
    amount: amountDollars.toFixed(2),
    security_key: securityKey,
    orderid: orderId,
    firstname: firstName,
    lastname: lastName,
    country,
  })

  if (address1) formData.append('address1', address1)
  if (city) formData.append('city', city)
  if (state) formData.append('state', state)
  if (zip) formData.append('zip', zip)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const text = await response.text()
    const parsed = Object.fromEntries(new URLSearchParams(text))

    const responseVal = parsed.response
    const responseCode = parsed.response_code || ''
    const responsetext = parsed.responsetext || 'Unknown error'
    const transactionId = parsed.transactionid || ''
    const authCode = parsed.authcode || ''

    if (responseVal === '1' && responseCode === '100') {
      return {
        success: true,
        transactionId,
        authCode: authCode || undefined,
      }
    }

    // Declined or error
    return {
      success: false,
      message: responsetext,
      responseCode,
    }
  } catch (err) {
    console.error('NMI request failed:', err)
    const message = err instanceof Error ? err.message : 'Network error'
    return {
      success: false,
      message: `Payment processing failed: ${message}. Please try again or contact support.`,
    }
  }
}
