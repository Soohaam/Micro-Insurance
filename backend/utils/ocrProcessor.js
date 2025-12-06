const axios = require('axios');
const sharp = require('sharp');
const FormData = require('form-data'); // <-- FIX: Use Node FormData

const OCR_API_KEY = process.env.OCR_API_KEY;

/**
 * Extract text from image using OCR.Space API
 * @param {string} imageUrl - Cloudinary URL or local path
 * @returns {Promise<string>}
 */
async function extractTextFromImage(imageUrl) {
    try {
        let imageBuffer;

        // Download image if URL
        if (imageUrl.startsWith('http')) {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
        } else {
            imageBuffer = imageUrl; // Already buffer
        }

        // Enhance using sharp
        const processedImage = await sharp(imageBuffer)
            .grayscale()
            .normalize()
            .sharpen()
            .toBuffer();

        // Create form-data correctly
        const formData = new FormData();
        formData.append("file", processedImage, {
            filename: "aadhaar.jpg",
            contentType: "image/jpeg"
        });

        // Send request to OCR.Space
        const response = await axios.post(
            "https://api.ocr.space/parse/image",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    apikey: OCR_API_KEY
                },
                maxBodyLength: Infinity
            }
        );

        const parsed = response.data;

        if (!parsed.ParsedResults || !parsed.ParsedResults[0]) {
            throw new Error("OCR API did not return valid results");
        }

        return parsed.ParsedResults[0].ParsedText;

    } catch (error) {
        console.error("OCR Error:", error.message);
        throw new Error("Failed to extract text from image using OCR API");
    }
}

/**
 * Extract Aadhaar details from OCR text
 */
function extractAadhaarDetails(text) {
    const details = {
        aadhaarNumber: null,
        name: null,
        dob: null,
        gender: null,
    };

    // Normalize text
    const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    // Extract Aadhaar number
    const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
    const aadhaarMatch = cleanText.match(aadhaarRegex);
    if (aadhaarMatch) {
        details.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '');
    }

    // Try exact Aadhaar number lines and skip them
    const numericLineRegex = /^\d{4}\s?\d{4}\s?\d{4}$/;

    // Keywords to avoid in name
    const invalidNameKeywords = ["male", "female", "dob", "birth", "government"];

    // Extract name → first line that is NOT:
    // - Aadhaar number
    // - Contains digits
    // - Contains gender/DOB keywords
    for (let line of lines) {
        const lower = line.toLowerCase();

        if (numericLineRegex.test(line)) continue; // skip Aadhaar number

        if (/\d/.test(line)) continue; // skip numeric lines (DOB)

        if (invalidNameKeywords.some(k => lower.includes(k))) continue;

        // Accept first valid line as name
        details.name = line;
        break;
    }

    // DOB
    const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
    const dobMatch = cleanText.match(dobRegex);
    if (dobMatch) {
        details.dob = dobMatch[1];
    }

    // Gender
    const genderRegex = /(Male|Female|MALE|FEMALE|M|F)/;
    const genderMatch = text.match(genderRegex);
    if (genderMatch) {
        const g = genderMatch[1].toLowerCase();
        details.gender = g.includes("f") ? "Female" : "Male";
    }

    return details;
}


/**
 * Process Aadhaar card OCR + extraction
 */
async function processAadhaarCard(imageUrl) {
    try {
        console.log("Processing Aadhaar card image…");

        const text = await extractTextFromImage(imageUrl);
        console.log("OCR Text:", text);

        const details = extractAadhaarDetails(text);
        console.log("Extracted Details:", details);

        if (!details.aadhaarNumber || details.aadhaarNumber.length !== 12) {
            throw new Error("Could not extract valid Aadhaar number");
        }

        if (!details.name) {
            throw new Error("Could not extract name");
        }

        return {
            success: true,
            data: details,
            rawText: text,
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

module.exports = {
    extractTextFromImage,
    extractAadhaarDetails,
    processAadhaarCard,
};
