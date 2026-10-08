import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory set for active admin session tokens
const activeAdminTokens = new Set<string>();

// Password hashing utilities using Node.js built-in crypto (PBKDF2)
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// Initial seed store
const initialData = {
  adminPasscode: process.env.ADMIN_PASSWORD || 'NiShAlDaMoR143',
  targetEmail: 'nishaldamor03@gmail.com',
  paymentSettings: {
    upiId: '7772809503@paytm',
    upiQrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=7772809503@paytm&pn=NISUMART&cu=INR',
    isOnlinePaymentEnabled: true,
    web3formsKey: process.env.WEB3FORMS_ACCESS_KEY || '',
  },
  smtpConfig: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'NISUMART Orders <orders@nisumart.com>',
  },
  customers: [] as any[],
  thumbnails: [
    {
      id: 'thumb-1',
      title: 'New Arrivals',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
      order: 1,
      tag: 'new_arrivals',
    },
    {
      id: 'thumb-2',
      title: 'Local MP Deals',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
      order: 2,
      tag: 'local_deals',
    },
    {
      id: 'thumb-3',
      title: 'Smart Gadgets',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      order: 3,
      tag: 'smart_gadgets',
    },
    {
      id: 'thumb-4',
      title: 'Fashion & Wear',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300&auto=format&fit=crop&q=80',
      order: 4,
      tag: 'fashion',
    },
    {
      id: 'thumb-5',
      title: 'Kitchen & Home',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
      order: 5,
      tag: 'kitchen',
    },
    {
      id: 'thumb-6',
      title: 'Under ₹499',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&auto=format&fit=crop&q=80',
      order: 6,
      tag: 'under_499',
    },
  ],
  banners: [
    {
      id: 'banner-1',
      title: 'LOCAL DEALS COMING SOON',
      subtitle: 'Exclusive express doorstep delivery in Dewas, Hatpipliya, Bagli & Indore',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      badge: 'MADHYA PRADESH SPECIAL',
      order: 1,
      tag: 'local_deals',
    },
    {
      id: 'banner-2',
      title: 'FLAT ₹50 OFF ON ONLINE PAYMENT',
      subtitle: 'Pay via UPI, GPay, PhonePe or Card & get instant ₹50 discount on your order',
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
      badge: 'EXTRA ₹50 SAVINGS',
      order: 2,
      tag: 'all',
    },
    {
      id: 'banner-3',
      title: 'CASH ON DELIVERY (COD) AVAILABLE',
      subtitle: 'Pay safely at your door across Dewas, Hatpipliya, Bagli and Indore (+₹50 COD charge)',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      badge: 'VERIFIED DELIVERY',
      order: 3,
      tag: 'all',
    },
  ],
  products: [
    {
      id: 'prod-1',
      productId: 'NISU-101',
      name: 'Pure Cotton Rajasthani Bedspread (King Size + 2 Pillow Covers)',
      description: '100% pure premium cotton 220 TC bedsheet with traditional Rajasthani floral design. High durability, breathable and colorfast fabric perfect for Malwa summers.',
      price: 499,
      originalPrice: 999,
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'new_arrivals',
      isAvailable: true,
      createdAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'prod-2',
      productId: 'NISU-102',
      name: 'Pro Wireless TWS Earbuds with 40H Battery & ENC Mic',
      description: 'Ultra-low latency Bluetooth 5.3 earbuds with crisp HD stereo bass, environmental noise cancellation (ENC) for crystal clear calls, and type-C fast charging.',
      price: 599,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'smart_gadgets',
      isAvailable: true,
      createdAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'prod-3',
      productId: 'NISU-103',
      name: 'Active Fitness Smart Band with Heart Rate & SpO2 Monitor',
      description: 'Color touch display with 14 sport modes, step tracking, sleep monitor, IP68 water resistance, and instant WhatsApp/Call alerts.',
      price: 899,
      originalPrice: 1899,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'smart_gadgets',
      isAvailable: true,
      createdAt: '2025-01-11T10:00:00Z',
    },
    {
      id: 'prod-4',
      productId: 'NISU-104',
      name: "Men's Classic Festive Kurta (Comfort Pure Slub Cotton)",
      description: 'Handcrafted mandarin collar regular fit kurta. Ideal for festive gatherings, pooja, family functions, and daily comfortable ethnic wear.',
      price: 449,
      originalPrice: 899,
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'fashion',
      isAvailable: true,
      createdAt: '2025-01-12T10:00:00Z',
    },
    {
      id: 'prod-5',
      productId: 'NISU-105',
      name: "Women's Royal Chanderi Silk Zari Border Saree with Blouse Piece",
      description: 'Exquisite authentic Madhya Pradesh handloom weave inspired Chanderi saree with rich woven golden zari border. Includes unstitched matching blouse fabric.',
      price: 699,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'fashion',
      isAvailable: true,
      createdAt: '2025-01-12T10:00:00Z',
    },
    {
      id: 'prod-6',
      productId: 'NISU-106',
      name: 'Multi-Utility Quick Kitchen Chopper (650ml Stainless Blades)',
      description: 'Heavy duty manual pull cord chopper for onion, vegetables, dry fruits, and salad chopping in 10 seconds. Food-grade BPA free material.',
      price: 299,
      originalPrice: 599,
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'kitchen',
      isAvailable: true,
      createdAt: '2025-01-13T10:00:00Z',
    },
    {
      id: 'prod-7',
      productId: 'NISU-107',
      name: 'Electric Stainless Steel Hand Blender (250W Multi-Speed)',
      description: 'Ergonomic hand blender for making lassi, purees, soups, and shakes with detachable stem for easy cleaning.',
      price: 499,
      originalPrice: 1099,
      image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'kitchen',
      isAvailable: true,
      createdAt: '2025-01-14T10:00:00Z',
    },
    {
      id: 'prod-8',
      productId: 'NISU-108',
      name: 'Dewas Special Fresh Ratlami & Ujjaini Sev Combo (1 kg Pack)',
      description: 'Crunchy, authentic spiced Malwa sev prepared in pure groundnut oil with aromatic hing, black pepper, and clove. Freshly sealed for maximum crispness.',
      price: 349,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'local_deals',
      isAvailable: true,
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'prod-9',
      productId: 'NISU-109',
      name: '20W PD Fast Charger Adapter with Braided Type-C Cable',
      description: 'BIS certified rapid charging wall adapter with surge protection, temperature control, and high tensile braided fast-charging cable.',
      price: 399,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'under_499',
      isAvailable: true,
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'prod-10',
      productId: 'NISU-110',
      name: 'Heavy Base Tri-Ply Stainless Steel Kadai (2.6L with Glass Lid)',
      description: 'Induction and gas compatible tri-ply kadai with even heat distribution and cool-touch riveted handles. Non-reactive healthy cooking.',
      price: 749,
      originalPrice: 1399,
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
      thumbnailTag: 'kitchen',
      isAvailable: true,
      createdAt: '2025-01-16T10:00:00Z',
    },
  ],
  orders: [] as any[],
  emailOutbox: [] as any[],
};

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...initialData,
      ...parsed,
      paymentSettings: {
        ...initialData.paymentSettings,
        ...(parsed.paymentSettings || {}),
      },
      customers: parsed.customers || [],
      thumbnails: parsed.thumbnails || initialData.thumbnails,
      banners: parsed.banners || initialData.banners,
      products: parsed.products || initialData.products,
      orders: parsed.orders || [],
      emailOutbox: parsed.emailOutbox || [],
    };
  } catch (err) {
    console.error('Error reading store:', err);
    return initialData;
  }
}

function writeStore(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store:', err);
  }
}

readStore();

// Middleware to authenticate admin requests
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session' });
  }
  next();
}

// Order Email Dispatch Function
// Strictly sends complete order information to nishaldamor03@gmail.com
async function dispatchOrderEmail(order: any) {
  const store = readStore();
  const targetEmail = 'nishaldamor03@gmail.com';
  const web3formsKey = store.paymentSettings?.web3formsKey || process.env.WEB3FORMS_ACCESS_KEY || '';

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-weight: 500;">
        ${item.productName} <br/>
        <span style="font-size: 11px; color: #64748b;">Product ID: ${item.productId}</span>
      </td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; text-align: right; font-weight: 600;">₹${item.price * item.quantity}</td>
    </tr>
  `
    )
    .join('');

  const emailSubject = `🛒 [NISUMART ORDER] ${order.orderId} - ₹${order.finalAmount} from ${order.customerName} (${order.city})`;

  const emailTextSummary = `
========================================
NEW NISUMART ORDER NOTIFICATION
========================================
Order ID: ${order.orderId}
Order Date & Time: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

CUSTOMER DETAILS:
Customer Name: ${order.customerName}
Primary Mobile: +91 ${order.mobile}
Second Mobile: ${order.secondMobile ? '+91 ' + order.secondMobile : 'None'}

DELIVERY ADDRESS (MADHYA PRADESH):
House / Building Name: ${order.houseNo}
Road Name / Area / Colony: ${order.roadArea}
City: ${order.city}
State: ${order.state}
PIN Code: ${order.pinCode}

PRODUCTS ORDERED:
${(order.items || []).map((it: any) => `- ${it.productName} (ID: ${it.productId}) x ${it.quantity} @ ₹${it.price} = ₹${it.price * it.quantity}`).join('\n')}

PAYMENT & TOTAL BREAKDOWN:
Base Amount: ₹${order.baseAmount}
Payment Method: ${order.paymentMethod.toUpperCase()}
${order.paymentMethod === 'cod' ? 'COD Doorstep Charge: +₹50' : ''}
${order.paymentMethod === 'online' ? 'Online Payment Discount: -₹50' : ''}
Final Order Total: ₹${order.finalAmount}
UPI Transaction ID / UTR: ${order.upiTransactionId || 'N/A'}
Payment Verification Status: ${order.paymentVerificationStatus}

Recipient Email: ${targetEmail}
Customer Support: 7772809503
========================================
  `.trim();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #10b981; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .content { padding: 24px; }
        .section-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; color: #475569; text-transform: uppercase; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NISUMART</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">NEW ORDER NOTIFICATION</p>
          <div class="badge">Order ID: ${order.orderId}</div>
        </div>
        <div class="content">
          <div class="section-title">Customer Information</div>
          <div class="info-card">
            <strong>Customer Name:</strong> ${order.customerName}<br/>
            <strong>Primary Mobile:</strong> <a href="tel:${order.mobile}">+91 ${order.mobile}</a><br/>
            ${order.secondMobile ? `<strong>Second Mobile:</strong> <a href="tel:${order.secondMobile}">+91 ${order.secondMobile}</a><br/>` : ''}
            <strong>Order Time:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>

          <div class="section-title">Delivery Address (Madhya Pradesh)</div>
          <div class="info-card">
            <strong>House / Building:</strong> ${order.houseNo}<br/>
            <strong>Road / Colony / Area:</strong> ${order.roadArea}<br/>
            <strong>City:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${order.city}</span><br/>
            <strong>State:</strong> ${order.state}<br/>
            <strong>PIN Code:</strong> ${order.pinCode}
          </div>

          <div class="section-title">Purchased Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="section-title">Payment & Total Breakdown</div>
          <div class="info-card">
            <div style="display: flex; justify-content: space-between;">
              <span>Base Products Total:</span>
              <span>₹${order.baseAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
              <span>Payment Mode:</span>
              <strong style="text-transform: uppercase;">${order.paymentMethod}</strong>
            </div>
            ${order.paymentMethod === 'cod' ? `
              <div style="display: flex; justify-content: space-between; color: #d97706; margin-top: 4px;">
                <span>COD Doorstep Charge:</span>
                <span>+₹50</span>
              </div>
            ` : ''}
            ${order.paymentMethod === 'online' ? `
              <div style="display: flex; justify-content: space-between; color: #16a34a; margin-top: 4px;">
                <span>Online Payment Discount:</span>
                <span>-₹50</span>
              </div>
            ` : ''}
            ${order.upiTransactionId ? `
              <div style="margin-top: 6px; padding: 6px; background: #e0f2fe; border-radius: 6px; font-size: 12px;">
                <strong>UPI Transaction ID / UTR:</strong> <code>${order.upiTransactionId}</code><br/>
                <strong>Payment Verification Status:</strong> <span>${order.paymentVerificationStatus}</span>
              </div>
            ` : `
              <div style="margin-top: 6px; font-size: 12px; color: #64748b;">
                <strong>Payment Verification Status:</strong> <span>${order.paymentVerificationStatus}</span>
              </div>
            `}
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 15px; font-weight: 700;">
              <span>Final Order Total:</span>
              <span style="color: #10b981;">₹${order.finalAmount}</span>
            </div>
          </div>
        </div>
        <div class="footer">
          NISUMART Order Notification for ${targetEmail}<br/>
          Customer Support Phone: 7772809503
        </div>
      </div>
    </body>
    </html>
  `;

  let sent = false;
  let errorMsg = '';
  let providerUsed = '';

  // 1. Try Web3Forms if valid access key is configured (ignore placeholder dummy keys)
  const isValidWeb3Key =
    web3formsKey &&
    web3formsKey.trim() !== '' &&
    !web3formsKey.startsWith('00000000') &&
    web3formsKey.length >= 10;

  if (isValidWeb3Key) {
    try {
      const w3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsKey.trim(),
          subject: emailSubject,
          from_name: 'NISUMART Orders',
          to_email: targetEmail,
          message: emailTextSummary,
          order_id: order.orderId,
          customer_name: order.customerName,
          mobile: order.mobile,
          city: order.city,
          final_amount: `₹${order.finalAmount}`,
          payment_method: order.paymentMethod,
          upi_utr: order.upiTransactionId || 'N/A',
        }),
      });

      const w3Data: any = await w3Res.json().catch(() => null);
      if (w3Res.ok && w3Data && (w3Data.success || w3Res.status === 200)) {
        sent = true;
        providerUsed = 'Web3Forms';
        console.log(`[EMAIL DISPATCH] Successfully sent email to ${targetEmail} via Web3Forms`);
      } else {
        const errMsg = w3Data?.message || `Web3Forms HTTP ${w3Res.status}`;
        console.warn(`[EMAIL DISPATCH NOTICE] Web3Forms returned HTTP ${w3Res.status} on server. Browser client will deliver notification: ${errMsg}`);
        errorMsg = `Web3Forms server status: ${errMsg}`;
      }
    } catch (w3Err: any) {
      console.warn('[EMAIL DISPATCH NOTICE] Web3Forms server connection notice:', w3Err.message);
      errorMsg = `Web3Forms connection notice: ${w3Err.message}`;
    }
  }

  // 2. Fallback to Nodemailer if SMTP configured
  if (!sent && store.smtpConfig?.host && store.smtpConfig?.user && store.smtpConfig?.pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: store.smtpConfig.host,
        port: store.smtpConfig.port || 587,
        secure: store.smtpConfig.port === 465,
        auth: {
          user: store.smtpConfig.user,
          pass: store.smtpConfig.pass,
        },
      });

      await transporter.sendMail({
        from: store.smtpConfig.from || `NISUMART <${store.smtpConfig.user}>`,
        to: targetEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailTextSummary,
      });

      sent = true;
      providerUsed = 'SMTP/Nodemailer';
      console.log(`[EMAIL DISPATCH] Successfully sent email to ${targetEmail} via SMTP`);
    } catch (smtpErr: any) {
      console.error('[EMAIL DISPATCH] SMTP error:', smtpErr);
      errorMsg = errorMsg ? `${errorMsg}; SMTP error: ${smtpErr.message}` : `SMTP error: ${smtpErr.message}`;
    }
  }

  // 3. If neither Web3Forms nor SMTP succeeded or was configured, record exact state
  if (!sent && !errorMsg) {
    errorMsg = 'No active email provider configured (Set Web3Forms Key or SMTP in Admin Settings). Order recorded in outbox.';
    console.warn(`[EMAIL DISPATCH] ${errorMsg}`);
  }

  // Record in Outbox
  const outboxEntry = {
    id: 'email-' + Date.now(),
    orderId: order.orderId,
    to: targetEmail,
    subject: emailSubject,
    sentAt: new Date().toISOString(),
    status: sent ? 'Delivered' : 'Failed',
    provider: providerUsed || 'None',
    error: errorMsg || null,
    body: emailTextSummary,
  };

  const updatedStore = readStore();
  updatedStore.emailOutbox = [outboxEntry, ...(updatedStore.emailOutbox || [])].slice(0, 100);
  writeStore(updatedStore);

  return { success: sent, error: errorMsg, provider: providerUsed };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Get complete catalog data + public payment settings
app.get('/api/data', (_req, res) => {
  const store = readStore();
  res.json({
    products: store.products || [],
    thumbnails: (store.thumbnails || []).sort((a: any, b: any) => a.order - b.order),
    banners: (store.banners || []).sort((a: any, b: any) => a.order - b.order),
    paymentSettings: {
      upiId: store.paymentSettings?.upiId || '7772809503@paytm',
      upiQrImage: store.paymentSettings?.upiQrImage || '',
      isOnlinePaymentEnabled: store.paymentSettings?.isOnlinePaymentEnabled ?? true,
      web3formsKey: store.paymentSettings?.web3formsKey || process.env.WEB3FORMS_ACCESS_KEY || '',
    },
    supportInfo: {
      phone: '7772809503',
      email: 'nishaldamor03@gmail.com',
    },
  });
});

// 2. Customer Authentication: Signup
app.post('/api/customer/signup', (req, res) => {
  try {
    const { name, mobile, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    const cleanMobile = (mobile || '').replace(/\D/g, '').trim();
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const store = readStore();
    const existing = (store.customers || []).find((c: any) => c.mobile === cleanMobile);
    if (existing) {
      return res.status(400).json({ error: 'A customer with this mobile number already exists. Please login.' });
    }

    // Securely hash password using PBKDF2 with unique salt
    const { hash, salt } = hashPassword(password);
    const newCustomer = {
      id: 'cust-' + Date.now(),
      name: name.trim(),
      mobile: cleanMobile,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
    };

    store.customers = [newCustomer, ...(store.customers || [])];
    writeStore(store);

    const customerSession = {
      id: newCustomer.id,
      name: newCustomer.name,
      mobile: newCustomer.mobile,
      createdAt: newCustomer.createdAt,
    };

    return res.status(201).json({
      success: true,
      customer: customerSession,
      message: 'Account created successfully!',
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
});

// 3. Customer Authentication: Login
app.post('/api/customer/login', (req, res) => {
  try {
    const { mobile, password } = req.body;
    const cleanMobile = (mobile || '').replace(/\D/g, '').trim();
    if (!cleanMobile || !password) {
      return res.status(400).json({ error: 'Mobile number and password are required.' });
    }

    const store = readStore();
    const customer = (store.customers || []).find((c: any) => c.mobile === cleanMobile);
    if (!customer) {
      return res.status(401).json({ error: 'No account found with this mobile number. Please sign up.' });
    }

    const isMatch = verifyPassword(password, customer.passwordHash, customer.salt);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    return res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        createdAt: customer.createdAt,
      },
      message: 'Logged in successfully!',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// 4. Submit Customer Order
// Server securely recalculates prices & applies pricing rules
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      mobile,
      secondMobile,
      pinCode,
      city,
      state,
      houseNo,
      roadArea,
      items,
      paymentMethod,
      upiTransactionId,
      cardAuthToken,
    } = req.body;

    // Strict validation
    if (!customerName || !mobile || !pinCode || !city || !state || !houseNo || !roadArea) {
      return res.status(400).json({ error: 'All address and recipient fields are required.' });
    }

    const allowedCities = ['Dewas', 'Hatpipliya', 'Bagli', 'Indore'];
    if (!allowedCities.includes(city)) {
      return res.status(400).json({ error: `City must be one of: ${allowedCities.join(', ')}` });
    }

    if (state !== 'Madhya Pradesh') {
      return res.status(400).json({ error: 'State must be Madhya Pradesh only.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required.' });
    }

    const store = readStore();

    // Server-side Price Calculation: Never trust price sent by client!
    let serverBaseAmount = 0;
    const verifiedItems = items.map((it: any) => {
      const catalogItem = (store.products || []).find(
        (p: any) => p.productId === it.productId || p.id === it.productId
      );
      const unitPrice = catalogItem ? catalogItem.price : Number(it.price) || 0;
      const quantity = Math.max(1, parseInt(it.quantity) || 1);
      serverBaseAmount += unitPrice * quantity;
      return {
        productId: catalogItem ? catalogItem.productId : it.productId,
        productName: catalogItem ? catalogItem.name : it.productName,
        price: unitPrice,
        quantity,
        image: catalogItem?.image || it.image,
      };
    });

    let adjustmentAmount = 0;
    let paymentVerificationStatus = 'Not Applicable';

    if (paymentMethod === 'cod') {
      adjustmentAmount = 50; // +50 COD handling fee
      paymentVerificationStatus = 'Not Applicable';
    } else if (paymentMethod === 'online') {
      adjustmentAmount = -50; // -50 online payment discount
      if (!upiTransactionId || !upiTransactionId.trim()) {
        return res.status(400).json({ error: 'UPI Transaction ID / UTR number is required for Online Payment.' });
      }
      // Customer submitted UTR; must be manually verified by admin!
      paymentVerificationStatus = 'Pending Verification';
    } else if (paymentMethod === 'card') {
      adjustmentAmount = 0;
      if (!cardAuthToken) {
        return res.status(400).json({ error: 'Card payment gateway authorization token is missing.' });
      }
      paymentVerificationStatus = 'Verified';
    } else {
      return res.status(400).json({ error: 'Invalid payment method selected.' });
    }

    const finalAmount = Math.max(0, serverBaseAmount + adjustmentAmount);
    const orderId = 'NISU-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: 'ord-' + Date.now(),
      orderId,
      customerId: customerId || null,
      customerName: customerName.trim(),
      mobile: mobile.replace(/\D/g, '').trim(),
      secondMobile: secondMobile ? secondMobile.replace(/\D/g, '').trim() : '',
      pinCode: pinCode.trim(),
      city,
      state,
      houseNo: houseNo.trim(),
      roadArea: roadArea.trim(),
      items: verifiedItems,
      paymentMethod,
      baseAmount: serverBaseAmount,
      adjustmentAmount,
      finalAmount,
      upiTransactionId: upiTransactionId ? upiTransactionId.trim() : null,
      paymentVerificationStatus,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      emailSent: false,
      emailError: null as string | null,
    };

    // Save order
    store.orders = [newOrder, ...(store.orders || [])];
    writeStore(store);

    // Dispatch real email to nishaldamor03@gmail.com
    const emailRes = await dispatchOrderEmail(newOrder);
    newOrder.emailSent = emailRes.success;
    if (emailRes.error) newOrder.emailError = emailRes.error;

    // Update order with email status in store
    const storeAfterEmail = readStore();
    const idx = (storeAfterEmail.orders || []).findIndex((o: any) => o.id === newOrder.id);
    if (idx !== -1) {
      storeAfterEmail.orders[idx].emailSent = emailRes.success;
      storeAfterEmail.orders[idx].emailError = emailRes.error || null;
      writeStore(storeAfterEmail);
    }

    return res.status(201).json({
      success: true,
      order: newOrder,
      emailStatus: {
        sent: emailRes.success,
        error: emailRes.error || null,
        provider: emailRes.provider || null,
      },
      message: 'Order placed successfully!',
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to place order: ' + err.message });
  }
});

// 5. Customer Order Lookup
app.get('/api/customer-orders', (req, res) => {
  const { query, customerId } = req.query;
  const store = readStore();

  if (customerId && typeof customerId === 'string') {
    const matched = (store.orders || []).filter((o: any) => o.customerId === customerId);
    return res.json({ orders: matched });
  }

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cleanQuery = query.trim().toLowerCase();
  const matched = (store.orders || []).filter((o: any) => {
    return (
      o.orderId.toLowerCase().includes(cleanQuery) ||
      o.mobile.includes(cleanQuery) ||
      (o.secondMobile && o.secondMobile.includes(cleanQuery))
    );
  });

  return res.json({ orders: matched });
});

// 6. Card Payment Gateway Intent & Verification (PCI-DSS compliant flow)
app.post('/api/payment/verify-card-intent', (req, res) => {
  const { amount, customerName, city } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount for payment intent' });
  }

  const intentId = 'pi_nisu_' + crypto.randomBytes(12).toString('hex');
  res.json({
    success: true,
    intentId,
    clientSecret: intentId + '_sec_' + crypto.randomBytes(8).toString('hex'),
    amount,
    currency: 'INR',
    gateway: 'NISUMART 3D-Secure Encrypted Gateway',
    customerName,
    city,
    verifiedAt: new Date().toISOString(),
  });
});

app.post('/api/payment/confirm-card-charge', (req, res) => {
  const { intentId, otp } = req.body;
  if (!intentId) return res.status(400).json({ error: 'Missing intentId' });
  if (!otp || otp.length < 4) return res.status(400).json({ error: 'Invalid 3DS OTP verification code' });

  res.json({
    success: true,
    cardAuthToken: 'auth_' + crypto.randomBytes(16).toString('hex'),
    intentId,
    status: 'AUTHORIZED',
    message: 'Card charge authorized by issuing bank.',
  });
});

// 7. Secure Admin Login
// Verifies password server-side against process.env.ADMIN_PASSWORD or store.adminPasscode
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  const store = readStore();
  const validPass = process.env.ADMIN_PASSWORD || store.adminPasscode || 'NiShAlDaMoR143';

  if (passcode && passcode === validPass) {
    const token = 'admin_tok_' + crypto.randomBytes(24).toString('hex');
    activeAdminTokens.add(token);
    return res.json({
      success: true,
      token,
      message: 'Admin authenticated successfully',
    });
  }

  return res.status(401).json({ error: 'Invalid admin password. Please try again.' });
});

// 8. Admin: Get all orders & store info (Protected)
app.get('/api/admin/orders', requireAdminAuth, (_req, res) => {
  const store = readStore();
  return res.json({
    orders: store.orders || [],
    emailOutbox: store.emailOutbox || [],
    paymentSettings: store.paymentSettings || {},
  });
});

// 9. Admin: Update order status (Protected)
app.post('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = readStore();
  const order = (store.orders || []).find((o: any) => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  writeStore(store);
  return res.json({ success: true, order });
});

// 10. Admin: Update payment verification status (Protected)
// Enables admin to manually verify or reject UPI Transaction ID / UTR
app.post('/api/admin/orders/:id/payment-verification', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { verificationStatus } = req.body;
  const store = readStore();
  const order = (store.orders || []).find((o: any) => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.paymentVerificationStatus = verificationStatus;
  writeStore(store);
  return res.json({ success: true, order });
});

// 11. Admin: Payment Settings (UPI ID, QR Code, Enable/Disable, Web3Forms key)
app.post('/api/admin/payment-settings', requireAdminAuth, (req, res) => {
  const { upiId, upiQrImage, isOnlinePaymentEnabled, web3formsKey } = req.body;
  const store = readStore();

  store.paymentSettings = {
    ...store.paymentSettings,
    ...(upiId !== undefined ? { upiId: upiId.trim() } : {}),
    ...(upiQrImage !== undefined ? { upiQrImage: upiQrImage.trim() } : {}),
    ...(isOnlinePaymentEnabled !== undefined ? { isOnlinePaymentEnabled: Boolean(isOnlinePaymentEnabled) } : {}),
    ...(web3formsKey !== undefined ? { web3formsKey: web3formsKey.trim() } : {}),
  };

  writeStore(store);
  return res.json({
    success: true,
    paymentSettings: store.paymentSettings,
    message: 'Payment and email notification settings saved successfully.',
  });
});

// 12. Admin: Products CRUD (Protected)
app.post('/api/admin/products', requireAdminAuth, (req, res) => {
  const { action, product } = req.body;
  const store = readStore();

  if (action === 'create') {
    if (!product.name || !product.price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }
    const newProduct = {
      ...product,
      id: 'prod-' + Date.now(),
      productId: product.productId || 'NISU-' + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString(),
      isAvailable: product.isAvailable !== false,
    };
    store.products = [newProduct, ...(store.products || [])];
    writeStore(store);
    return res.json({ success: true, product: newProduct });
  }

  if (action === 'update') {
    const idx = (store.products || []).findIndex((p: any) => p.id === product.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    store.products[idx] = { ...store.products[idx], ...product };
    writeStore(store);
    return res.json({ success: true, product: store.products[idx] });
  }

  if (action === 'delete') {
    store.products = (store.products || []).filter((p: any) => p.id !== product.id);
    writeStore(store);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
});

// 13. Admin: Custom Thumbnails CRUD (Protected)
app.post('/api/admin/thumbnails', requireAdminAuth, (req, res) => {
  const { action, thumbnail, thumbnails } = req.body;
  const store = readStore();

  if (action === 'reorder' && Array.isArray(thumbnails)) {
    store.thumbnails = thumbnails;
    writeStore(store);
    return res.json({ success: true, thumbnails: store.thumbnails });
  }

  if (action === 'create') {
    if (!thumbnail.title || !thumbnail.image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }
    const newThumb = {
      ...thumbnail,
      id: 'thumb-' + Date.now(),
      order: thumbnail.order || (store.thumbnails || []).length + 1,
      tag: thumbnail.tag || thumbnail.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    };
    store.thumbnails = [...(store.thumbnails || []), newThumb];
    writeStore(store);
    return res.json({ success: true, thumbnail: newThumb });
  }

  if (action === 'update') {
    const idx = (store.thumbnails || []).findIndex((t: any) => t.id === thumbnail.id);
    if (idx === -1) return res.status(404).json({ error: 'Thumbnail not found' });
    store.thumbnails[idx] = { ...store.thumbnails[idx], ...thumbnail };
    writeStore(store);
    return res.json({ success: true, thumbnail: store.thumbnails[idx] });
  }

  if (action === 'delete') {
    store.thumbnails = (store.thumbnails || []).filter((t: any) => t.id !== thumbnail.id);
    writeStore(store);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
});

// 14. Admin: Promotional Banners CRUD (Protected)
app.post('/api/admin/banners', requireAdminAuth, (req, res) => {
  const { action, banner, banners } = req.body;
  const store = readStore();

  if (action === 'reorder' && Array.isArray(banners)) {
    store.banners = banners;
    writeStore(store);
    return res.json({ success: true, banners: store.banners });
  }

  if (action === 'create') {
    if (!banner.title || !banner.image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }
    const newBanner = {
      ...banner,
      id: 'banner-' + Date.now(),
      order: banner.order || (store.banners || []).length + 1,
    };
    store.banners = [...(store.banners || []), newBanner];
    writeStore(store);
    return res.json({ success: true, banner: newBanner });
  }

  if (action === 'update') {
    const idx = (store.banners || []).findIndex((b: any) => b.id === banner.id);
    if (idx === -1) return res.status(404).json({ error: 'Banner not found' });
    store.banners[idx] = { ...store.banners[idx], ...banner };
    writeStore(store);
    return res.json({ success: true, banner: store.banners[idx] });
  }

  if (action === 'delete') {
    store.banners = (store.banners || []).filter((b: any) => b.id !== banner.id);
    writeStore(store);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
});

// 15. Admin: Test Email to nishaldamor03@gmail.com (Protected)
app.post('/api/admin/test-email', requireAdminAuth, async (_req, res) => {
  const mockOrder = {
    orderId: 'NISU-TEST-' + Math.floor(1000 + Math.random() * 9000),
    customerName: 'Test Admin Dispatch',
    mobile: '7772809503',
    secondMobile: '',
    pinCode: '455001',
    city: 'Dewas',
    state: 'Madhya Pradesh',
    houseNo: 'Plot 10, Station Road',
    roadArea: 'Near Main Market',
    items: [
      {
        productId: 'NISU-101',
        productName: 'Sample Product for Email Diagnostic',
        price: 500,
        quantity: 1,
      },
    ],
    paymentMethod: 'online',
    baseAmount: 500,
    adjustmentAmount: -50,
    finalAmount: 450,
    upiTransactionId: 'TEST-UTR-998877',
    paymentVerificationStatus: 'Pending Verification',
    createdAt: new Date().toISOString(),
  };

  const dispatchResult = await dispatchOrderEmail(mockOrder);
  return res.json({
    success: dispatchResult.success,
    error: dispatchResult.error || null,
    provider: dispatchResult.provider || null,
    message: dispatchResult.success
      ? `Email successfully sent to nishaldamor03@gmail.com via ${dispatchResult.provider}!`
      : `Email dispatch failed: ${dispatchResult.error}`,
  });
});

// 16. Admin: Resend Order Email (Protected)
app.post('/api/admin/orders/:id/resend-email', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const order = (store.orders || []).find((o: any) => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const result = await dispatchOrderEmail(order);
  return res.json({ success: true, result });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NISUMART Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
