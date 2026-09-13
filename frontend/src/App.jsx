import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChefHat,
  Clock,
  CreditCard,
  CheckCircle,
  Menu,
  ArrowLeft,
  User,
  Phone,
  CalendarDays,
  GraduationCap,
  Building2,
  FileText,
  Upload,
  Smartphone,
  Image as ImageIcon,
} from "lucide-react";

import "./App.css";

const menuItems = [
  {
    id: 1,
    name: "Thoothukudi Poricha Parotta",
    variant: "(1)",
    price: 20,
    description:
      "Crispy and delicious Thoothukudi style poricha parotta.",
    emoji: "🥞",
  },
  {
    id: 2,
    name: "Thoothukudi Poricha Parotta",
    variant: "(3)",
    price: 50,
    description:
      "Three tasty poricha parottas — perfect for sharing.",
    emoji: "🥞",
  },
  {
    id: 3,
    name: "Omlet",
    variant: "",
    price: 20,
    description:
      "Hot and fluffy street-style egg omlet.",
    emoji: "🍳",
  },
  {
    id: 4,
    name: "Chicken Chukka",
    variant: "",
    price: 80,
    description:
      "Spicy, juicy and flavorful South Indian chicken chukka.",
    emoji: "🍗",
  },
  {
    id: 5,
    name: "Ice Cream with Gulab Jamun",
    variant: "",
    price: 50,
    description:
      "Hot gulab jamun served with cool creamy ice cream.",
    emoji: "🍨",
  },
];

const pickupSlots = [
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM",
  "12:00 PM - 12:30 PM",
  "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM",
  "1:30 PM - 2:00 PM",
  "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM",
];

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [bookingId, setBookingId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    phone: "",
    email: "",
    date: "",
    slot: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
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
    setCart((currentCart) =>
      currentCart
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

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const today = new Date().toISOString().split("T")[0];

  const scrollToSection = (id) => {
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const openBooking = () => {
    if (cart.length === 0) {
      alert("Please add at least one food item.");
      return;
    }

    setCartOpen(false);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setPaymentOpen(false);
    setBookingSuccess(false);
    setErrors({});
  };

  const openPayment = () => {
    if (!validateForm()) {
      return;
    }

    setBookingOpen(false);
    setPaymentOpen(true);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Payment screenshot must be below 5 MB.");
      e.target.value = "";
      return;
    }

    setPaymentScreenshot(file);
  };

  const confirmBooking = async () => {
    if (!paymentScreenshot) {
      alert("Please upload your payment screenshot.");
      return;
    }

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("department", formData.department);
      data.append("year", formData.year);
      data.append("email", formData.email || "");
      data.append("date", formData.date);
      data.append("slot", formData.slot);
      data.append("notes", formData.notes || "");
      data.append("total", totalPrice.toString());
      data.append("items", JSON.stringify(cart));
      data.append("screenshot", paymentScreenshot);

      const response = await fetch(
        "https://pearl-city-food-wasf.vercel.app/api/bookings",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Booking failed");
      }

      setBookingId(result.bookingId);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking Error:", error);
      alert(
        "Booking failed. Please make sure the backend server is running on https://pearl-city-food-wasf.vercel.app"
      );
    }
  };

  const backToBooking = () => {
    setPaymentOpen(false);
    setBookingOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyNumbers = value.replace(/\D/g, "");

      if (onlyNumbers.length <= 10) {
        setFormData({
          ...formData,
          phone: onlyNumbers,
        });
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Please enter your department";
    }

    if (!formData.year) {
      newErrors.year = "Please select your year";
    }

    if (!formData.phone) {
      newErrors.phone = "Please enter your phone number";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number";
    }

    if (!formData.date) {
      newErrors.date = "Please select pickup date";
    }

    if (!formData.slot) {
      newErrors.slot = "Please select a pickup slot";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinuePayment = (e) => {
    e.preventDefault();
    openPayment();
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">

          <div className="logo">
            <ChefHat size={30} />

            <div>
              <span>PEARL CITY</span>
              <small>PAROTTA STALL</small>
            </div>
          </div>

          <nav
            className={
              menuOpen
                ? "nav-links active"
                : "nav-links"
            }
          >
            <button
              onClick={() =>
                scrollToSection("home")
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                scrollToSection("menu")
              }
            >
              Menu
            </button>

            <button
              onClick={() =>
                scrollToSection("how-it-works")
              }
            >
              How It Works
            </button>
          </nav>

          <div className="nav-actions">

            <button
              className="cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart size={21} />

              {totalItems > 0 && (
                <span className="cart-count">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="mobile-menu"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              aria-label="Open menu"
            >
              <Menu />
            </button>

          </div>

        </div>
      </header>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="event-badge">
            🔥 KINGS ENGINEERING COLLEGE
          </div>

          <p className="present-text">
            FOOD CARNIVAL • ECE DEPARTMENT
          </p>

          <h1>
            PEARL CITY
            <span>PAROTTA STALL</span>
          </h1>

          <p className="hero-tagline">
            Good Food • Great Vibes
          </p>

          <p className="hero-description">
            Hot. Spicy. Fresh.
            <br />
            Your favorite food, ready when you arrive.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() =>
                scrollToSection("menu")
              }
            >
              <ShoppingCart size={20} />
              Pre-Book Now
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                scrollToSection("menu")
              }
            >
              View Menu
            </button>

          </div>

        </div>

      </section>


      {/* SPECIAL OFFER */}
      <section className="offer-section">

        <div className="offer-card">

          <span className="offer-icon">
            👑
          </span>

          <div>
            <p>SPECIAL OFFER</p>

            <h2>
              Thoothukudi Poricha Parotta
            </h2>

            <span>
              1 for ₹20 • 3 for ₹50
            </span>
          </div>

          <button
            onClick={() =>
              addToCart(menuItems[1])
            }
          >
            Add Offer
          </button>

        </div>

      </section>


      {/* MENU */}
      <section
        className="menu-section"
        id="menu"
      >

        <div className="section-heading">

          <p className="section-label">
            OUR SPECIALS
          </p>

          <h2>
            Today's <span>Menu</span>
          </h2>

          <p>
            Pick your favorites and pre-book
            before the crowd arrives!
          </p>

        </div>


        <div className="menu-grid">

          {menuItems.map((item) => (

            <div
              className="food-card"
              key={item.id}
            >

              <div className="food-image">

                <span>
                  {item.emoji}
                </span>

                {(item.id === 1 ||
                  item.id === 2) && (
                    <div className="popular-badge">
                      ⭐ POPULAR
                    </div>
                  )}

              </div>


              <div className="food-info">

                <div className="food-title">

                  <h3>
                    {item.name}
                  </h3>

                  {item.variant && (
                    <span>
                      {item.variant}
                    </span>
                  )}

                </div>

                <p>
                  {item.description}
                </p>

                <div className="food-bottom">

                  <strong>
                    ₹{item.price}
                  </strong>

                  <button
                    className="add-button"
                    onClick={() =>
                      addToCart(item)
                    }
                  >
                    <Plus size={18} />
                    Add
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <p className="section-label">
            EASY PRE-BOOKING
          </p>

          <h2>
            How It <span>Works</span>
          </h2>

        </div>

        <div className="steps">

          <div className="step">
            <div className="step-icon">
              <ShoppingCart />
            </div>

            <span>01</span>

            <h3>
              Choose Your Food
            </h3>

            <p>
              Select your favorite items
              from our menu.
            </p>
          </div>


          <div className="step">
            <div className="step-icon">
              <Clock />
            </div>

            <span>02</span>

            <h3>
              Select Pickup Slot
            </h3>

            <p>
              Choose a convenient time
              to collect your order.
            </p>
          </div>


          <div className="step">
            <div className="step-icon">
              <CreditCard />
            </div>

            <span>03</span>

            <h3>
              Pay Online
            </h3>

            <p>
              Make a quick and secure
              online payment.
            </p>
          </div>


          <div className="step">
            <div className="step-icon">
              <CheckCircle />
            </div>

            <span>04</span>

            <h3>
              Collect Your Food
            </h3>

            <p>
              Show your order ID and
              enjoy your food!
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta-section">

        <div>

          <p>
            Hungry already? 😋
          </p>

          <h2>
            Don't Wait.
            <br />
            <span>
              Pre-Book Now!
            </span>
          </h2>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            scrollToSection("menu")
          }
        >
          Order Now
          <ShoppingCart size={20} />
        </button>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="footer-logo">

          <ChefHat />

          <span>
            PEARL CITY PAROTTA STALL
          </span>

        </div>

        <p>
          Kings Engineering College • Food Carnival
        </p>

        <p className="copyright">
          © 2026 Pearl City Parotta Stall
        </p>

      </footer>


      {/* CART */}
      {cartOpen && (

        <div
          className="cart-overlay"
          onClick={() =>
            setCartOpen(false)
          }
        >

          <div
            className="cart-drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="cart-header">

              <div>
                <h2>Your Cart</h2>

                <p>
                  {totalItems} item(s)
                </p>
              </div>

              <button
                onClick={() =>
                  setCartOpen(false)
                }
                className="close-button"
              >
                <X />
              </button>

            </div>


            {cart.length === 0 ? (

              <div className="empty-cart">

                <ShoppingCart size={55} />

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add some delicious food!
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollToSection("menu");
                  }}
                >
                  Browse Menu
                </button>

              </div>

            ) : (

              <>
                <div className="cart-items">

                  {cart.map((item) => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <div className="cart-food-icon">
                        {item.emoji}
                      </div>

                      <div className="cart-item-info">

                        <h3>
                          {item.name}
                          {item.variant &&
                            ` ${item.variant}`}
                        </h3>

                        <strong>
                          ₹
                          {item.price *
                            item.quantity}
                        </strong>

                        <div className="quantity-controls">

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

                      </div>

                      <button
                        className="remove-button"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                      >
                        <X size={17} />
                      </button>

                    </div>

                  ))}

                </div>


                <div className="cart-footer">

                  <div className="total-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹{totalPrice}
                    </strong>

                  </div>

                  <div className="total-row grand-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{totalPrice}
                    </strong>

                  </div>

                  <button
                    className="checkout-button"
                    onClick={openBooking}
                  >
                    Proceed to Pre-Booking
                  </button>

                  <p className="secure-text">
                    🔒 Secure checkout
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      )}


      {/* PRE-BOOKING */}
      {bookingOpen && (

        <div className="booking-page">

          <div className="booking-container">

            {/* TOP BAR */}

            <div className="booking-top">

              <button
                className="back-button"
                onClick={closeBooking}
              >
                <ArrowLeft size={20} />
                Back
              </button>

              <div className="booking-title">
                <ChefHat size={22} />
                <span>
                  PRE-BOOK YOUR FOOD
                </span>
              </div>

              <div className="step-indicator">
                1 / 2
              </div>

            </div>


            {/* TITLE */}

            <div className="booking-heading">

              <p className="section-label">
                ALMOST THERE 🔥
              </p>

              <h1>
                Tell us about <span>you</span>
              </h1>

              <p>
                Enter your details and choose
                your preferred pickup time.
              </p>

            </div>


            <div className="booking-layout">


              {/* FORM */}

              <form
                className="booking-form"
                onSubmit={handleContinuePayment}
              >

                {/* PERSONAL DETAILS */}

                <div className="form-section">

                  <div className="form-section-title">

                    <User size={19} />

                    <div>
                      <h2>
                        Personal Details
                      </h2>

                      <p>
                        We need this to identify
                        your order.
                      </p>
                    </div>

                  </div>


                  {/* NAME */}

                  <div className="form-group">

                    <label>
                      Full Name
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <User size={18} />

                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                      />

                    </div>

                    {errors.name && (
                      <small className="error-text">
                        {errors.name}
                      </small>
                    )}

                  </div>


                  {/* PHONE */}

                  <div className="form-group">

                    <label>
                      Phone Number
                      <span>*</span>
                    </label>

                    <div className="phone-wrapper">

                      <div className="country-code">
                        🇮🇳 +91
                      </div>

                      <div className="input-wrapper phone-input">

                        <Phone size={18} />

                        <input
                          type="tel"
                          name="phone"
                          inputMode="numeric"
                          maxLength="10"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                        />

                      </div>

                    </div>

                    <small className="input-hint">
                      Example: 9876543210
                    </small>

                    {errors.phone && (
                      <small className="error-text">
                        {errors.phone}
                      </small>
                    )}

                  </div>


                  {/* DEPARTMENT */}

                  <div className="form-group">

                    <label>
                      College / Department
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <Building2 size={18} />

                      <input
                        type="text"
                        name="department"
                        placeholder="Example: ECE"
                        value={
                          formData.department
                        }
                        onChange={handleChange}
                      />

                    </div>

                    {errors.department && (
                      <small className="error-text">
                        {errors.department}
                      </small>
                    )}

                  </div>


                  {/* YEAR */}

                  <div className="form-group">

                    <label>
                      Year
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <GraduationCap size={18} />

                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                      >

                        <option value="">
                          Select your year
                        </option>

                        <option value="1st Year">
                          1st Year
                        </option>

                        <option value="2nd Year">
                          2nd Year
                        </option>

                        <option value="3rd Year">
                          3rd Year
                        </option>

                        <option value="4th Year">
                          4th Year
                        </option>

                        <option value="Faculty">
                          Faculty
                        </option>

                        <option value="Staff">
                          Staff
                        </option>

                      </select>

                    </div>

                    {errors.year && (
                      <small className="error-text">
                        {errors.year}
                      </small>
                    )}

                  </div>


                  {/* EMAIL */}

                  <div className="form-group">

                    <label>
                      Email
                      <small>
                        Optional
                      </small>
                    </label>

                    <div className="input-wrapper">

                      <span className="email-icon">
                        @
                      </span>

                      <input
                        type="email"
                        name="email"
                        placeholder="yourname@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />

                    </div>

                  </div>

                </div>


                {/* PICKUP */}

                <div className="form-section">

                  <div className="form-section-title">

                    <Clock size={19} />

                    <div>
                      <h2>
                        Pickup Details
                      </h2>

                      <p>
                        Choose when you want
                        to collect your food.
                      </p>
                    </div>

                  </div>


                  {/* DATE */}

                  <div className="form-group">

                    <label>
                      Pickup Date
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <CalendarDays size={18} />

                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                      />

                    </div>

                    {errors.date && (
                      <small className="error-text">
                        {errors.date}
                      </small>
                    )}

                  </div>


                  {/* SLOT */}

                  <div className="form-group">

                    <label>
                      Pickup Time Slot
                      <span>*</span>
                    </label>

                    <div className="slot-grid">

                      {pickupSlots.map(
                        (slot) => (

                          <button
                            type="button"
                            key={slot}
                            className={
                              formData.slot === slot
                                ? "slot-button selected"
                                : "slot-button"
                            }
                            onClick={() =>
                              setFormData({
                                ...formData,
                                slot,
                              })
                            }
                          >
                            <Clock size={15} />
                            {slot}
                          </button>

                        )
                      )}

                    </div>

                    {errors.slot && (
                      <small className="error-text">
                        {errors.slot}
                      </small>
                    )}

                  </div>


                  {/* NOTES */}

                  <div className="form-group">

                    <label>
                      Order Notes
                      <small>
                        Optional
                      </small>
                    </label>

                    <div className="input-wrapper textarea-wrapper">

                      <FileText size={18} />

                      <textarea
                        name="notes"
                        placeholder="Any special request?"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                      />

                    </div>

                  </div>

                </div>


                {/* MOBILE TOTAL */}

                <div className="mobile-order-total">

                  <div>
                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹{totalPrice}
                    </strong>
                  </div>

                  <small>
                    🔒 Secure payment
                  </small>

                </div>


                {/* CONTINUE */}

                <button
                  type="submit"
                  className="payment-continue-button"
                >
                  Continue to Payment
                  <CreditCard size={19} />
                </button>

              </form>


              {/* ORDER SUMMARY */}

              <aside className="booking-summary">

                <div className="summary-header">

                  <div>
                    <p>
                      YOUR ORDER
                    </p>

                    <h2>
                      Order Summary
                    </h2>
                  </div>

                  <ShoppingCart
                    size={25}
                  />

                </div>


                <div className="summary-items">

                  {cart.map((item) => (

                    <div
                      className="summary-item"
                      key={item.id}
                    >

                      <div className="summary-food">

                        <span>
                          {item.emoji}
                        </span>

                        <div>

                          <h3>
                            {item.name}
                          </h3>

                          {item.variant && (
                            <small>
                              {item.variant}
                            </small>
                          )}

                          <p>
                            Qty: {item.quantity}
                          </p>

                        </div>

                      </div>

                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>

                    </div>

                  ))}

                </div>


                <div className="summary-total">

                  <div>
                    <span>
                      Items
                    </span>

                    <strong>
                      {totalItems}
                    </strong>
                  </div>

                  <div className="final-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{totalPrice}
                    </strong>

                  </div>

                </div>


                <div className="summary-note">

                  🔒 Pay securely using GPay, PhonePe
                  or any UPI app. Your payment screenshot
                  will be verified manually.

                </div>

              </aside>

            </div>

          </div>

        </div>

      )}

      {/* PAYMENT */}
      {paymentOpen && !bookingSuccess && (
        <div className="payment-page">
          <div className="payment-container">

            <div className="payment-top">
              <button
                className="back-button"
                onClick={backToBooking}
              >
                <ArrowLeft size={20} />
                Back
              </button>

              <div className="booking-title">
                <CreditCard size={22} />
                <span>PAYMENT</span>
              </div>

              <div className="step-indicator">
                2 / 2
              </div>
            </div>

            <div className="payment-heading">
              <p className="section-label">ALMOST DONE 🔥</p>
              <h1>Pay & <span>Confirm</span></h1>
              <p>
                Pay using GPay, PhonePe or any UPI app, then upload the screenshot.
              </p>
            </div>

            <div className="payment-layout">

              <div className="payment-card">

                <div className="payment-amount">
                  <span>Total Amount</span>
                  <strong>₹{totalPrice}</strong>
                </div>

                <div className="payment-methods">
                  <a
                    className="upi-pay-button gpay-button"
                    href={`upi://pay?pa=saravanananand326-2@oksbi&pn=Pearl%20City%20Parotta%20Stall&am=${totalPrice}&cu=INR`}
                  >
                    <Smartphone size={19} />
                    Pay with GPay
                  </a>

                  <a
                    className="upi-pay-button phonepe-button"
                    href={`upi://pay?pa=saravanananand326-2@oksbi&pn=Pearl%20City%20Parotta%20Stall&am=${totalPrice}&cu=INR`}
                  >
                    <Smartphone size={19} />
                    Pay with PhonePe
                  </a>
                </div>

                <div className="qr-payment-card">
                  <h3>Scan & Pay</h3>
                  <p>Use any UPI app to scan this QR</p>

                  <img
                    src="/payment-qr.png"
                    alt="Pearl City Parotta Stall UPI QR Code"
                    className="payment-qr-image"
                  />

                  <div className="upi-id-box">
                    <span>UPI ID</span>
                    <strong>saravanananand326-2@oksbi</strong>
                  </div>
                </div>

                <div className="payment-instruction">
                  <strong>After payment:</strong>
                  <span>Upload the successful payment screenshot below.</span>
                </div>

                <label className="screenshot-upload">
                  <Upload size={22} />
                  <strong>
                    {paymentScreenshot
                      ? "Screenshot selected"
                      : "Upload Payment Screenshot"}
                  </strong>
                  <small>
                    {paymentScreenshot
                      ? paymentScreenshot.name
                      : "PNG, JPG or JPEG • Max 5 MB"}
                  </small>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleScreenshotChange}
                  />
                </label>

                {paymentScreenshot && (
                  <div className="screenshot-selected">
                    <ImageIcon size={18} />
                    <span>{paymentScreenshot.name}</span>
                    <button
                      type="button"
                      onClick={() => setPaymentScreenshot(null)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <button
                  className="confirm-payment-button"
                  onClick={confirmBooking}
                >
                  <CheckCircle size={20} />
                  Confirm Pre-Booking
                </button>

                <p className="payment-warning">
                  ⚠️ Your booking will remain pending until the payment screenshot is verified.
                </p>
              </div>

              <aside className="payment-summary">
                <p className="section-label">YOUR ORDER</p>
                <h2>Order Summary</h2>

                {cart.map((item) => (
                  <div className="payment-summary-item" key={item.id}>
                    <div>
                      <strong>
                        {item.name} {item.variant}
                      </strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}

                <div className="payment-summary-total">
                  <span>Total</span>
                  <strong>₹{totalPrice}</strong>
                </div>

                <div className="payment-customer">
                  <strong>Pickup</strong>
                  <span>{formData.date}</span>
                  <span>{formData.slot}</span>
                </div>
              </aside>

            </div>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS */}
      {bookingSuccess && (
        <div className="payment-page">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={52} />
            </div>

            <p className="section-label">BOOKING RECEIVED 🎉</p>

            <h1>Pre-Booking <span>Confirmed</span></h1>

            <p>
              Your payment screenshot has been submitted for verification.
            </p>

            <div className="booking-id-box">
              <span>YOUR BOOKING ID</span>
              <strong>{bookingId}</strong>
            </div>

            <div className="success-details">
              <div>
                <span>Name</span>
                <strong>{formData.name}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>₹{totalPrice}</strong>
              </div>
              <div>
                <span>Pickup</span>
                <strong>{formData.slot}</strong>
              </div>
            </div>

            <p className="success-note">
              Show this Booking ID at the stall after your payment is verified.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setBookingOpen(false);
                setPaymentOpen(false);
                setBookingSuccess(false);
                setCart([]);
                setPaymentScreenshot(null);
                setBookingId("");
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;