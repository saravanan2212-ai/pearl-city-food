require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// SUPABASE
// =====================================================

if (!process.env.SUPABASE_URL) {
    console.error("❌ SUPABASE_URL is missing in .env");
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

// =====================================================
// MULTER
// Screenshot is kept in memory and uploaded to Supabase
// =====================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG and WEBP images are allowed")
            );
        }

        cb(null, true);
    },
});

// =====================================================
// HELPERS
// =====================================================

function generateBookingId() {
    const random = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `PCS-${Date.now().toString().slice(-6)}-${random}`;
}

function isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(String(phone || ""));
}

function isValidDate(date) {
    if (!date) return false;

    const parsed = new Date(date);

    return !Number.isNaN(parsed.getTime());
}

function parseItems(items) {
    try {
        if (typeof items === "string") {
            return JSON.parse(items);
        }

        return items;
    } catch (error) {
        return null;
    }
}

function sanitizeFileName(name) {
    return String(name || "payment")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .substring(0, 100);
}

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Pearl City Food backend is running 🚀",
        database: "Supabase",
        storage: "Supabase Storage",
    });
});

// =====================================================
// CREATE BOOKING
// POST /api/bookings
// =====================================================

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
            } = req.body;

            const items = parseItems(req.body.items);

            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!name || !String(name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required",
                });
            }

            if (!phone || !isValidPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid Indian 10-digit mobile number",
                });
            }

            if (!department || !String(department).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department is required",
                });
            }

            if (!year || !String(year).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Year is required",
                });
            }

            if (!date || !isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid booking date is required",
                });
            }

            if (!slot || !String(slot).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Pickup slot is required",
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one food item is required",
                });
            }

            if (!total || Number(total) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid total amount",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Payment screenshot is required",
                });
            }

            // -------------------------------------------------
            // GENERATE BOOKING ID
            // -------------------------------------------------

            const bookingId = generateBookingId();

            // -------------------------------------------------
            // UPLOAD PAYMENT SCREENSHOT TO SUPABASE STORAGE
            // -------------------------------------------------

            const extensionMap = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp",
            };

            const extension =
                extensionMap[req.file.mimetype] || "jpg";

            const fileName = `${bookingId}-${Date.now()}.${extension}`;

            const storagePath = `payments/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("payment-screenshots")
                .upload(storagePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                console.error(
                    "Supabase storage upload error:",
                    uploadError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to upload payment screenshot",
                });
            }

            // -------------------------------------------------
            // CREATE SIGNED URL
            // Bucket is PRIVATE
            // -------------------------------------------------

            const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                    .from("payment-screenshots")
                    .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

            if (signedUrlError) {
                console.error(
                    "Signed URL error:",
                    signedUrlError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to create screenshot URL",
                });
            }

            // -------------------------------------------------
            // INSERT BOOKING INTO SUPABASE DATABASE
            // -------------------------------------------------

            const booking = {
                booking_id: bookingId,

                name: String(name).trim(),

                phone: String(phone).trim(),

                department: String(department).trim(),

                year: String(year).trim(),

                email: email
                    ? String(email).trim()
                    : null,

                date: date,

                slot: String(slot).trim(),

                notes: notes
                    ? String(notes).trim()
                    : null,

                total: Number(total),

                items: items,

                screenshot: storagePath,

                payment_status: "Pending Verification",

                booking_status: "Pending",

                created_at: new Date().toISOString(),
            };

            const { data, error: insertError } = await supabase
                .from("bookings")
                .insert([booking])
                .select()
                .single();

            if (insertError) {
                console.error(
                    "Supabase database error:",
                    insertError
                );

                // If DB insert fails, try removing uploaded file
                await supabase.storage
                    .from("payment-screenshots")
                    .remove([storagePath]);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save booking",
                });
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            return res.status(201).json({
                success: true,

                message:
                    "Booking submitted successfully",

                bookingId: bookingId,

                booking: data,

                screenshotUrl:
                    signedUrlData?.signedUrl || null,
            });
        } catch (error) {
            console.error(
                "Create booking error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Something went wrong while creating booking",
            });
        }
    }
);

// =====================================================
// GET ALL BOOKINGS
// GET /api/bookings
// =====================================================

app.get("/api/bookings", async (req, res) => {
    try {
        const {
            data,
            error,
        } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(
                "Fetch bookings error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bookings",
            });
        }

        // -------------------------------------------------
        // CREATE FRESH SIGNED URL FOR EACH SCREENSHOT
        // -------------------------------------------------

        const bookingsWithScreenshots =
            await Promise.all(
                (data || []).map(async (booking) => {
                    let screenshotUrl = null;

                    if (booking.screenshot) {
                        const {
                            data: signedData,
                        } = await supabase.storage
                            .from("payment-screenshots")
                            .createSignedUrl(
                                booking.screenshot,
                                60 * 60
                            );

                        screenshotUrl =
                            signedData?.signedUrl || null;
                    }

                    return {
                        ...booking,
                        screenshotUrl,
                    };
                })
            );

        return res.json({
            success: true,
            bookings: bookingsWithScreenshots,
        });
    } catch (error) {
        console.error(
            "Get bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
});

// =====================================================
// GET SINGLE BOOKING
// GET /api/bookings/:bookingId
// =====================================================

app.get(
    "/api/bookings/:bookingId",
    async (req, res) => {
        try {
            const { bookingId } = req.params;

            const {
                data,
                error,
            } = await supabase
                .from("bookings")
                .select("*")
                .eq("booking_id", bookingId)
                .single();

            if (error || !data) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            let screenshotUrl = null;

            if (data.screenshot) {
                const {
                    data: signedData,
                } = await supabase.storage
                    .from("payment-screenshots")
                    .createSignedUrl(
                        data.screenshot,
                        60 * 60
                    );

                screenshotUrl =
                    signedData?.signedUrl || null;
            }

            return res.json({
                success: true,

                booking: {
                    ...data,
                    screenshotUrl,
                },
            });
        } catch (error) {
            console.error(
                "Get single booking error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch booking",
            });
        }
    }
);

// =====================================================
// UPDATE BOOKING STATUS
// PUT /api/bookings/:bookingId
// =====================================================

app.put(
    "/api/bookings/:bookingId",
    async (req, res) => {
        try {
            const { bookingId } = req.params;

            const {
                paymentStatus,
                bookingStatus,
            } = req.body;

            const updateData = {};

            if (paymentStatus !== undefined) {
                updateData.payment_status =
                    String(paymentStatus);
            }

            if (bookingStatus !== undefined) {
                updateData.booking_status =
                    String(bookingStatus);
            }

            if (
                Object.keys(updateData).length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "No status changes provided",
                });
            }

            const {
                data,
                error,
            } = await supabase
                .from("bookings")
                .update(updateData)
                .eq("booking_id", bookingId)
                .select()
                .single();

            if (error) {
                console.error(
                    "Update booking error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update booking",
                });
            }

            return res.json({
                success: true,

                message:
                    "Booking updated successfully",

                booking: data,
            });
        } catch (error) {
            console.error(
                "Update status error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to update booking",
            });
        }
    }
);

// =====================================================
// DELETE BOOKING
// DELETE /api/bookings/:bookingId
// =====================================================

app.delete(
    "/api/bookings/:bookingId",
    async (req, res) => {
        try {
            const { bookingId } = req.params;

            // First find booking
            const {
                data: booking,
                error: findError,
            } = await supabase
                .from("bookings")
                .select("screenshot")
                .eq("booking_id", bookingId)
                .single();

            if (findError || !booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            // Delete database record
            const {
                error: deleteError,
            } = await supabase
                .from("bookings")
                .delete()
                .eq("booking_id", bookingId);

            if (deleteError) {
                console.error(
                    "Delete booking error:",
                    deleteError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete booking",
                });
            }

            // Delete screenshot from storage
            if (booking.screenshot) {
                const {
                    error: storageDeleteError,
                } = await supabase.storage
                    .from("payment-screenshots")
                    .remove([booking.screenshot]);

                if (storageDeleteError) {
                    console.error(
                        "Storage delete warning:",
                        storageDeleteError
                    );
                }
            }

            return res.json({
                success: true,
                message:
                    "Booking deleted successfully",
            });
        } catch (error) {
            console.error(
                "Delete booking error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to delete booking",
            });
        }
    }
);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
    console.error(
        "Server error:",
        error
    );

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message:
                "Payment screenshot must be 5MB or smaller",
        });
    }

    return res.status(500).json({
        success: false,
        message:
            error.message ||
            "Internal server error",
    });
});

// =====================================================
// LOCAL SERVER
// =====================================================

if (require.main === module) {
    app.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `🚀 Pearl City Food backend running on port ${PORT}`
            );

            console.log(
                `📦 Supabase database connected`
            );

            console.log(
                `🖼️ Supabase storage connected`
            );
        }
    );
}

// =====================================================
// EXPORT FOR VERCEL
// =====================================================

module.exports = app;