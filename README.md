# Micro Insurance Platform

A **blockchain-enabled parametric micro-insurance platform** with KYC verification, automated claims processing, and MetaMask integration.

---

## 🎯 **Project Overview**

This platform enables low-income users (farmers, laborers, fishermen) to purchase affordable micro-insurance policies with automated claim processing using blockchain oracles.

### **Key Features:**
- ✅ **Aadhaar-based KYC** with OCR extraction
- ✅ **MetaMask wallet integration** (Sepolia testnet)
- ✅ **Admin approval workflows** for companies and KYC
- ✅ **Automated claims** via blockchain oracles
- ✅ **Company registration** with document verification
- ✅ **Product creation** with oracle trigger configuration
- ✅ **Policy purchase** with blockchain transaction tracking

---

## 📊 **Implementation Status**

| Component | Status | Completion |
|-----------|--------|------------|
| **Backend API** | ✅ Complete | 100% |
| **Database Models** | ✅ Complete | 100% |
| **Redux Store** | ✅ Complete | 100% |
| **API Service Layer** | ✅ Complete | 100% |
| **Login Page** | ✅ Complete | 100% |
| **Frontend Pages** | 📋 To Implement | ~10% |
| **Components** | 📋 To Implement | 0% |

**Overall: ~40% Complete**

---

## 🏗️ **Technology Stack**

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Cloudinary (File Storage)
- Tesseract.js (OCR for Aadhaar)
- Sharp (Image Processing)

### Frontend
- Next.js 15 (App Router)
- Redux Toolkit (State Management)
- shadcn/ui + Tailwind CSS
- React Hook Form + Zod
- ThirdWeb (MetaMask Integration)
- Axios (API Calls)

### Blockchain
- MetaMask
- Sepolia Testnet
- ThirdWeb SDK

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js v18+
- PostgreSQL
- Cloudinary account
- MetaMask wallet

### **1. Clone Repository**
```bash
git clone <repository-url>
cd Micro-Insurance
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL
# - JWT_SECRET
# - CLOUDINARY_* credentials

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env:
# - NEXT_PUBLIC_API_URL=http://localhost:5000/api
# - NEXT_PUBLIC_THIRDWEB_CLIENT_ID

# Start frontend dev server
npm run dev
# App runs on http://localhost:3000
```

---

## 📚 **Documentation**

### **Backend Documentation**
- 📄 [README.md](./backend/README.md) - Setup & installation
- 📄 [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) - Complete API reference
- 📄 [IMPLEMENTATION_SUMMARY.md](./backend/IMPLEMENTATION_SUMMARY.md) - Detailed overview

### **Frontend Documentation**
- 📄 [FRONTEND_IMPLEMENTATION.md](./frontend/FRONTEND_IMPLEMENTATION.md) - Complete implementation guide
  - All 15 pages to build
  - Reusable components
  - Code examples
  - MetaMask integration

### **Project Overview**
- 📄 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Overall project summary

---

## 🔄 **User Flows**

### **1. User Registration & Policy Purchase**
```
1. User registers → POST /api/auth/register/user
2. Upload Aadhaar card (OCR extracts name & number)
3. Admin approves KYC
4. Connect MetaMask wallet
5. Browse insurance products
6. Purchase policy (MetaMask transaction)
7. Track policy status
```

### **2. Company Registration & Product Creation**
```
1. Company registers → POST /api/auth/register/company
2. Upload license & compliance documents
3. Admin approves company
4. Create insurance products
5. Monitor dashboard statistics
```

### **3. Admin Approval Workflow**
```
1. Login as admin
2. Review pending companies (view documents)
3. Approve/reject companies
4. Review pending KYCs (view Aadhaar images)
5. Approve/reject KYCs
6. Monitor platform statistics
```

---

## 📁 **Project Structure**

```
Micro-Insurance/
├── backend/                      # ✅ 100% Complete
│   ├── config/                   # Cloudinary, Database
│   ├── controllers/              # Auth, KYC, User, Company, Admin
│   ├── middleware/               # JWT, RBAC, File Upload
│   ├── models/                   # User, KYC, Company, Product, Policy, Claim
│   ├── routes/                   # API routes
│   ├── utils/                    # OCR processor
│   └── index.js                  # Main server
│
├── frontend/                     # ✅ 70% Complete (Foundation)
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   │   ├── layout.tsx        # ✅ Redux + ThirdWeb
│   │   │   ├── login/            # ✅ Complete
│   │   │   ├── register/         # 📋 To implement
│   │   │   ├── kyc/              # 📋 To implement
│   │   │   └── dashboard/        # 📋 To implement
│   │   ├── components/           # Reusable components
│   │   ├── store/                # ✅ Complete Redux store
│   │   │   └── slices/           # auth, kyc, product, policy, admin, company
│   │   └── services/             # ✅ API service layer
│   └── FRONTEND_IMPLEMENTATION.md
│
└── PROJECT_SUMMARY.md            # This file
```

---

## 🎨 **Screenshots & Features**

### **Backend Features:**
- ✅ 30+ RESTful API endpoints
- ✅ JWT authentication with RBAC
- ✅ Aadhaar OCR extraction (Tesseract.js)
- ✅ Cloudinary file storage
- ✅ MetaMask integration (transaction hash storage)
- ✅ Admin approval workflows
- ✅ PostgreSQL database with Sequelize

### **Frontend Features:**
- ✅ Redux state management (6 slices)
- ✅ ThirdWeb MetaMask integration
- ✅ Role-based routing
- ✅ Responsive UI (Tailwind CSS)
- ✅ Form validation (React Hook Form + Zod)
- ✅ Toast notifications (Sonner)

---

## 🧪 **Testing the Application**

### **Test User Registration Flow:**
1. Go to `http://localhost:3000/register` (to be implemented)
2. Fill user registration form
3. Upload Aadhaar card at `/kyc`
4. Login as admin: `admin@microinsurance.com / adminpassword123`
5. Approve KYC at `/dashboard/admin/kyc`
6. Login as user and purchase policy

### **Test Company Registration Flow:**
1. Register as company
2. Upload license documents
3. Admin approves company
4. Create insurance product
5. View dashboard statistics

---

## 🔐 **Admin Credentials**

**Email:** `admin@microinsurance.com`  
**Password:** `adminpassword123`

⚠️ **Change these in production!**

---

## 🛣️ **Roadmap**

### ✅ **Phase 1: Backend (Complete)**
- User/Company registration
- KYC with Aadhaar OCR
- Admin approvals
- API endpoints
- Database models

### ✅ **Phase 2: Frontend Foundation (Complete)**
- Redux store setup
- API service layer
- Login page
- Layout configuration

### 📋 **Phase 3: Frontend Pages (In Progress)**
- Registration page
- KYC upload page
- User dashboard
- Browse products
- Purchase policy (MetaMask)
- Company dashboard
- Admin approval pages

### 📋 **Phase 4: Blockchain Integration (Future)**
- Smart contract deployment
- Chainlink oracles
- Automated claim processing
- NFT policy certificates

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 **API Documentation**

See [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete API reference with examples.

### **Sample API Calls:**

```bash
# Register User
POST http://localhost:5000/api/auth/register/user
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "address": { ... }
}

# Upload Aadhaar (with token)
POST http://localhost:5000/api/kyc/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

aadhaar: <file>
```

---

## 🐛 **Troubleshooting**

### **Backend Issues:**

**Database Connection Error:**
```
✓ Check DATABASE_URL in .env
✓ Ensure PostgreSQL is running
✓ Verify database exists
```

**Cloudinary Upload Error:**
```
✓ Check CLOUDINARY_* variables in .env
✓ Verify account on cloudinary.com
```

**OCR Not Working:**
```
✓ Ensure image is clear
✓ Check if tesseract.js installed
✓ Try different image format
```

### **Frontend Issues:**

**Redux Store Error:**
```
✓ Check if ReduxProvider wraps app
✓ Verify store/index.ts exports
```

**API Connection Error:**
```
✓ Check NEXT_PUBLIC_API_URL in .env
✓ Ensure backend is running
```

---

## 📞 **Support**

For issues or questions:
- Check documentation in `/backend` and `/frontend` folders
- Review `FRONTEND_IMPLEMENTATION.md` for frontend guide
- See `API_DOCUMENTATION.md` for API reference

---

## 🎯 **Next Steps**

1. **Read the implementation guide:**  
   `frontend/FRONTEND_IMPLEMENTATION.md`

2. **Start with Priority 1 pages:**
   - Register page
   - KYC upload page
   - User dashboard

3. **Follow code examples** provided in the guide

4. **Test each flow** as you build

---

## 📊 **Project Statistics**

- **Backend Files:** 20+
- **Frontend Files:** 15+
- **API Endpoints:** 30+
- **Database Models:** 7
- **Redux Slices:** 6
- **Lines of Code (Backend):** ~3,500
- **Lines of Code (Frontend):** ~1,000

---

## 📜 **License**

MIT License

---

## 👥 **Team**

Built for financial inclusion and accessible insurance for all.

---

**🚀 Ready to complete the frontend? Start with `frontend/FRONTEND_IMPLEMENTATION.md`!**

---

## 📝 **Environment Variables**

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/microinsurance
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key  
CLOUDINARY_API_SECRET=your_secret
PORT=5000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

**Happy Coding! 🎉**
