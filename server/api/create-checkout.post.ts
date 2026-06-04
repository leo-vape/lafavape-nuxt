import Stripe from 'stripe'

// Initialize Stripe — use env var or fallback to test key
const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret
  ? new Stripe(stripeSecret)
  : null

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { productName, price, productId } = body

  if (!productName || !price) {
    throw createError({ statusCode: 400, message: 'Missing product name or price' })
  }

  // If no Stripe key configured, return a friendly message
  if (!stripe || !stripeSecret) {
    return {
      success: true,
      mode: 'demo',
      message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env to enable payments.',
      checkoutUrl: null
    }
  }

  try {
    const unitAmount = Math.round(parseFloat(price) * 100) // convert to cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: `LAFA Vape — ${productName}`,
            images: productId ? [`https://lafavape.com/uploads/placeholder.png`] : undefined,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${getRequestURL(event).origin}/?checkout=success`,
      cancel_url: `${getRequestURL(event).origin}/?checkout=cancelled`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU', 'JP', 'KR', 'SG', 'MY', 'PH', 'ID'],
      },
      metadata: {
        productId: productId || '',
      },
    })

    return {
      success: true,
      mode: 'live',
      checkoutUrl: session.url,
    }
  } catch (e: any) {
    console.error('Stripe error:', e.message)
    throw createError({ statusCode: 500, message: 'Payment setup failed: ' + e.message })
  }
})
