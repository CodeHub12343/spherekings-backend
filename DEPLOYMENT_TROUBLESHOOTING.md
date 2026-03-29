# Deployment Troubleshooting Guide

**Solutions to common issues when deploying to Render + Vercel**

---

## Backend Issues (Render)

### Issue 1: "Service failed to build"

**Signs:**
- Render dashboard shows red error
- Build logs show `npm ERR!`
- Deployment never completes

**Solutions:**

1. **Check Node version in `package.json`:**
```json
"engines": {
  "node": "18.x"
}
```

2. **Check build command in Render:**
- Should be: `npm install`

3. **Check start command in Render:**
- Should be: `npm start`
- Make sure `package.json` has:
```json
"scripts": {
  "start": "node src/server.js"
}
```

4. **Check for missing dependencies:**
```bash
# Local: Install all packages
npm install

# Then push to GitHub
git push origin main

# Render will reinstall everything
```

---

### Issue 2: "Service deployed but shows error"

**Signs:**
- Dashboard shows "Active" but red status
- Visiting URL shows error page

**Solutions:**

1. **Check Render logs:**
- In Render dashboard → Logs tab
- Look for actual error message

2. **Check PORT configuration:**
```javascript
// In src/server.js
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. **Check environment variables:**
- Go to Render Settings → Environment Variables
- Make sure all required vars are set
- Restart service after adding vars

4. **Check database connection:**
```javascript
// If using MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .catch(err => console.error('DB Error:', err));
```

---

### Issue 3: "Webhook URL gives 404"

**Signs:**
- Stripe shows failed webhook deliveries
- Error: "Webhook URL unreachable"

**Solutions:**

1. **Verify endpoint exists:**
```javascript
// In src/server.js
app.post('/api/checkout/webhook', (req, res) => {
  // Route must exist!
  res.json({ received: true });
});
```

2. **Check URL is exact:**
- Stripe expects: `https://spherekings-backend.onrender.com/api/checkout/webhook`
- Not: `https://spherekings-backend.onrender.com/api/checkout/webhook/`
- Not: `https://spherekings-backend.onrender.com/checkout/webhook`

3. **Check endpoint accepts POST:**
```javascript
// ✅ Correct
app.post('/api/checkout/webhook', handler);

// ❌ Wrong
app.get('/api/checkout/webhook', handler);
```

4. **Check raw body parsing:**
```javascript
// MUST be before JSON parsing for webhook signature verification!
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  // Process webhook
});
```

---

### Issue 4: "Invalid webhook signature"

**Signs:**
- Webhook received but verification fails
- "No matching key found"

**Solutions:**

1. **Verify secret is correct:**
- Go to Stripe Dashboard → Developers → Webhooks
- Click the endpoint
- Check "Signing secret" value
- Make sure it starts with `whsec_test_`

2. **Check environment variable:**
```bash
# In Render environment:
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Make sure it matches Stripe exactly (copy-paste)
```

3. **Check signature verification code:**
```javascript
const signature = req.headers['stripe-signature'];
try {
  const event = stripe.webhooks.constructEvent(
    req.body,  // Must be RAW body
    signature,
    process.env.STRIPE_WEBHOOK_SECRET  // Must match Stripe value
  );
  // Process event
} catch(err) {
  console.error('Signature verification failed:', err.message);
}
```

4. **Restart Render service after updating secret:**
- Go to Render dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## Frontend Issues (Vercel)

### Issue 5: "Cannot connect to backend API"

**Signs:**
- Frontend loads but API calls fail
- Browser console shows CORS error
- Network tab shows 503 or connection refused

**Solutions:**

1. **Check `NEXT_PUBLIC_API_URL` in Vercel:**
```
NEXT_PUBLIC_API_URL=https://spherekings-backend.onrender.com
```

2. **Verify it's spelled correctly:**
- No typos
- HTTPS (not HTTP)
- No trailing slash
- Render service name is correct

3. **Check it's public variable:**
- Variable name MUST start with `NEXT_PUBLIC_`
- Without prefix, it won't be available in browser

4. **Redeploy after updating:**
- Vercel should auto-redeploy
- If not: Go to Deployments → Redeploy

5. **Check CORS headers in backend:**
```javascript
// src/server.js
app.use(cors({
  origin: 'https://spherekings-frontend.vercel.app',
  credentials: true
}));
```

---

### Issue 6: "Stripe publishable key not found"

**Signs:**
- Stripe form shows "pk_test_ is undefined"
- Payment page doesn't load

**Solutions:**

1. **Check Vercel environment variable:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

2. **Variable must be PUBLIC:**
- Name starts with `NEXT_PUBLIC_`
- Without prefix, it won't work

3. **Verify in frontend code:**
```javascript
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error('Stripe key missing!');
}
```

4. **Redeploy after updating:**
```bash
# Option 1: Auto-redeploy via Git
git push origin main

# Option 2: Manual redeploy in Vercel dashboard
Deployments → Redeploy
```

---

### Issue 7: "Environment variables not loading"

**Signs:**
- Vercel shows env vars are set
- But they're `undefined` in deployed code
- Works locally with `.env.local`

**Solutions:**

1. **Restart Vercel deployment:**
- Go to Deployments
- Click latest deployment's menu
- Click "Redeploy"

2. **Check if variables are public:**
- `NEXT_PUBLIC_` prefix needed for browser
- Without prefix only available in Node

3. **Wait a minute:**
- Sometimes Vercel takes time to sync env vars
- Try refreshing browser cache

4. **Check deployment logs:**
- Go to Deployments → Click build log
- Look for env var values being loaded

---

## Stripe Issues

### Issue 8: "Webhook test fails"

**Signs:**
- Stripe shows "Request failed"
- Can't send test webhook from dashboard

**Solutions:**

1. **Verify webhook URL is correct:**
- Go to Stripe Webhooks page
- Click endpoint
- Check URL matches exactly
- Test URL is reachable (copy into browser)

2. **Check backend is running:**
- Visit `https://spherekings-backend.onrender.com`
- Should see response (not error)

3. **Check endpoint accepts POST:**
```javascript
// ✅ Correct
app.post('/api/checkout/webhook', handler);

// ❌ Wrong  
app.get('/api/checkout/webhook', handler);
```

4. **Try sending test event from Stripe:**
- Click endpoint in Webhooks
- Scroll to "Sending test webhook"
- Click "Send test event"
- Check Render logs for the event

---

### Issue 9: "Payment succeeds but webhook doesn't fire"

**Signs:**
- Frontend shows success page
- But order not created in database
- Stripe Dashboard shows success
- Webhook events not appearing

**Solutions:**

1. **Check webhook is registered:**
- Go to Stripe → Developers → Webhooks
- Make sure endpoint is listed (green checkmark)
- Verify URL is correct

2. **Check backend logs:**
- Go to Render → Logs
- Should see webhook event received
- Look for errors

3. **Check event is being sent:**
- In Stripe Webhooks page
- Click endpoint
- Click "Events" tab
- Should see `checkout.session.completed` event
- Check status (green = success, red = failed)

4. **If failed:**
- Click the event
- See error details
- Usually: wrong webhook secret or endpoint error

5. **Restart Render service:**
- Go to Render dashboard
- Click "Manual Deploy" → Deploy latest commit
- Sometimes cache needs to clear

---

### Issue 10: "Test card fails"

**Signs:**
- Using `4242 4242 4242 4242`
- Payment declined
- Error message in Stripe Dashboard

**Solutions:**

1. **Check test mode is ON:**
- Stripe Dashboard top left/right
- "Test mode" toggle must be ON

2. **Check keys are test keys:**
```bash
# In Render environment:
STRIPE_SECRET_KEY=sk_test_xxxxx  (must have 'test')
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  (must have 'test')
```

3. **Try different test card:**
```
✅ Success: 4242 4242 4242 4242
✅ Declined: 4000 0000 0000 0002 (intentional decline)
✅ Expired: 4000 0000 0000 0069
✅ Auth needed: 4000 0000 0000 3220
```

4. **Check card details:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Zip: Any 5+ digits (e.g., 12345)

---

## Network Issues

### Issue 11: "Timeout connecting to backend"

**Signs:**
- Frontend loads but times out calling API
- Render shows "Service timeout"
- Takes 30+ seconds to respond

**Solutions:**

1. **Check Render plan:**
- Free tier auto-sleeps after 15 min of inactivity
- Upgrade to Starter ($7/month) to prevent sleep
- Or implement uptime monitoring (UptimeRobot free)

2. **Check database connection timeout:**
```javascript
// MongoDB timeout config
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000
});
```

3. **Check API is responsive:**
```bash
# From terminal
curl https://spherekings-backend.onrender.com/

# Should return response in < 5 seconds
```

---

### Issue 12: "CORS error when calling API"

**Signs:**
- Browser console: "Cross-Origin Request Blocked"
- Network shows request but fails CORS check

**Solutions:**

1. **Check CORS is enabled in backend:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://spherekings-frontend.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. **If using multiple origins:**
```javascript
const allowedOrigins = [
  'https://spherekings-frontend.vercel.app',
  'http://localhost:3000', // for local dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));
```

3. **Ensure CORS is before routes:**
```javascript
// ✅ Correct order
app.use(cors(...));
app.use(express.json());
app.use('/api', apiRoutes);

// ❌ Wrong order
app.use('/api', apiRoutes);
app.use(cors(...)); // Too late!
```

---

## Verification Checklist

Before declaring deployment complete:

- [ ] Render backend shows "Active" (green)
- [ ] `https://backend.onrender.com` loads without error
- [ ] Vercel frontend deployed successfully
- [ ] `https://frontend.vercel.app` loads
- [ ] Frontend can call backend API (check Network tab)
- [ ] Stripe test mode is ON
- [ ] 3 webhooks created with Render URLs
- [ ] Webhook signatures stored in Render env
- [ ] Stripe test payment with 4242 card succeeds
- [ ] Order created in database after payment
- [ ] Stripe Dashboard shows webhook event
- [ ] Render logs show webhook processing

✅ All checked = You're deployed and working!

---

## Still Stuck?

1. **Check logs first:**
   - Render: Service → Logs tab
   - Vercel: Deployments → Build logs
   - Stripe: Webhooks → Events

2. **Look for error messages:** Most errors have clear messages

3. **Try the simplest solution first:** Usually an env var or restart

4. **Deploy fresh:** `git push` to trigger fresh deployment

5. **Ask for help with specific error message** (copy the exact error text)

---

## Quick Debug Commands

```bash
# Check if backend is alive
curl https://spherekings-backend.onrender.com/health

# Check if frontend can reach backend
curl https://spherekings-frontend.vercel.app/api/health

# Test webhook endpoint
curl -X POST https://spherekings-backend.onrender.com/api/checkout/webhook

# Verify environment variables (in Render logs)
echo $STRIPE_SECRET_KEY
```

---

Good luck! Most issues resolve with environment variables or restarting a service. 🚀
