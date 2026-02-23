const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

function generateCertificateId() {
    return "CHX-DSA-" + uuidv4().slice(0, 8).toUpperCase();
}

router.post("/generate", async (req, res) => {
    try {
        let { userId, name, progress } = req.body;

        if (progress < 75) {
            return res.status(400).json({ message: "Not eligible yet." });
        }

        // Find the user
        const user = await User.findOne({ uid: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let certificateId;
        let issuedAt;

        if (user.certificate && user.certificate.certificateId) {
            // User already has a certificate — reuse same ID, date, and name
            certificateId = user.certificate.certificateId;
            issuedAt = user.certificate.issuedAt;
            name = user.certificate.name; // Use the original name
        } else {
            // First time — generate new ID and save to user profile
            certificateId = generateCertificateId();
            issuedAt = new Date();

            await User.updateOne(
                { uid: userId },
                {
                    $set: {
                        certificate: {
                            certificateId,
                            name,
                            course: "DSA Coding Experience",
                            progress,
                            issuedAt
                        }
                    }
                }
            );
        }

        // Generate QR code
        const verifyUrl = `https://codehubx.in/verify/${certificateId}`;
        const qrImage = await QRCode.toDataURL(verifyUrl);

        // Read HTML template
        const htmlTemplate = fs.readFileSync(
            path.join(__dirname, "../templates/certificate.html"),
            "utf8"
        );

        // Convert images to base64 for reliable rendering in Puppeteer
        const logoPath = path.join(__dirname, "../../../public/logopng111.png");
        const signaturePath = path.join(__dirname, "../../../public/signature.png");

        let logoDataUri = "";
        if (fs.existsSync(logoPath)) {
            logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
        }

        let signatureDataUri = "";
        if (fs.existsSync(signaturePath)) {
            signatureDataUri = `data:image/png;base64,${fs.readFileSync(signaturePath).toString("base64")}`;
        }

        const finalHtml = htmlTemplate
            .replace(/{{NAME}}/g, name)
            .replace(/{{CERTIFICATE_ID}}/g, certificateId)
            .replace(/{{DATE}}/g, new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/{{QR_CODE}}/g, qrImage)
            .replace(/{{SIGNATURE_IMAGE}}/g, signatureDataUri)
            .replace(/{{LOGO_URL}}/g, logoDataUri);

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1123, height: 794 });
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // Generate PDF in-memory (no file saving)
        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();

        // Send PDF directly as response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${certificateId}.pdf"`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Certificate generation failed" });
    }
});

router.get("/verify/:certificateId", async (req, res) => {
    try {
        const user = await User.findOne({
            "certificate.certificateId": req.params.certificateId
        });

        if (!user || !user.certificate) {
            return res.json({ valid: false });
        }

        res.json({
            valid: true,
            name: user.certificate.name,
            course: user.certificate.course,
            issuedAt: user.certificate.issuedAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification check failed" });
    }
});

module.exports = router;
