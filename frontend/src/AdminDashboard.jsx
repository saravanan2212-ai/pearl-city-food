import { useEffect, useState } from "react";
import {
    CheckCircle,
    XCircle,
    RefreshCw,
    Search,
    Eye,
    Clock,
    LogOut,
    X,
    CalendarDays,
    Phone,
    Mail,
    GraduationCap,
    IndianRupee,
    Utensils,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updating, setUpdating] = useState(false);

    const loadBookings = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/bookings`);
            const data = await response.json();

            if (data.success) {
                setBookings(data.bookings || []);
            } else {
                throw new Error(data.message || "Failed to load bookings");
            }
        } catch (error) {
            console.error("Load bookings error:", error);
            alert(
                "Backend server is not running.\nPlease start the backend using: node server.js"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const updateBooking = async (
        bookingId,
        paymentStatus,
        bookingStatus
    ) => {
        try {
            setUpdating(true);

            const response = await fetch(
                `${API_URL}/api/bookings/${bookingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        paymentStatus,
                        bookingStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update booking");
            }

            setBookings((prev) =>
                prev.map((booking) =>
                    booking.bookingId === bookingId ? data.booking : booking
                )
            );

            setSelectedBooking(null);

            alert("Booking updated successfully!");
        } catch (error) {
            console.error("Update booking error:", error);
            alert("Failed to update booking.");
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "/admin";
    };

    const filteredBookings = bookings.filter((booking) => {
        const value = search.toLowerCase().trim();

        if (!value) return true;

        return (
            booking.bookingId?.toLowerCase().includes(value) ||
            booking.name?.toLowerCase().includes(value) ||
            booking.phone?.includes(value) ||
            booking.department?.toLowerCase().includes(value)
        );
    });

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) =>
            booking.paymentStatus === "Pending Verification"
    ).length;

    const approvedBookings = bookings.filter(
        (booking) => booking.paymentStatus === "Paid"
    ).length;

    const rejectedBookings = bookings.filter(
        (booking) => booking.paymentStatus === "Rejected"
    ).length;

    const totalRevenue = bookings
        .filter((booking) => booking.paymentStatus === "Paid")
        .reduce(
            (sum, booking) => sum + Number(booking.total || 0),
            0
        );

    return (
        <div className="admin-dashboard">
            <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(6, 182, 212, 0.08),
              transparent 30%
            ),
            #f4f7fb;
          color: #111827;
          font-family: Inter, Arial, sans-serif;
        }

        .admin-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid #e5e7eb;
        }

        .admin-header-inner {
          max-width: 1400px;
          margin: auto;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: white;
          font-size: 23px;
        }

        .brand-title {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .header-button {
          border: none;
          border-radius: 10px;
          padding: 11px 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .refresh-button {
          background: #111827;
          color: white;
        }

        .refresh-button:hover {
          background: #1f2937;
          transform: translateY(-1px);
        }

        .logout-button {
          background: #fee2e2;
          color: #b91c1c;
        }

        .logout-button:hover {
          background: #fecaca;
        }

        .admin-container {
          max-width: 1400px;
          margin: auto;
          padding: 28px;
        }

        .welcome-section {
          margin-bottom: 24px;
        }

        .welcome-section h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
        }

        .welcome-section p {
          margin: 6px 0 0;
          color: #6b7280;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.05);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .icon-blue {
          background: #e0f2fe;
        }

        .icon-yellow {
          background: #fef3c7;
        }

        .icon-green {
          background: #dcfce7;
        }

        .icon-red {
          background: #fee2e2;
        }

        .stat-number {
          font-size: 29px;
          font-weight: 800;
          color: #111827;
        }

        .stat-label {
          margin-top: 4px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
        }

        .search-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #d1d5db;
          border-radius: 11px;
          padding: 12px 14px;
          background: #f9fafb;
        }

        .search-box:focus-within {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          background: transparent;
          font-size: 14px;
          color: #111827;
        }

        .bookings-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.05);
        }

        .bookings-header {
          padding: 20px 22px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bookings-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .booking-count {
          background: #f1f5f9;
          color: #475569;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .table-container {
          overflow-x: auto;
        }

        .booking-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .booking-table th {
          text-align: left;
          padding: 14px 16px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .booking-table td {
          padding: 16px;
          border-top: 1px solid #eef2f7;
          vertical-align: middle;
          font-size: 14px;
        }

        .booking-table tbody tr {
          transition: 0.15s ease;
        }

        .booking-table tbody tr:hover {
          background: #f8fafc;
        }

        .booking-id {
          font-weight: 800;
          color: #111827;
        }

        .customer-name {
          font-weight: 700;
          color: #111827;
        }

        .customer-meta {
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .pickup-date {
          font-weight: 700;
          color: #334155;
        }

        .pickup-slot {
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .price {
          font-weight: 800;
          color: #111827;
        }

        .view-button {
          border: none;
          background: #eff6ff;
          color: #2563eb;
          padding: 9px 12px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          cursor: pointer;
        }

        .view-button:hover {
          background: #dbeafe;
        }

        .empty-state,
        .loading-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .spinner {
          width: 25px;
          height: 25px;
          border: 3px solid #e5e7eb;
          border-top-color: #06b6d4;
          border-radius: 50%;
          margin: 0 auto 12px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .modal {
          width: 100%;
          max-width: 720px;
          max-height: 92vh;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .modal-title {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
        }

        .modal-subtitle {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .close-button {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .close-button:hover {
          background: #e2e8f0;
        }

        .modal-body {
          padding: 22px;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 22px;
        }

        .detail-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #111827;
        }

        .detail-title svg {
          color: #06b6d4;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .detail-item {
          background: #f8fafc;
          border-radius: 10px;
          padding: 11px 12px;
        }

        .detail-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 3px;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          word-break: break-word;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .order-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .order-item-price {
          font-weight: 800;
          white-space: nowrap;
        }

        .total-row {
          margin-top: 12px;
          padding: 14px;
          border-radius: 11px;
          background: #111827;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          font-size: 13px;
          color: #cbd5e1;
        }

        .total-price {
          font-size: 22px;
          font-weight: 800;
        }

        .payment-box {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 10px;
          background: #f8fafc;
        }

        .payment-image {
          width: 100%;
          max-height: 420px;
          object-fit: contain;
          border-radius: 10px;
          background: #020617;
        }

        .no-image {
          padding: 35px 15px;
          text-align: center;
          color: #64748b;
        }

        .modal-footer {
          padding: 15px 22px;
          border-top: 1px solid #e5e7eb;
          background: white;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          flex-shrink: 0;
        }

        .action-button {
          border: none;
          border-radius: 10px;
          padding: 12px 10px;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .approve {
          background: #16a34a;
        }

        .approve:hover:not(:disabled) {
          background: #15803d;
        }

        .reject {
          background: #dc2626;
        }

        .reject:hover:not(:disabled) {
          background: #b91c1c;
        }

        .pending {
          background: #64748b;
        }

        .pending:hover:not(:disabled) {
          background: #475569;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .admin-header-inner {
            padding: 15px;
            align-items: flex-start;
          }

          .brand-icon {
            width: 42px;
            height: 42px;
          }

          .brand-title {
            font-size: 19px;
          }

          .brand-subtitle {
            font-size: 11px;
          }

          .header-actions {
            gap: 6px;
          }

          .header-button span {
            display: none;
          }

          .header-button {
            width: 40px;
            height: 40px;
            justify-content: center;
            padding: 0;
          }

          .admin-container {
            padding: 18px 12px;
          }

          .welcome-section h2 {
            font-size: 22px;
          }

          .stats-grid {
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-number {
            font-size: 23px;
          }

          .stat-label {
            font-size: 11px;
          }

          .stat-icon {
            width: 35px;
            height: 35px;
            font-size: 16px;
          }

          .bookings-header {
            padding: 16px;
          }

          .modal-overlay {
            padding: 8px;
          }

          .modal {
            max-height: 96vh;
            border-radius: 16px;
          }

          .modal-header {
            padding: 15px;
          }

          .modal-body {
            padding: 15px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            padding: 12px;
            grid-template-columns: 1fr;
          }

          .payment-image {
            max-height: 330px;
          }
        }
      `}</style>

            {/* HEADER */}
            <header className="admin-header">
                <div className="admin-header-inner">
                    <div className="brand-area">
                        <div className="brand-icon">🍴</div>

                        <div>
                            <h1 className="brand-title">
                                Pearl City Admin
                            </h1>

                            <p className="brand-subtitle">
                                Food Carnival Booking Management
                            </p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            className="header-button refresh-button"
                            onClick={loadBookings}
                            disabled={loading}
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "spin-icon" : ""}
                            />
                            <span>Refresh</span>
                        </button>

                        <button
                            className="header-button logout-button"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="admin-container">
                <div className="welcome-section">
                    <h2>Dashboard Overview</h2>
                    <p>
                        Manage food carnival bookings and verify customer payments.
                    </p>
                </div>

                {/* STATS */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Bookings"
                        value={totalBookings}
                        icon={<Utensils size={20} />}
                        iconClass="icon-blue"
                    />

                    <StatCard
                        title="Pending Verification"
                        value={pendingBookings}
                        icon={<Clock size={20} />}
                        iconClass="icon-yellow"
                    />

                    <StatCard
                        title="Approved Payments"
                        value={approvedBookings}
                        icon={<CheckCircle size={20} />}
                        iconClass="icon-green"
                    />

                    <StatCard
                        title="Revenue"
                        value={`₹${totalRevenue}`}
                        icon={<IndianRupee size={20} />}
                        iconClass="icon-green"
                    />
                </div>

                {/* SEARCH */}
                <div className="search-card">
                    <div className="search-box">
                        <Search size={19} color="#64748b" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search booking ID, name, phone or department..."
                        />
                    </div>
                </div>

                {/* BOOKINGS */}
                <section className="bookings-card">
                    <div className="bookings-header">
                        <h2>Recent Bookings</h2>

                        <span className="booking-count">
                            {filteredBookings.length} bookings
                        </span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            Loading bookings...
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="empty-state">
                            <Utensils
                                size={40}
                                color="#94a3b8"
                                style={{ marginBottom: "10px" }}
                            />

                            <div>No bookings found.</div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="booking-table">
                                <thead>
                                    <tr>
                                        <th>Booking</th>
                                        <th>Customer</th>
                                        <th>Pickup</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.bookingId}>
                                            <td>
                                                <div className="booking-id">
                                                    {booking.bookingId}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-name">
                                                    {booking.name}
                                                </div>

                                                <div className="customer-meta">
                                                    {booking.department} • {booking.year}
                                                </div>

                                                <div className="customer-meta">
                                                    {booking.phone}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="pickup-date">
                                                    {booking.date}
                                                </div>

                                                <div className="pickup-slot">
                                                    {booking.slot}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="price">
                                                    ₹{booking.total}
                                                </div>
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={booking.paymentStatus}
                                                />
                                            </td>

                                            <td>
                                                <button
                                                    className="view-button"
                                                    onClick={() =>
                                                        setSelectedBooking(booking)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* BOOKING MODAL */}
            {selectedBooking && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedBooking(null);
                        }
                    }}
                >
                    <div className="modal">
                        {/* MODAL HEADER */}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">
                                    {selectedBooking.bookingId}
                                </h2>

                                <p className="modal-subtitle">
                                    Booking details & payment verification
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setSelectedBooking(null)}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="modal-body">
                            {/* CUSTOMER */}
                            <div className="detail-section">
                                <div className="detail-title">
                                    <GraduationCap size={17} />
                                    Customer Details
                                </div>

                                <div className="details-grid">
                                    <DetailItem
                                        label="Name"
                                        value={selectedBooking.name}
                                    />

                                    <DetailItem
                                        label="Phone"
                                        value={selectedBooking.phone}
                                        icon={<Phone size={13} />}
                                    />

                                    <DetailItem
                                        label="Department"
                                        value={selectedBooking.department}
                                    />

                                    <DetailItem
                                        label="Year"
                                        value={selectedBooking.year}
                                    />

                                    <DetailItem
                                        label="Email"
                                        value={
                                            selectedBooking.email || "Not provided"
                                        }
                                        icon={<Mail size={13} />}
                                    />
                                </div>
                            </div>

                            {/* PICKUP */}
                            <div className="detail-section">
                                <div className="detail-title">
                                    <CalendarDays size={17} />
                                    Pickup Details
                                </div>

                                <div className="details-grid">
                                    <DetailItem
                                        label="Date"
                                        value={selectedBooking.date}
                                    />

                                    <DetailItem
                                        label="Time Slot"
                                        value={selectedBooking.slot}
                                    />
                                </div>
                            </div>

                            {/* ORDER */}
                            <div className="detail-section">
                                <div className="detail-title">
                                    <Utensils size={17} />
                                    Order Details
                                </div>

                                {selectedBooking.items?.map((item, index) => (
                                    <div className="order-item" key={index}>
                                        <div className="order-item-name">
                                            {item.name} {item.variant}
                                            {" × "}
                                            {item.quantity}
                                        </div>

                                        <div className="order-item-price">
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}

                                <div className="total-row">
                                    <span className="total-label">
                                        Total Amount
                                    </span>

                                    <span className="total-price">
                                        ₹{selectedBooking.total}
                                    </span>
                                </div>
                            </div>

                            {/* PAYMENT SCREENSHOT */}
                            <div className="detail-section">
                                <div className="detail-title">
                                    <CheckCircle size={17} />
                                    Payment Screenshot
                                </div>

                                {selectedBooking.screenshot ? (
                                    <div className="payment-box">
                                        <img
                                            src={`${API_URL}${selectedBooking.screenshot}`}
                                            alt="Customer payment screenshot"
                                            className="payment-image"
                                        />
                                    </div>
                                ) : (
                                    <div className="payment-box">
                                        <div className="no-image">
                                            No payment screenshot uploaded.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="modal-footer">
                            <button
                                className="action-button approve"
                                disabled={updating}
                                onClick={() =>
                                    updateBooking(
                                        selectedBooking.bookingId,
                                        "Paid",
                                        "Confirmed"
                                    )
                                }
                            >
                                <CheckCircle size={17} />
                                Approve Payment
                            </button>

                            <button
                                className="action-button reject"
                                disabled={updating}
                                onClick={() =>
                                    updateBooking(
                                        selectedBooking.bookingId,
                                        "Rejected",
                                        "Rejected"
                                    )
                                }
                            >
                                <XCircle size={17} />
                                Reject Payment
                            </button>

                            <button
                                className="action-button pending"
                                disabled={updating}
                                onClick={() =>
                                    updateBooking(
                                        selectedBooking.bookingId,
                                        "Pending Verification",
                                        "Pending"
                                    )
                                }
                            >
                                <Clock size={17} />
                                Keep Pending
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
    title,
    value,
    icon,
    iconClass,
}) {
    return (
        <div className="stat-card">
            <div className="stat-top">
                <div className={`stat-icon ${iconClass}`}>
                    {icon}
                </div>
            </div>

            <div className="stat-number">{value}</div>

            <div className="stat-label">{title}</div>
        </div>
    );
}

/* =========================
   DETAIL ITEM
========================= */

function DetailItem({ label, value }) {
    return (
        <div className="detail-item">
            <div className="detail-label">{label}</div>

            <div className="detail-value">{value}</div>
        </div>
    );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {
    let background = "#fef3c7";
    let color = "#92400e";

    if (status === "Paid") {
        background = "#dcfce7";
        color = "#166534";
    }

    if (status === "Rejected") {
        background = "#fee2e2";
        color = "#991b1b";
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background,
                color,
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "800",
                whiteSpace: "nowrap",
            }}
        >
            {status === "Paid" && "✓ "}
            {status === "Rejected" && "✕ "}
            {status === "Pending Verification" && "⏳ "}
            {status}
        </span>
    );
}