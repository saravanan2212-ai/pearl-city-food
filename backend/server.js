const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:5177",
        ],
        methods: ["GET", "POST", "PUT"],
    })
);

app.use(express.json({ limit: "1mb" }));

/* =========================
   DIRECTORIES
========================= */

const uploadsDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
const bookingsFile = path.join(dataDir, "bookings.json");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, "[]", "utf8");
}

/* =========================
   SERVE UPLOADED IMAGES
========================= */

app.use("/uploads", express.static(uploadsDir));

/* =========================
   MULTER UPLOAD CONFIG
========================= */

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const uniqueName =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },

    fileFilter: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(extension)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP payment screenshots are allowed."
                )
            );
        }
    },
});

/* =========================
   HELPER FUNCTIONS
========================= */

function readBookings() {
    try {
        const data = fs.readFileSync(bookingsFile, "utf8");

        if (!data.trim()) {
            return [];
        }

        const bookings = JSON.parse(data);

        if (!Array.isArray(bookings)) {
            throw new Error("Bookings data is not an array.");
        }

        return bookings;
    } catch (error) {
        console.error("Read bookings error:", error);
        throw new Error("Unable to read booking data.");
    }
}

function saveBookings(bookings) {
    const tempFile = `${bookingsFile}.tmp`;

    fs.writeFileSync(
        tempFile,
        JSON.stringify(bookings, null, 2),
        "utf8"
    );

    fs.renameSync(tempFile, bookingsFile);
}

function generateBookingId() {
    let bookingId;

    do {
        bookingId =
            "PCF" +
            Date.now().toString().slice(-6) +
            crypto
                .randomBytes(2)
                .toString("hex")
                .toUpperCase();
    } while (readBookings().some((b) => b.bookingId === bookingId));

    return bookingId;
}

function isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

function isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return false;
    }

    return items.every((item) => {
        return (
            item &&
            typeof item.name === "string" &&
            typeof item.price !== "undefined" &&
            Number(item.price) >= 0 &&
            Number(item.quantity) > 0
        );
    });
}

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Pearl City Food Carnival Backend is running 🚀",
        status: "OK",
    });
});

/* =========================
   CREATE BOOKING
========================= */

app.post(
    "/api/bookings",
    upload.single("screenshot"),
    (req, res) => {
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

            /* ---------- REQUIRED FIELDS ---------- */

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required.",
                });
            }

            if (!phone || !isValidPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit Indian mobile number.",
                });
            }

            if (!department || !department.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department is required.",
                });
            }

            if (!year || !year.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Year is required.",
                });
            }

            if (!date || !isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid booking date.",
                });
            }

            if (!slot || !slot.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Pickup slot is required.",
                });
            }

            /* ---------- SCREENSHOT ---------- */

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Payment screenshot is required.",
                });
            }

            /* ---------- ITEMS ---------- */

            let parsedItems = [];

            try {
                parsedItems = items ? JSON.parse(items) : [];
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order items.",
                });
            }

            if (!isValidItems(parsedItems)) {
                return res.status(400).json({
                    success: false,
                    message: "Order must contain at least one valid item.",
                });
            }

            /* ---------- TOTAL ---------- */

            const numericTotal = Number(total);

            if (
                !Number.isFinite(numericTotal) ||
                numericTotal <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking total.",
                });
            }

            /* ---------- SAVE BOOKING ---------- */

            const bookings = readBookings();

            const bookingId = generateBookingId();

            const booking = {
                bookingId,

                name: name.trim(),

                phone: phone.trim(),

                department: department.trim(),

                year: year.trim(),

                email: email ? email.trim() : "",

                date: date.trim(),

                slot: slot.trim(),

                notes: notes ? notes.trim() : "",

                total: numericTotal,

                items: parsedItems,

                screenshot: `/uploads/${req.file.filename}`,

                paymentStatus: "Pending Verification",

                bookingStatus: "Pending",

                createdAt: new Date().toISOString(),
            };

            bookings.push(booking);

            saveBookings(bookings);

            console.log(
                `✅ New booking created: ${bookingId}`
            );

            return res.status(201).json({
                success: true,
                message: "Booking submitted successfully.",
                bookingId,
            });
        } catch (error) {
            console.error(
                "Create booking error:",
                error
            );

            /* Delete uploaded file if booking failed */

            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (deleteError) {
                    console.error(
                        "Failed to delete uploaded file:",
                        deleteError
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create booking.",
            });
        }
    }
);

/* =========================
   GET ALL BOOKINGS
========================= */

app.get("/api/bookings", (req, res) => {
    try {
        const bookings = readBookings();

        return res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        console.error(
            "Get bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load bookings.",
        });
    }
});

/* =========================
   UPDATE BOOKING
========================= */

app.put(
    "/api/bookings/:bookingId",
    (req, res) => {
        try {
            const { bookingId } = req.params;

            const {
                paymentStatus,
                bookingStatus,
            } = req.body;

            const allowedPaymentStatuses = [
                "Pending Verification",
                "Paid",
                "Rejected",
            ];

            const allowedBookingStatuses = [
                "Pending",
                "Confirmed",
                "Rejected",
            ];

            /* ---------- VALIDATE STATUS ---------- */

            if (
                paymentStatus &&
                !allowedPaymentStatuses.includes(paymentStatus)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment status.",
                });
            }

            if (
                bookingStatus &&
                !allowedBookingStatuses.includes(bookingStatus)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking status.",
                });
            }

            if (!paymentStatus && !bookingStatus) {
                return res.status(400).json({
                    success: false,
                    message: "No update data provided.",
                });
            }

            /* ---------- FIND BOOKING ---------- */

            const bookings = readBookings();

            const index = bookings.findIndex(
                (booking) =>
                    booking.bookingId === bookingId
            );

            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found.",
                });
            }

            /* ---------- UPDATE ---------- */

            if (paymentStatus) {
                bookings[index].paymentStatus =
                    paymentStatus;
            }

            if (bookingStatus) {
                bookings[index].bookingStatus =
                    bookingStatus;
            }

            bookings[index].updatedAt =
                new Date().toISOString();

            saveBookings(bookings);

            console.log(
                `🔄 Booking updated: ${bookingId}`
            );

            return res.json({
                success: true,
                message: "Booking updated successfully.",
                booking: bookings[index],
            });
        } catch (error) {
            console.error(
                "Update booking error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to update booking.",
            });
        }
    }
);

/* =========================
   404 ROUTE
========================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
    });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message:
                    "Payment screenshot must be smaller than 5MB.",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(400).json({
        success: false,
        message:
            err.message || "Something went wrong.",
    });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("🍴 Pearl City Food Carnival Backend");
    console.log("======================================");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("📁 Uploads: backend/uploads");
    console.log("🗄️ Data: backend/data/bookings.json");
    console.log("======================================");
    console.log("");
});