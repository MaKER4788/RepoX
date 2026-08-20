# Identity Verification Architecture — RepoX

> Generated: 2026-08-20  
> Scope: Day 1 — Analysis & Architecture Proposal  
> Status: Design only. No existing code modified.

---

## 1. Current Architecture Discovered

### 1.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js (~4.16) |
| Database | MongoDB (via Mongoose 9.x) |
| Templating | EJS 2.6 |
| Auth | Passport.js + passport-local-mongoose |
| Sessions | express-session + connect-mongo |
| File uploads | Multer (memory storage) + Cloudinary |
| CSS | Tailwind CSS 4.x (CLI build) |
| Payments | Razorpay SDK (stub, not yet wired) |
| Deployment | Vercel (via `api/index.js` → `app.js`) |

### 1.2 Directory Structure

```
RepoX/
├── api/index.js              # Vercel entry — re-exports app.js
├── app.js                    # Express app setup, middleware, routes
├── bin/www                   # Local dev server entry
├── config/
│   ├── cloudinary.js         # Cloudinary config + uploadBuffer()
│   └── multer.js             # Multer config (memory storage, file filters)
├── controllers/
│   ├── authController.js     # Register, login, logout handlers (largely unused)
│   ├── dashboardController.js# Dashboard page
│   ├── marketplaceController.js # Marketplace listing with filters
│   ├── paymentcontroller.js  # Empty file
│   ├── profilecontroller.js  # Empty file
│   ├── projectController.js  # CRUD for projects
│   ├── reviewController.js   # Create review
│   └── wishlistcontroller.js # Toggle wishlist
├── middlewares/
│   └── middleware.js          # Single export: isLoggedIn()
├── models/
│   ├── order.js              # Empty file
│   ├── project.js            # Project schema
│   ├── review.js             # Review schema
│   └── user.js               # User schema + MongoDB connection
├── routes/
│   ├── auth.js               # GET/POST /register, /login, GET /logout
│   ├── dashboard.js          # GET /dashboard
│   ├── index.js              # GET /, /upload, /categories
│   ├── marketplace.js        # GET /marketplace
│   ├── payments.js           # Empty file
│   ├── profile.js            # GET /profile (isLoggedIn)
│   ├── projects.js           # CRUD /projects/*
│   ├── review.js             # POST /reviews/:id
│   ├── users.js              # Stub: GET /users
│   └── wishlist.js           # POST /wishlist/:id
├── views/
│   ├── partials/
│   │   ├── header.ejs        # <html>, <head>, body open, includes navbar
│   │   ├── footer.ejs        # Footer + scripts + </body></html>
│   │   ├── navbar.ejs        # Full navbar with user state
│   │   ├── profile/          # profileCard, stats, myprojects, purchased, wishlist
│   │   ├── marketplace/      # search, filters, projectGrid, projectCard, pagination
│   │   ├── project/          # Single project view partials
│   │   └── upload/           # Upload form step partials
│   ├── index.ejs, login.ejs, register.ejs, profile.ejs,
│   │   dashboard.ejs, marketplace.ejs, upload.ejs, project.ejs,
│   │   editproject.ejs, search.ejs, categories.ejs, error.ejs
├── public/
│   ├── javascripts/navbar.js # Mobile menu toggle
│   ├── output.css            # Built Tailwind
│   └── stylesheets/          # Source CSS
└── uploads/                  # Local upload directory
```

### 1.3 User Model (Current)

**File:** `models/user.js:18-39`

```js
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    age:      Number,
    username: { type: String, required: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
});
userSchema.plugin(passportLocalMongoose);
```

**Key observations:**
- `passportLocalMongoose` plugin adds `hash`, `salt` fields automatically
- No `timestamps: true` on the schema
- No avatar/profileImage field
- No role/permission field (all users are equal)
- **No verification-related fields exist**
- MongoDB connection is established inside `models/user.js` (not a separate config file)

### 1.4 Authentication Flow

1. **Registration** (`routes/auth.js:13-30`):
   - POST `/register` → creates `User` → `User.register(user, password)` (passport-local-mongoose) → `passport.authenticate("local")` → redirect `/profile`
   
2. **Login** (`routes/auth.js:35-38`):
   - POST `/login` → `passport.authenticate("local")` → success: `/profile`, failure: `/`

3. **Session** (`app.js:31-48`):
   - `express-session` with `connect-mongo` store
   - `passport.initialize()` + `passport.session()`
   - `res.locals.user = req.user` set on every request

4. **Logout** (`routes/auth.js:41-46`):
   - GET `/logout` → `req.logout()` → redirect `/`

5. **Route protection**: `isLoggedIn` middleware in `middlewares/middleware.js:1-8`

### 1.5 Key Patterns

- **Route mounting** in `app.js`: auth routes mounted at `/` root, others at `/profile`, `/projects`, etc.
- **No API layer**: All routes serve EJS views or redirect. No JSON API endpoints exist.
- **No validators**: No express-validator, joi, or zod usage anywhere.
- **No services layer**: Business logic lives directly in controllers.
- **No error handling middleware** beyond the default Express error handler.
- **Inline `isLoggedIn`**: `routes/projects.js:7-13` duplicates the middleware from `middlewares/middleware.js`.
- **Empty stub files**: `paymentcontroller.js`, `profilecontroller.js`, `order.js`, `payments.js` are all empty — likely planned features.

---

## 2. Proposed Verification Architecture

### 2.1 Design Principles

1. **Separate from auth**: Verification is a layer on top of authentication, not a replacement
2. **独立 Model**: Use a dedicated `VerificationRequest` model (not embedded in User) to track history
3. **Minimal User model changes**: Add only a `verification` subdocument to User for fast lookups
4. **Service layer**: Introduce `services/` for verification business logic (OTP generation, validation)
5. **Middleware-based gating**: New middleware for routes requiring verified identity
6. **No Aadhaar yet**: Architecture supports adding it later but Day 1-7 uses email/phone OTP only

### 2.2 New Files to Create

```
RepoX/
├── models/
│   └── verification.js          # NEW — VerificationRequest schema
├── controllers/
│   └── verificationController.js # NEW — Verification flow handlers
├── routes/
│   └── verification.js          # NEW — Verification routes
├── services/
│   └── verificationService.js   # NEW — OTP generation, validation, expiry logic
├── middleware/
│   └── verification.js          # NEW — isVerified, isVerificationPending middleware
├── validators/
│   └── verification.js          # NEW — Input validation for verification forms
├── views/
│   └── verification/
│       ├── verify-email.ejs     # NEW — Email verification page
│       ├── verify-phone.ejs     # NEW — Phone verification page
│       ├── verification-pending.ejs # NEW — Status page
│       └── verification-success.ejs # NEW — Success confirmation
└── docs/
    └── identity-verification-architecture.md  # THIS FILE
```

### 2.3 New Files Detail

#### `models/verification.js` — VerificationRequest Schema

```js
const verificationSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: "User", required: true, index: true },
    method: { type: String, enum: ["email", "phone", "document"], required: true },
    status: { type: String, enum: ["pending", "verified", "expired", "rejected"], default: "pending" },
    otpHash: String,           // Hashed OTP (never store plain OTP)
    identifier: String,        // Email or phone number being verified
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: Date,
    verifiedAt: Date,
    rejectionReason: String,
    metadata: mongoose.Schema.Types.Mixed  // Flexible field for future use
}, { timestamps: true });

// Index for expiring old requests
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

#### `User Model Modification` — Add verification subdocument

```js
// Addition to existing userSchema (non-breaking):
verification: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    verifiedAt: Date
}
```

#### `services/verificationService.js`

- `generateOTP()` — Generate 6-digit OTP
- `hashOTP(otp)` — SHA-256 hash for storage
- `createVerificationRequest(userId, method, identifier)` — Create request, send OTP
- `verifyOTP(requestId, otp)` — Validate OTP, update status
- `isUserVerified(userId)` — Check verification status
- `cleanupExpiredRequests()` — Cron/manual cleanup

#### `controllers/verificationController.js`

- `getVerificationPage` — Render verification choice page
- `startEmailVerification` — POST handler for email OTP
- `verifyEmailOTP` — POST handler to verify email OTP
- `startPhoneVerification` — POST handler for phone OTP (future)
- `verifyPhoneOTP` — POST handler (future)
- `getVerificationStatus` — GET handler for status page

#### `routes/verification.js`

```
GET  /verification              → Verification page (isLoggedIn)
POST /verification/email/start  → Start email OTP (isLoggedIn)
POST /verification/email/verify → Verify email OTP (isLoggedIn)
GET  /verification/status       → Check status (isLoggedIn)
```

#### `middleware/verification.js`

- `isVerified` — Middleware: blocks if user is not verified
- `isVerificationPending` — Middleware: blocks if verification already in progress
- `verificationGated` — Route-level guard for specific actions

### 2.4 Files That Will Be Modified

| File | Change | Priority |
|------|--------|----------|
| `models/user.js` | Add `verification` subdocument to schema | **Must** |
| `app.js` | Mount verification routes (`/verification`) | **Must** |
| `views/partials/navbar.ejs` | Add verification badge/status indicator | Should |
| `views/partials/profile/profileCard.ejs` | Show verification status badge | Should |
| `views/partials/profile/stats.ejs` | Show verification in stats | Nice-to-have |
| `.env.example` | Add verification-related env vars | **Must** |

### 2.5 Files That Will NOT Be Modified

| File | Reason |
|------|--------|
| `controllers/authController.js` | Auth flow stays separate |
| `routes/auth.js` | No changes to register/login |
| `middlewares/middleware.js` | Keep existing `isLoggedIn` untouched |
| `controllers/projectController.js` | No changes needed |
| `controllers/marketplaceController.js` | No changes needed |
| `controllers/reviewController.js` | No changes needed |
| `controllers/wishlistcontroller.js` | No changes needed |
| `controllers/dashboardController.js` | No changes needed |
| `routes/projects.js` | No changes needed |
| `routes/marketplace.js` | No changes needed |
| `routes/review.js` | No changes needed |
| `routes/wishlist.js` | No changes needed |
| `routes/dashboard.js` | No changes needed |
| `config/cloudinary.js` | No changes needed |
| `config/multer.js` | No changes needed |
| All existing EJS views (except navbar/profile) | No changes needed |

---

## 3. Data Flow

### 3.1 Verification Request Flow

```
User clicks "Verify Identity" on profile
        │
        ▼
GET /verification (isLoggedIn)
        │
        ▼
Choose method → POST /verification/email/start
        │
        ▼
verificationService.generateOTP() → hash → store in VerificationRequest
        │
        ▼
Send OTP via email (nodemailer/SendGrid — future)
        │
        ▼
User enters OTP → POST /verification/email/verify
        │
        ▼
verificationService.verifyOTP() → compare hashes
        │
        ├── Success → Update VerificationRequest.status = "verified"
        │              Update User.verification.emailVerified = true
        │              → redirect /verification/status
        │
        └── Failure → Increment attempts
                      ├── attempts < max → retry
                      └── attempts >= max → mark expired, show error
```

### 3.2 Route Gating Flow

```
Request hits protected route
        │
        ▼
isLoggedIn middleware → ✅ authenticated?
        │                    │
        │                    └── No → redirect /login
        ▼
isVerified middleware → ✅ verified?
        │                    │
        │                    └── No → redirect /verification
        ▼
Route handler executes
```

---

## 4. Security Considerations

### 4.1 OTP Security
- **Never store plain OTPs** — always hash with SHA-256 before storage
- **Time-limited OTPs** — expire after 10 minutes
- **Rate limiting** — max 5 attempts per request, max 3 requests per hour per user
- **Single-use** — mark OTP as used after successful verification

### 4.2 Session Security
- Verification status is checked from DB on each gated request (not stored in session)
- Prevents stale verification states after account changes

### 4.3 Input Validation
- Email format validation before sending OTP
- Phone number format validation (Indian format: +91 XXXXX XXXXX)
- OTP input: exactly 6 digits, numeric only

### 4.4 Anti-Abuse
- Track verification attempts per IP and per user
- Implement exponential backoff on repeated failures
- Log all verification attempts for audit trail

### 4.5 Data Privacy
- Store only hashed OTPs
- `identifier` field stores email/phone in plaintext (needed for sending) — encrypt at rest if required
- VerificationRequest records have TTL index for automatic cleanup

### 4.6 Future Aadhaar Considerations
- Architecture supports `method: "document"` for future Aadhaar integration
- `metadata` field on VerificationRequest can store document type, reference IDs
- Never store Aadhaar numbers — use tokenized references only
- Use only official/authorized APIs (UIDAI sandbox for dev)

---

## 5. New Dependencies Needed (Future Days)

| Package | Purpose | When |
|---------|---------|------|
| `nodemailer` | Send OTP emails | Day 3-4 |
| `speakeasy` or `otplib` | OTP generation (optional) | Day 2 |
| `express-rate-limit` | Rate limiting on verification routes | Day 2 |
| `joi` or `express-validator` | Input validation | Day 2 |

**No new dependencies required for Day 1.**

---

## 6. Day-by-Day Implementation Plan

### Day 1 ✅ (This Document)
- [x] Audit entire codebase
- [x] Document current architecture
- [x] Design verification architecture
- [x] Identify files to create/modify
- [x] Define data models and flow

### Day 2 — Foundation
- [ ] Create `models/verification.js` (VerificationRequest schema)
- [ ] Add `verification` subdocument to `models/user.js`
- [ ] Create `services/verificationService.js` (OTP logic)
- [ ] Create `validators/verification.js` (input validation)
- [ ] Install `joi` or `express-validator` + `speakeasy`
- [ ] Add rate limiting to verification routes

### Day 3 — Core Flow
- [ ] Create `controllers/verificationController.js`
- [ ] Create `routes/verification.js`
- [ ] Create `middleware/verification.js`
- [ ] Mount routes in `app.js`
- [ ] Create verification EJS views
- [ ] Test email OTP flow end-to-end

### Day 4 — Email Sending
- [ ] Set up `nodemailer` with SMTP provider
- [ ] Create email templates for OTP
- [ ] Add email sending to `verificationService`
- [ ] Test real email delivery
- [ ] Add `.env` variables for SMTP

### Day 5 — UI Integration
- [ ] Update `navbar.ejs` with verification badge
- [ ] Update `profileCard.ejs` with verification status
- [ ] Add verification status to `stats.ejs`
- [ ] Create verification status page
- [ ] Add verification prompts for unverified users

### Day 6 — Protection & Gating
- [ ] Apply `isVerified` middleware to project upload route
- [ ] Apply `isVerified` middleware to review submission
- [ ] Add verification requirement notices in UI
- [ ] Test all gated routes

### Day 7 — Polish & Testing
- [ ] Add error handling for all verification edge cases
- [ ] Test rate limiting
- [ ] Test expired OTPs
- [ ] Test max attempts
- [ ] Add audit logging
- [ ] Final security review
- [ ] Update `.env.example` with all new variables

---

## 7. Environment Variables to Add

```env
# Verification
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6
VERIFICATION_REQUEST_LIMIT=3
VERIFICATION_WINDOW_HOURS=1

# Email (Day 4)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@repox.com
```

---

## 8. Critical Notes

1. **MongoDB connection is in `models/user.js`** — This is unusual. A `config/db.js` would be cleaner but we will NOT refactor this in the verification work. New models will just `require("mongoose")` and it will reuse the existing connection.

2. **Auth routes are mounted at root `/`** in `app.js:63` — verification routes should be mounted at `/verification` for clean separation.

3. **No JSON API exists** — all endpoints serve EJS or redirect. Verification will follow this same pattern.

4. **`profilecontroller.js` is empty** — the profile page is rendered directly from `routes/profile.js`. This is fine; verification controller will be a real file.

5. **`passport-local-mongoose` handles password hashing** — verification OTPs should use a different hashing approach (SHA-256) since they're temporary and high-throughput.

6. **The `crypto` package is already in dependencies** — can be used for OTP hashing without adding new packages.
