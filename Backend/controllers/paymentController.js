const { snap } = require("../config/midtrans");
const Order = require("../models/Order");
const crypto = require("crypto");

const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("items.menuItemId");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order is not pending payment",
      });
    }

    // Create unique order ID for Midtrans
    const midtransOrderId = `ORDER-${order._id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.items.reduce(
          (total, item) => total + Math.round(item.price) * item.quantity,
          0
        ), // Hitung dari item
      },
      customer_details: {
        first_name: order.customerName,
        phone: order.customerPhone || "",
      },
      item_details: order.items.map((item) => ({
        id: item.menuItemId._id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.menuItemId.name,
      })),
      callbacks: {
        finish: `${req.protocol}://${req.get("host")}/payment/finish`,
        error: `${req.protocol}://${req.get("host")}/payment/error`,
        pending: `${req.protocol}://${req.get("host")}/payment/pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Update order with Midtrans info
    order.midtransToken = transaction.token;
    order.midtransOrderId = midtransOrderId;
    order.paymentMethod = "midtrans";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment link created successfully",
      paymentUrl: transaction.redirect_url,
      token: transaction.token,
      orderId: midtransOrderId,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Verify signature
    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const mySignatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (signatureKey !== mySignatureKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Find order by Midtrans order ID
    const order = await Order.findOne({ midtransOrderId: orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status based on Midtrans notification
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        order.status = "pending";
      } else if (fraudStatus === "accept") {
        order.status = "processing";
      }
    } else if (transactionStatus === "settlement") {
      order.status = "completed";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      order.status = "cancelled";
    } else if (transactionStatus === "pending") {
      order.status = "pending";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Notification processed successfully",
    });
  } catch (error) {
    console.error("Handle notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process notification",
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        total: order.total,
        midtransOrderId: order.midtransOrderId,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createPayment,
  handleNotification,
  getPaymentStatus,
};
