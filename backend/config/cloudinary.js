const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for KYC documents
const kycStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'micro-insurance/kyc',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

// Storage configuration for company documents
const companyStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'micro-insurance/company-documents',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
});

// Multer upload instances
const uploadKYC = multer({
    storage: kycStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
        }
    },
});

const uploadCompanyDocs = multer({
    storage: companyStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
        }
    },
});

// Export multer instances and cloudinary
module.exports = {
    cloudinary,
    uploadKYC,
    uploadCompanyDocs,
};
