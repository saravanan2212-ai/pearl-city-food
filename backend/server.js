require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ===============================
// SUPABASE
// ===============================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// MULTER
// ===============================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Pearl City Food backend is running 🚀",
        database: "Supabase",
        storage: "Supabase Storage",
    });
});

// ===============================
// CREATE BOOKING + SCREENSHOT
// ===============================

app.post(
    "/api/bookings",
    upload.single("screenshot"),
    async (req, res) => {
        try {
            const {
                name,
                phone,
                department,
                year,
                email,
                date,
                slot,
                notes,
                total,
                items,
            } = req.body;

            // Required fields
            if (
                !name ||
                !phone ||
                !department ||
                !year ||
                !date ||
                !slot
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields",
                });
            }

            // Phone validation
            if (!/^[6-9]\d{9}$/.test(String(phone))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Indian mobile number",
                });
            }

            // Screenshot required
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Payment screenshot is required",
                });
            }

            const bookingId =
                "PCS-" +
                Date.now().toString().slice(-6) +
                "-" +
                crypto.randomBytes(3).toString("hex").toUpperCase();

            // ===============================
            // UPLOAD SCREENSHOT
            // ===============================

            const extension =
                req.file.originalname.split(".").pop().toLowerCase();

            const fileName =
                `${bookingId}-${Date.now()}.${extension}`;

            const filePath = `bookings/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("payment-screenshots")
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                console.error(
                    "SCREENSHOT UPLOAD ERROR:",
                    uploadError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to upload payment screenshot",
                    error: uploadError.message,
                });
            }

            // ===============================
            // CREATE SIGNED URL
            // ===============================

            const { data: signedData, error: signedError } =
                await supabase.storage
                    .from("payment-screenshots")
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7);

            if (signedError) {
                console.error(
                    "SIGNED URL ERROR:",
                    signedError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to create screenshot URL",
                    error: signedError.message,
                });
            }

            // ===============================
            // BOOKING DATA
            // ===============================

            let parsedItems = [];

            try {
                parsedItems =
                    typeof items === "string"
                        ? JSON.parse(items)
                        : items || [];
            } catch {
                parsedItems = [];
            }

            const booking = {
                booking_id: bookingId,
                name: String(name).trim(),
                phone: String(phone).trim(),
                department: String(department).trim(),
                year: String(year).trim(),
                email: email
                    ? String(email).trim()
                    : null,
                date,
                slot: String(slot).trim(),
                notes: notes
                    ? String(notes).trim()
                    : null,
                total: Number(total) || 0,
                items: parsedItems,

                // Screenshot information
                screenshot: signedData.signedUrl,

                payment_status: "Pending",
                booking_status: "New",
                created_at: new Date().toISOString(),
            };

            // ===============================
            // SAVE TO SUPABASE
            // ===============================

            const { data, error } = await supabase
                .from("bookings")
                .insert([booking])
                .select()
                .single();

            if (error) {
                console.error(
                    "SUPABASE INSERT ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to save booking",
                    error: error.message,
                });
            }

            return res.status(201).json({
                success: true,
                message: "Order received successfully 🎉",
                bookingId,
                booking: data,
            });
        } catch (error) {
            console.error("BOOKING ERROR:", error);

            return res.status(500).json({
                success: false,
                message:
                    error.message || "Booking failed",
            });
        }
    }
);

// ===============================
// GET ALL BOOKINGS - ADMIN
// ===============================

app.get("/api/bookings", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error("FETCH ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bookings",
                error: error.message,
            });
        }

        res.json({
            success: true,
            bookings: data || [],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
});

// ===============================
// UPDATE ORDER STATUS
// ===============================

app.put("/api/bookings/:bookingId", async (req, res) => {
    try {
        const { bookingId } = req.params;

        const {
            bookingStatus,
            paymentStatus,
        } = req.body;

        const updateData = {};

        if (bookingStatus) {
            updateData.booking_status =
                bookingStatus;
        }

        if (paymentStatus) {
            updateData.payment_status =
                paymentStatus;
        }

        const { data, error } = await supabase
            .from("bookings")
            .update(updateData)
            .eq("booking_id", bookingId)
            .select()
            .single();

        if (error) {
            console.error("UPDATE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update order",
            });
        }

        res.json({
            success: true,
            booking: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Update failed",
        });
    }
});

// ===============================
// START LOCAL SERVER
// ===============================

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(
            `🚀 Server running on port ${PORT}`
        );
    });
}

module.exports = app;