# Micro Insurance Platform

A **blockchain-enabled parametric micro-insurance platform** with KYC verification, automated claims processing, and MetaMask integration.

---

## 🎯 **Project Overview**

This platform enables low-income users (farmers, laborers, fishermen) to purchase affordable micro-insurance policies with automated claim processing using blockchain oracles.

### **Key Features**
- **Blockchain Integration**: Secure transactions via ThirdWeb & MetaMask on Sepolia testnet.
- **Automated Claims**: Smart contract-based claim verification using blockchain oracles.
- **Verification**: Aadhaar-based KYC with OCR extraction.
- **Role-Based Access**: Specialized dashboards for Users, Companies, and Admins.

---

## 🏗️ **Technology Stack**

### **Blockchain & Web3**
- **ThirdWeb SDK**: For seamless wallet connection and smart contract interaction.
- **MetaMask**: Wallet provider for transactions.
- **Sepolia Testnet**: Deployment network for smart contracts.

### **Frontend**
- **Next.js 15 (App Router)**: Modern React framework for performance and SEO.
- **Redux Toolkit**: Centralized state management.
- **shadcn/ui + Tailwind CSS**: Premium, responsive UI components.
- **React Hook Form + Zod**: Robust form handling and validation.

### **Backend**
- **Node.js + Express**: Scalable REST API architecture.
- **PostgreSQL + Sequelize**: Relational database management.
- **Cloudinary**: Secure cloud storage for documents and images.
- **Tesseract.js**: OCR engine for extracting details from Aadhaar cards.

---

## 🚀 **Features by Role**

### **👤 User Features**
- **Easy Registration**: Simple sign-up process with email and phone.
- **KYC Verification**: Instant Aadhaar card verification using OCR technology.
- **Wallet Connection**: Connect MetaMask to purchase policies with crypto.
- **Browse Policies**: View available parametric insurance products.
- **Purchase & Track**: Buy policies and track active coverage and claims.

### **🏢 Company Features**
- **Company Registration**: Business onboarding with license verification.
- **Product Management**: Create and manage insurance products.
- **Analytics Dashboard**: Monitor active policies, total premiums, and customer data.
- **Document Management**: Secure upload and verification of business documents.

### **🛡️ Admin Features**
- **KYC Approval**: Review and approve/reject user KYC submissions.
- **Company Verification**: Validate company business licenses and details.
- **Platform Monitoring**: Overview of all platform statistics and activities.
- **Role Management**: Oversee all user and company interactions.

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js v18+
- PostgreSQL
- Cloudinary account
- MetaMask wallet

### **1. Clone Repository**
```bash
git clone https://github.com/Soohaam/Micro-Insurance.git
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

## 📁 **Project Structure**

```
Micro-Insurance/
├── backend/                      # Node.js + Express API
│   ├── config/                   # Configuration (Cloudinary, DB)
│   ├── controllers/              # Logic for Auth, KYC, Claims, etc.
│   ├── models/                   # Sequelize Models (User, Policy, Claim)
│   ├── routes/                   # API Endpoints
│   └── utils/                    # Helper functions (OCR, etc.)
│
├── frontend/                     # Next.js App
│   ├── src/
│   │   ├── app/                  # App Router Pages
│   │   ├── components/           # Reusable UI Components
│   │   ├── store/                # Redux State Management
│   │   └── services/             # API Service Integrations
```

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

## 📜 **License**

MIT License

---

## 👥 **Team**

Built for financial inclusion and accessible insurance for all.
