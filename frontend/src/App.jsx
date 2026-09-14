import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Upload,
  Clock,
  CreditCard,
  X,
  Menu as MenuIcon,
  Lock,
  LogOut,
  Eye,
  Check,
  XCircle,
  ClipboardList,
  IndianRupee,
} from "lucide-react";
import "./App.css";


const specialOfferStyles = `
.special-offer-card {
  position: relative;
  overflow: hidden;
  border: 2px solid #f59e0b !important;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.22), 0 0 0 1px rgba(245, 158, 11, 0.12);
  transform: translateY(-2px);
}

.special-offer-ribbon {
  position: absolute;
  top: 12px;
  right: -38px;
  z-index: 5;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.6px;
  padding: 7px 42px;
  transform: rotate(45deg);
  box-shadow: 0 5px 12px rgba(0,0,0,0.18);
}

.special-offer-tag {
  background: linear-gradient(135deg, #f59e0b, #ef4444) !important;
  color: #fff !important;
}

.special-offer-subtitle {
  font-weight: 800 !important;
  color: #d97706 !important;
}

.special-offer-price {
  font-size: 1.35rem !important;
  color: #ea580c !important;
}
`;

function SpecialOfferStyles() {
  return <style>{specialOfferStyles}</style>;
}

const ADMIN_USERNAME = "PEARLCITY";
const ADMIN_PASSWORD = "ECE";

const MENU = [
  {
    id: 1,
    name: "Thoothukudi Poricha Parotta",
    subtitle: "1 Piece",
    price: 20,
    emoji: "🫓",
  },
  {
    id: 2,
    name: "Thoothukudi Poricha Parotta",
    subtitle: "3 Pieces",
    price: 50,
    emoji: "🫓",
  },
  {
    id: 3,
    name: "Omlet",
    subtitle: "Fresh Egg Omlet",
    price: 20,
    emoji: "🥚",
  },
  {
    id: 4,
    name: "Chicken Chukka",
    subtitle: "Spicy & Delicious",
    price: 80,
    emoji: "🍗",
  },
  {
    id: 5,
    name: "Ice Cream with Gulab Jamun",
    subtitle: "Sweet Combo",
    price: 50,
    emoji: "🍨",
  },
];

const SLOTS = [
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
];

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div className="input-group">
      <label>
        {label} {required && <span>*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

function App() {
  <SpecialOfferStyles />;
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    year: "",
    email: "",
    slot: "",
    notes: "",
  });

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState("");
  const [bookingId, setBookingId] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const totalItems = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    const savedOrders = localStorage.getItem(
      "pearlCityOrders"
    );

    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(
          parsedOrders.map((order) => {
            if (!order.customer) return order;
            const { date, ...customerWithoutDate } = order.customer;
            return {
              ...order,
              customer: customerWithoutDate,
            };
          })
        );
      } catch {
        setOrders([]);
      }
    }

    const loggedIn = sessionStorage.getItem(
      "pearlCityAdmin"
    );

    if (loggedIn === "true") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "pearlCityOrders",
      JSON.stringify(orders)
    );
  }, [orders]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(
        (x) => x.id === item.id
      );

      if (existing) {
        return prev.map((x) =>
          x.id === item.id
            ? {
              ...x,
              quantity: x.quantity + 1,
            }
            : x
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity: item.quantity + 1,
          }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
              ...item,
              quantity: item.quantity - 1,
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Screenshot must be below 5MB.");
      return;
    }

    setPaymentScreenshot(file);

    const reader = new FileReader();

    reader.onload = () => {
      setPaymentPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const validateBooking = () => {
    if (cart.length === 0) {
      alert("Please add food items first.");
      return false;
    }

    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert("Enter a valid 10-digit Indian mobile number.");
      return false;
    }

    if (!formData.department.trim()) {
      alert("Please enter your department.");
      return false;
    }

    if (!formData.year) {
      alert("Please select your year.");
      return false;
    }

    if (!formData.slot) {
      alert("Please select pickup slot.");
      return false;
    }

    if (!paymentPreview) {
      alert("Please upload payment screenshot.");
      return false;
    }

    return true;
  };

  const confirmBooking = () => {
    if (!validateBooking()) return;

    const id =
      "PCS-" +
      Date.now().toString().slice(-6);

    const order = {
      id,
      customer: {
        ...formData,
      },
      items: cart,
      total: totalPrice,
      screenshot: paymentPreview,
      paymentStatus: "Pending",
      orderStatus: "New",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [order, ...prev]);
    setBookingId(id);
    setPage("success");
  };

  const adminLogin = (e) => {
    e.preventDefault();

    if (
      adminUsername === ADMIN_USERNAME &&
      adminPassword === ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
      setAdminError("");

      sessionStorage.setItem(
        "pearlCityAdmin",
        "true"
      );

      setAdminUsername("");
      setAdminPassword("");

      setPage("admin");
    } else {
      setAdminError(
        "Invalid username or password."
      );
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(
      "pearlCityAdmin"
    );
    setPage("home");
  };

  const updateOrder = (id, changes) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
            ...order,
            ...changes,
          }
          : order
      )
    );

    setSelectedOrder((prev) =>
      prev
        ? {
          ...prev,
          ...changes,
        }
        : null
    );
  };

  const resetOrder = () => {
    setCart([]);
    setPaymentScreenshot(null);
    setPaymentPreview("");
    setBookingId("");

    setFormData({
      name: "",
      phone: "",
      department: "",
      year: "",
      email: "",
      slot: "",
      notes: "",
    });

    setPage("home");
  };

  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === "Pending"
  );

  const approvedOrders = orders.filter(
    (o) => o.paymentStatus === "Approved"
  );

  const rejectedOrders = orders.filter(
    (o) => o.paymentStatus === "Rejected"
  );

  /* ================= ADMIN LOGIN ================= */

  if (page === "adminLogin") {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-lock">
            <Lock size={30} />
          </div>

          <span className="eyebrow">
            STAFF ACCESS
          </span>

          <h1>Admin Login</h1>

          <p>
            Login to manage Pearl City food orders.
          </p>

          <form onSubmit={adminLogin}>
            <Input
              label="Username"
              value={adminUsername}
              onChange={setAdminUsername}
              placeholder="Enter username"
            />

            <Input
              label="Password"
              type="password"
              value={adminPassword}
              onChange={setAdminPassword}
              placeholder="Enter password"
            />

            {adminError && (
              <div className="error-box">
                {adminError}
              </div>
            )}

            <button
              className="primary-button full"
              type="submit"
            >
              <Lock size={18} />
              Login to Dashboard
            </button>
          </form>

          <button
            className="text-button"
            onClick={() => setPage("home")}
          >
            ← Back to Website
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN DASHBOARD ================= */

  if (page === "admin") {
    if (!isAdmin) {
      setPage("adminLogin");
      return null;
    }

    return (
      <div className="admin-page">
        <header className="admin-navbar">
          <div>
            <span className="eyebrow">
              PEARL CITY
            </span>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-nav-actions">
            <button
              className="secondary-button"
              onClick={() => setPage("home")}
            >
              View Website
            </button>

            <button
              className="logout-button"
              onClick={adminLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <main className="admin-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <ClipboardList />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <Clock />
              </div>

              <div>
                <span>Pending</span>
                <strong>
                  {pendingOrders.length}
                </strong>
              </div>
            </div>

            <div className="stat-card approved">
              <div className="stat-icon">
                <Check />
              </div>

              <div>
                <span>Approved</span>
                <strong>
                  {approvedOrders.length}
                </strong>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">
                <XCircle />
              </div>

              <div>
                <span>Rejected</span>
                <strong>
                  {rejectedOrders.length}
                </strong>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-title">
              <div>
                <span className="eyebrow">
                  ORDER MANAGEMENT
                </span>

                <h2>Customer Orders</h2>
              </div>

              <span className="order-count">
                {orders.length} Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={50} />
                <h3>No orders yet</h3>
                <p>
                  Customer bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th>Pickup Slot</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Order</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="booking-code">
                            {order.id}
                          </strong>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <strong>
                              {order.customer.name}
                            </strong>

                            <span>
                              {order.customer.phone}
                            </span>

                            <small>
                              {order.customer.department} •{" "}
                              {order.customer.year}
                            </small>
                          </div>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <strong>
                              {order.customer.slot}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <strong>
                            ₹{order.total}
                          </strong>
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              order.paymentStatus
                            }
                          />
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              order.orderStatus
                            }
                          />
                        </td>

                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              setSelectedOrder(order)
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
          </div>
        </main>

        {selectedOrder && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setSelectedOrder(null)
            }
          >
            <div
              className="order-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <span className="eyebrow">
                    ORDER DETAILS
                  </span>

                  <h2>
                    {selectedOrder.id}
                  </h2>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                >
                  <X />
                </button>
              </div>

              <div className="order-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedOrder.customer.name}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedOrder.customer.phone}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {selectedOrder.customer.department}
                  </strong>
                </div>

                <div>
                  <span>Year</span>
                  <strong>
                    {selectedOrder.customer.year}
                  </strong>
                </div>

                <div>
                  <span>Pickup Slot</span>
                  <strong>
                    {selectedOrder.customer.slot}
                  </strong>
                </div>
              </div>

              <div className="modal-block">
                <h3>🍴 Food Items</h3>

                {selectedOrder.items.map(
                  (item) => (
                    <div
                      className="modal-item"
                      key={item.id}
                    >
                      <span>
                        {item.emoji}{" "}
                        {item.name}
                        <small>
                          {" "}
                          × {item.quantity}
                        </small>
                      </span>

                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>
                    </div>
                  )
                )}

                <div className="modal-total">
                  <span>Total</span>
                  <strong>
                    ₹{selectedOrder.total}
                  </strong>
                </div>
              </div>

              <div className="modal-block">
                <h3>📸 Payment Screenshot</h3>

                {selectedOrder.screenshot ? (
                  <img
                    className="payment-image"
                    src={
                      selectedOrder.screenshot
                    }
                    alt="Payment screenshot"
                  />
                ) : (
                  <p className="muted">
                    No screenshot.
                  </p>
                )}
              </div>

              {selectedOrder.customer.notes && (
                <div className="notes-box">
                  <strong>📝 Notes</strong>
                  <p>
                    {selectedOrder.customer.notes}
                  </p>
                </div>
              )}

              <div className="admin-actions">
                <button
                  className="approve-button"
                  onClick={() =>
                    updateOrder(
                      selectedOrder.id,
                      {
                        paymentStatus:
                          "Approved",
                        orderStatus:
                          "Confirmed",
                      }
                    )
                  }
                >
                  <Check size={18} />
                  Approve Payment
                </button>

                <button
                  className="reject-button"
                  onClick={() =>
                    updateOrder(
                      selectedOrder.id,
                      {
                        paymentStatus:
                          "Rejected",
                        orderStatus:
                          "Rejected",
                      }
                    )
                  }
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= CUSTOMER WEBSITE ================= */

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-inner">
          <button
            className="brand"
            onClick={() => setPage("home")}
          >
            <div className="brand-icon">
              🍽️
            </div>

            <div>
              <h1>Pearl City</h1>
              <span>Parotta Stall</span>
            </div>
          </button>

          <nav
            className={
              menuOpen
                ? "nav-links open"
                : "nav-links"
            }
          >
            <button
              onClick={() => {
                setPage("home");
                setMenuOpen(false);
              }}
            >
              Home
            </button>

            <button
              onClick={() => {
                setPage("menu");
                setMenuOpen(false);
              }}
            >
              Menu
            </button>

            <button
              onClick={() => {
                setPage("booking");
                setMenuOpen(false);
              }}
            >
              Pre-Book
            </button>

            <button
              className="admin-nav-link"
              onClick={() => {
                setPage(
                  isAdmin ? "admin" : "adminLogin"
                );
                setMenuOpen(false);
              }}
            >
              <Lock size={14} />
              Admin
            </button>
          </nav>

          <button
            className="cart-button"
            onClick={() => setPage("cart")}
          >
            <ShoppingCart size={20} />
            <span>Cart</span>

            {totalItems > 0 && (
              <b>{totalItems}</b>
            )}
          </button>

          <button
            className="mobile-menu"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* HOME */}

      {page === "home" && (
        <main>
          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge">
                🔥 Food Carnival Special
              </div>

              <h2>
                Taste the Real
                <span> Thoothukudi Flavour!</span>
              </h2>

              <p>
                Authentic South Indian food made
                fresh for our college Food
                Carnival.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-button"
                  onClick={() =>
                    setPage("menu")
                  }
                >
                  Explore Menu
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setPage("booking")
                  }
                >
                  Pre-Book Now
                </button>
              </div>

              <div className="hero-features">
                <div>
                  <span>⚡</span>
                  <p>Quick Pickup</p>
                </div>

                <div>
                  <span>💳</span>
                  <p>Easy UPI</p>
                </div>

                <div>
                  <span>📸</span>
                  <p>Payment Proof</p>
                </div>
              </div>
            </div>

            <div className="hero-food">
              <div className="food-circle">
                🫓
              </div>

              <div className="floating-food food-one">
                🍗
              </div>

              <div className="floating-food food-two">
                🍨
              </div>

              <div className="floating-food food-three">
                🥚
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  OUR SPECIALS
                </span>
                <h2>Today's Favorites</h2>
              </div>

              <button
                className="view-all"
                onClick={() =>
                  setPage("menu")
                }
              >
                View Full Menu →
              </button>
            </div>

            <div className="food-grid">
              {MENU.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onAdd={() =>
                    addToCart(item)
                  }
                />
              ))}
            </div>
          </section>
        </main>
      )}

      {/* MENU */}

      {page === "menu" && (
        <main className="page-container">
          <PageHeader
            title="Our Menu"
            eyebrow="FOOD CARNIVAL"
            subtitle="Choose your favourite food and add it to your cart."
            onBack={() => setPage("home")}
          />

          <div className="food-grid large">
            {MENU.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onAdd={() =>
                  addToCart(item)
                }
              />
            ))}
          </div>
        </main>
      )}

      {/* CART */}

      {page === "cart" && (
        <main className="page-container">
          <PageHeader
            title="Shopping Cart"
            eyebrow="YOUR ORDER"
            onBack={() => setPage("menu")}
          />

          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                🛒
              </div>

              <h3>Your cart is empty</h3>

              <p>
                Add some delicious food to continue.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setPage("menu")
                }
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-food-icon">
                      {item.emoji}
                    </div>

                    <div className="cart-info">
                      <h3>{item.name}</h3>
                      <p>{item.subtitle}</p>
                      <strong>
                        ₹{item.price}
                      </strong>
                    </div>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        <Minus size={15} />
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <strong className="cart-total">
                      ₹
                      {item.price *
                        item.quantity}
                    </strong>

                    <button
                      className="delete-button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>
                    ₹{totalPrice}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>Total</span>
                  <strong>
                    ₹{totalPrice}
                  </strong>
                </div>

                <button
                  className="primary-button full"
                  onClick={() =>
                    setPage("booking")
                  }
                >
                  Continue Booking
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* BOOKING */}

      {page === "booking" && (
        <main className="page-container">
          <PageHeader
            title="Booking Details"
            eyebrow="STEP 1 OF 2"
            subtitle="Enter your details and choose your pickup time."
            onBack={() => setPage("cart")}
          />

          <div className="booking-layout">
            <div className="booking-form card">
              <h3>👤 Customer Details</h3>

              <div className="form-grid">
                <Input
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(v) =>
                    updateForm(
                      "name",
                      v
                    )
                  }
                  placeholder="Enter your name"
                />

                <Input
                  label="Phone Number"
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(v) =>
                    updateForm(
                      "phone",
                      v
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile number"
                />

                <Input
                  label="Department"
                  required
                  value={
                    formData.department
                  }
                  onChange={(v) =>
                    updateForm(
                      "department",
                      v
                    )
                  }
                  placeholder="Eg: ECE"
                />

                <div className="input-group">
                  <label>
                    Year <span>*</span>
                  </label>

                  <select
                    value={formData.year}
                    onChange={(e) =>
                      updateForm(
                        "year",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Year
                    </option>
                    <option>
                      1st Year
                    </option>
                    <option>
                      2nd Year
                    </option>
                    <option>
                      3rd Year
                    </option>
                    <option>
                      4th Year
                    </option>
                  </select>
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={
                    formData.email
                  }
                  onChange={(v) =>
                    updateForm(
                      "email",
                      v
                    )
                  }
                  placeholder="Optional"
                />
              </div>

              <h3 className="form-section-title">
                📅 Pickup Details
              </h3>

              <div className="input-group">
                <label>
                  Pickup Slot <span>*</span>
                </label>

                <div className="slot-grid">
                  {SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      className={
                        formData.slot ===
                          slot
                          ? "slot active"
                          : "slot"
                      }
                      onClick={() =>
                        updateForm(
                          "slot",
                          slot
                        )
                      }
                    >
                      <Clock size={14} />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Notes</label>

                <textarea
                  rows="3"
                  value={
                    formData.notes
                  }
                  onChange={(e) =>
                    updateForm(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Any special request? Optional"
                />
              </div>

              <button
                className="primary-button full"
                onClick={() =>
                  setPage("payment")
                }
              >
                Continue to Payment →
              </button>
            </div>

            <div className="summary-card">
              <h3>Booking Summary</h3>

              {cart.map((item) => (
                <div
                  className="summary-row"
                  key={item.id}
                >
                  <span>
                    {item.emoji}{" "}
                    {item.name} ×{" "}
                    {item.quantity}
                  </span>

                  <span>
                    ₹
                    {item.price *
                      item.quantity}
                  </span>
                </div>
              ))}

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <strong>
                  ₹{totalPrice}
                </strong>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PAYMENT */}

      {page === "payment" && (
        <main className="page-container">
          <PageHeader
            title="Payment"
            eyebrow="STEP 2 OF 2"
            subtitle="Pay using UPI and upload your payment screenshot."
            onBack={() =>
              setPage("booking")
            }
          />

          <div className="payment-layout">
            <div className="payment-card card">
              <div className="payment-title">
                <CreditCard size={24} />

                <div>
                  <h3>UPI Payment</h3>
                  <p>
                    Scan the QR code to pay
                  </p>
                </div>
              </div>

              <div className="qr-container">
                <img
                  src="/payment-qr.png"
                  alt="Payment QR"
                  className="qr-image"
                />
              </div>

              <div className="upi-id">
                <span>UPI ID</span>
                <strong>
                  saravanananand326-2@oksbi
                </strong>
              </div>

              <div className="payment-amount">
                <span>Amount</span>
                <strong>
                  ₹{totalPrice}
                </strong>
              </div>

              <a
                className="upi-button"
                href={`upi://pay?pa=saravanananand326-2@oksbi&pn=Pearl%20City%20Parotta%20Stall&am=${totalPrice}&cu=INR`}
              >
                💳 Open UPI App
              </a>
            </div>

            <div className="payment-card card">
              <h3>
                📸 Payment Screenshot
              </h3>

              <p className="muted">
                Complete payment and upload
                the screenshot for admin
                verification.
              </p>

              <label className="upload-box">
                {!paymentPreview ? (
                  <>
                    <Upload size={35} />

                    <strong>
                      Click to upload
                    </strong>

                    <span>
                      PNG / JPG / JPEG •
                      Max 5MB
                    </span>
                  </>
                ) : (
                  <div className="preview-wrapper">
                    <img
                      src={
                        paymentPreview
                      }
                      alt="Payment preview"
                    />

                    <button
                      type="button"
                      className="remove-preview"
                      onClick={(e) => {
                        e.preventDefault();

                        setPaymentPreview(
                          ""
                        );

                        setPaymentScreenshot(
                          null
                        );
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleScreenshot
                  }
                />
              </label>

              <button
                className="primary-button full"
                onClick={
                  confirmBooking
                }
              >
                <CheckCircle size={19} />
                Confirm Booking
              </button>
            </div>
          </div>
        </main>
      )}

      {/* SUCCESS */}

      {page === "success" && (
        <main className="success-page">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={60} />
            </div>

            <span className="eyebrow">
              BOOKING RECEIVED
            </span>

            <h2>
              Order Ready! 🎉
            </h2>

            <p>
              Your order has been saved successfully.
              Keep your booking ID for reference.
            </p>

            <div className="booking-id">
              <span>
                YOUR BOOKING ID
              </span>

              <strong>
                {bookingId}
              </strong>
            </div>

            <div className="success-details">
              <div>
                <Clock size={17} />
                {formData.slot}
              </div>

              <div>
                <ShoppingCart size={17} />
                {totalItems} items
              </div>

              <div>
                <IndianRupee size={17} />
                {totalPrice}
              </div>
            </div>

            <button
              className="text-button"
              onClick={
                resetOrder
              }
            >
              Create Another Booking
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

function FoodCard({ item, onAdd }) {
  const isSpecialOffer = item.id === 2;

  return (
    <div className={isSpecialOffer ? "food-card special-offer-card" : "food-card"}>
      {isSpecialOffer && (
        <div className="special-offer-ribbon">🔥 SPECIAL OFFER</div>
      )}

      <div className="food-image">
        {item.emoji}
      </div>

      <div className="food-content">
        <span className={isSpecialOffer ? "food-tag special-offer-tag" : "food-tag"}>
          {isSpecialOffer ? "BEST VALUE" : "POPULAR"}
        </span>

        <h3>{item.name}</h3>

        <p className={isSpecialOffer ? "special-offer-subtitle" : ""}>
          {isSpecialOffer ? "3 Pieces • Only ₹50" : item.subtitle}
        </p>

        <div className="food-bottom">
          <strong className={isSpecialOffer ? "special-offer-price" : ""}>
            ₹{item.price}
          </strong>

          <button onClick={onAdd}>
            <Plus size={17} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  title,
  eyebrow,
  subtitle,
  onBack,
}) {
  return (
    <div className="page-header">
      <button
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <span className="eyebrow">
        {eyebrow}
      </span>

      <h2>{title}</h2>

      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Approved" ||
      status === "Confirmed"
      ? "status approved"
      : status === "Rejected"
        ? "status rejected"
        : status === "New"
          ? "status new"
          : "status pending";

  return (
    <span className={className}>
      {status}
    </span>
  );
}

export default App;