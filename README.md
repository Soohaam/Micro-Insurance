# 🛡️ Micro Insurance Platform

> **A blockchain-enabled parametric micro-insurance platform** with automated KYC verification, smart contract-based claims processing, and Web3 wallet integration.

---

## 🌟 **Live Demo**

- **Application**: [https://micro-insurance-z3l3.vercel.app](https://micro-insurance-z3l3.vercel.app)
- **Blockchain Network**: Sepolia Testnet

---

## 🎯 **Project Overview**

The **Micro Insurance Platform** is a decentralized application (DApp) designed to bridge the financial gap for low-income households. By leveraging blockchain technology, we enable farmers, laborers, and gig workers to access affordable, parametric insurance policies that pay out instantly without bureaucratic hurdles.

Our mission is to provide **transparent, tamper-proof, and accessible** coverage for the unbanked, ensuring financial resilience against climate risks and economic uncertainties.

### **✨ Key Highlights**

- 🔗 **Blockchain & Web3 Integration**: Built on **Sepolia Testnet** using **ThirdWeb** and **MetaMask**
- ⚡ **Automated Parametric Claims**: Smart contracts trigger instant payouts based on oracle data
- 🆔 **Instant KYC Verification**: OCR technology (Tesseract.js) for Aadhaar card verification
- 👥 **Multi-Role Architecture**: Separate portals for Users, Companies, and Admins
- 🔐 **Secure & Transparent**: All transactions recorded on blockchain
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## 🏗️ **Technology Stack**

### **Blockchain & Web3**
- **ThirdWeb SDK v5**: Seamless wallet connection and smart contract interaction
- **MetaMask**: Primary wallet provider for transactions
- **Sepolia Testnet**: Ethereum test network for smart contract deployment
- **Solidity**: Smart contract development

### **Frontend**
- **Next.js 16**: React framework with App Router for optimal performance
- **Redux Toolkit**: Centralized state management
- **shadcn/ui + Tailwind CSS**: Modern, accessible UI components
- **React Hook Form + Zod**: Type-safe form validation
- **Framer Motion**: Smooth animations and transitions
- **Axios**: HTTP client for API requests

### **Backend**
- **Node.js + Express**: RESTful API architecture
- **PostgreSQL + Sequelize**: Relational database with ORM
- **JWT**: Secure authentication and authorization
- **Cloudinary**: Cloud storage for documents and images
- **Tesseract.js**: OCR engine for document verification
- **bcrypt**: Password hashing

### **DevOps**
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **Git & GitHub**: Version control and collaboration

---

## 🚀 **Features by Role**

### **👤 User Features**
- ✅ **Easy Registration**: Simple sign-up with email and password
- ✅ **KYC Verification**: Upload Aadhaar card for instant OCR-based verification
- ✅ **Wallet Connection**: Connect MetaMask to purchase policies
- ✅ **Browse Products**: View available parametric insurance policies
- ✅ **Purchase Policies**: Buy insurance using cryptocurrency (ETH)
- ✅ **Track Coverage**: Monitor active policies and coverage details
- ✅ **Claims Dashboard**: View automated claim payouts and transaction history
- ✅ **Profile Management**: Update personal details and wallet address

### **🏢 Company Features**
- ✅ **Company Registration**: Business onboarding with license verification
- ✅ **Product Creation**: Design and publish insurance products
- ✅ **Product Management**: Edit, activate, or deactivate policies
- ✅ **Analytics Dashboard**: Real-time metrics on policies, premiums, and customers
- ✅ **Policy Monitoring**: Track all issued policies and their status
- ✅ **Document Management**: Secure upload and storage of business documents
- ✅ **Wallet Integration**: Set payout wallet address for claims

### **🛡️ Admin Features**
- ✅ **KYC Approval**: Review and approve/reject user KYC submissions
- ✅ **Company Verification**: Validate company licenses and business details
- ✅ **Product Approval**: Review and approve insurance products
- ✅ **Platform Monitoring**: Overview of all users, companies, and policies
- ✅ **User Management**: Activate/deactivate user accounts
- ✅ **Analytics**: Platform-wide statistics and insights

---

## 🎬 **Getting Started**

### **Prerequisites**
- Node.js v18 or higher
- PostgreSQL database
- Cloudinary account (for image storage)
- ThirdWeb account (for Web3 integration)
- MetaMask wallet extension

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
```

**Edit `.env` with your credentials:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/microinsurance
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OCR_API_KEY=your_ocr_api_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Start the backend server:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

**Seed admin user (optional):**
```bash
npm run seed:admin
```

### **3. Frontend Setup**

```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env.local
```

**Edit `.env.local` with your configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CHAIN_ID=11155111
```

**Start the frontend development server:**
```bash
npm run dev
# App runs on http://localhost:3000
```

---

## 📁 **Project Structure**

```
Micro-Insurance/
├── backend/                      # Node.js + Express API
│   ├── config/                   # Database & Cloudinary configuration
│   ├── controllers/              # Business logic (Auth, KYC, Products, etc.)
│   ├── models/                   # Sequelize models (User, Company, Policy, etc.)
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Authentication & authorization
│   ├── utils/                    # Helper functions (OCR, file upload)
│   └── index.js                  # Server entry point
│
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── app/                  # App Router pages & layouts
│   │   │   ├── dashboard/        # Role-based dashboards
│   │   │   ├── products/         # Product browsing & purchase
│   │   │   ├── kyc/              # KYC verification flow
│   │   │   └── login/            # Authentication pages
│   │   ├── components/           # Reusable UI components
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── store/                # Redux state management
│   │   │   └── slices/           # Redux slices (auth, kyc, etc.)
│   │   ├── services/             # API service layer
│   │   └── lib/                  # Utility functions
│   └── public/                   # Static assets
│
├── contracts/                    # Smart contracts (Solidity)
│   └── PolicyRegistry.sol        # Main insurance policy contract
│
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

---

## 🔐 **Security Features**

- 🔒 **JWT Authentication**: Secure token-based authentication
- 🔑 **Password Hashing**: bcrypt for secure password storage
- 🛡️ **Role-Based Access Control**: Separate permissions for users, companies, and admins
- 🌐 **CORS Protection**: Configured to allow only trusted origins
- 📝 **Input Validation**: Comprehensive validation on all API endpoints
- 🔗 **Blockchain Security**: Immutable transaction records on Ethereum

---

## 📊 **API Documentation**

### **Base URL**
- **Local**: `http://localhost:5000/api`

### **Main Endpoints**

#### **Authentication**
- `POST /auth/register` - User/Company registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/wallet` - Update wallet address

#### **KYC**
- `POST /kyc/upload-aadhaar` - Upload Aadhaar for verification
- `GET /kyc/status` - Get KYC status

#### **Products**
- `GET /user/products` - Browse available products
- `GET /user/products/:id` - Get product details
- `POST /company/products` - Create new product (Company only)

#### **Policies**
- `GET /user/policies` - Get user's policies
- `POST /purchases` - Purchase a policy

#### **Admin**
- `GET /admin/users` - Get all users
- `GET /admin/companies` - Get all companies
- `PUT /admin/kyc/:id/approve` - Approve KYC

---

## 🧪 **Testing**

### **Test Credentials**

**Admin:**
- Email: `admin@microinsurance.com`
- Password: `adminpassword123`

**Note**: Create test users and companies through the registration flow.

### **Test Wallet**
- Use MetaMask with Sepolia testnet
- Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **ThirdWeb** for Web3 infrastructure
- **shadcn/ui** for beautiful UI components
- **Vercel** for frontend hosting
- **Render** for backend hosting
- **Cloudinary** for image storage

---

## 📧 **Contact & Support**

For questions, issues, or suggestions:
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/Soohaam/Micro-Insurance/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Soohaam/Micro-Insurance/discussions)

---

## 🎯 **Roadmap**

- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Polygon, BSC)
- [ ] AI-powered risk assessment
- [ ] Integration with more oracle providers
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

<div align="center">

**Built with ❤️ for financial inclusion and accessible insurance for everyone**

⭐ **Star this repo if you find it helpful!** ⭐

</div>
