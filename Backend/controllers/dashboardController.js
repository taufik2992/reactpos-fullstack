const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const Shift = require("../models/Shift");
const moment = require("moment");

const getDashboardStats = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
    const startOfYear = moment().startOf("year").format("YYYY-MM-DD");

    // Basic counts
    const totalMenuItems = await Menu.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const activeShifts = await Shift.countDocuments({ status: "active" });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(today) },
    });
    const weekOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(startOfWeek) },
    });
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(startOfMonth) },
    });

    // Revenue statistics
    const totalRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(today) },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const weekRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(startOfWeek) },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const monthRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(startOfMonth) },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    // Order status breakdown
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    // Payment method breakdown
    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    // Top selling items
    const topSellingItems = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
    ]);

    // Daily sales for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      last7Days.push(date);
    }

    const dailySales = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(last7Days[0]) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero values
    const salesByDay = last7Days.map((date) => {
      const found = dailySales.find((sale) => sale._id === date);
      return {
        date,
        orders: found ? found.orders : 0,
        revenue: found ? found.revenue : 0,
      };
    });

    // Category performance
    const categoryStats = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $group: {
          _id: "$menuItem.category",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Average order value
    const avgOrderValue = totalRevenue[0]
      ? totalRevenue[0].total / totalOrders
      : 0;

    // Peak hours analysis
    const peakHours = await Order.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orderCount: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        overview: {
          totalMenuItems,
          totalUsers,
          activeUsers,
          activeShifts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        },
        orders: {
          today: todayOrders,
          week: weekOrders,
          month: monthOrders,
          total: totalOrders,
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          week: weekRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0,
          total: totalRevenue[0]?.total || 0,
        },
        orderStatus: orderStatusStats,
        paymentMethods: paymentMethodStats,
        topSellingItems,
        dailySales: salesByDay,
        categoryPerformance: categoryStats,
        peakHours,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
      case "hour":
        groupFormat = "%Y-%m-%d %H:00";
        break;
      case "day":
        groupFormat = "%Y-%m-%d";
        break;
      case "week":
        groupFormat = "%Y-W%U";
        break;
      case "month":
        groupFormat = "%Y-%m";
        break;
      case "year":
        groupFormat = "%Y";
        break;
      default:
        groupFormat = "%Y-%m-%d";
    }

    const revenueData = await Order.aggregate([
      { $match: { ...matchStage, status: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          orders: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = await Order.aggregate([
      { $match: { ...matchStage, status: "completed" } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          minOrderValue: { $min: "$total" },
          maxOrderValue: { $max: "$total" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: {
        data: revenueData,
        summary: summary[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          minOrderValue: 0,
          maxOrderValue: 0,
        },
        period: { startDate, endDate, groupBy },
      },
    });
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProductReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const productStats = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      ...(category ? [{ $match: { "menuItem.category": category } }] : []),
      {
        $group: {
          _id: "$items.menuItemId",
          name: { $first: "$menuItem.name" },
          category: { $first: "$menuItem.category" },
          price: { $first: "$menuItem.price" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
          orderCount: { $sum: 1 },
          avgQuantityPerOrder: { $avg: "$items.quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const categoryBreakdown = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $group: {
          _id: "$menuItem.category",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
          uniqueProducts: { $addToSet: "$items.menuItemId" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          uniqueProductCount: { $size: "$uniqueProducts" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      report: {
        products: productStats,
        categoryBreakdown,
        period: { startDate, endDate, category },
      },
    });
  } catch (error) {
    console.error("Product report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getStaffReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Staff performance based on orders
    const staffPerformance = await Order.aggregate([
      { $match: { ...matchStage, status: "completed" } },
      {
        $group: {
          _id: "$cashierId",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.nama",
          email: "$user.email",
          role: "$user.role",
          totalOrders: 1,
          totalRevenue: 1,
          avgOrderValue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Shift statistics
    let shiftMatchStage = {};
    if (startDate || endDate) {
      if (startDate) shiftMatchStage.date = { $gte: startDate };
      if (endDate)
        shiftMatchStage.date = { ...shiftMatchStage.date, $lte: endDate };
    }

    const shiftStats = await Shift.aggregate([
      { $match: shiftMatchStage },
      {
        $group: {
          _id: "$userId",
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ["$duration", 60] } },
          avgHoursPerShift: { $avg: { $divide: ["$duration", 60] } },
          overtimeShifts: {
            $sum: { $cond: [{ $eq: ["$status", "overtime"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.nama",
          email: "$user.email",
          role: "$user.role",
          totalShifts: 1,
          totalHours: { $round: ["$totalHours", 2] },
          avgHoursPerShift: { $round: ["$avgHoursPerShift", 2] },
          overtimeShifts: 1,
        },
      },
      { $sort: { totalHours: -1 } },
    ]);

    res.status(200).json({
      success: true,
      report: {
        staffPerformance,
        shiftStatistics: shiftStats,
        period: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error("Staff report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Customer analysis
    const customerStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$customerName",
          phone: { $first: "$customerPhone" },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          lastOrderDate: { $max: "$createdAt" },
          preferredPaymentMethod: { $first: "$paymentMethod" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 100 },
    ]);

    // Customer segments
    const customerSegments = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$customerName",
          totalSpent: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $bucket: {
          groupBy: "$totalSpent",
          boundaries: [0, 50, 100, 200, 500, 1000],
          default: "1000+",
          output: {
            count: { $sum: 1 },
            customers: { $push: "$_id" },
            avgOrderCount: { $avg: "$orderCount" },
          },
        },
      },
    ]);

    // Order frequency analysis
    const orderFrequency = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$customerName",
          orderCount: { $sum: 1 },
        },
      },
      {
        $bucket: {
          groupBy: "$orderCount",
          boundaries: [1, 2, 5, 10, 20],
          default: "20+",
          output: {
            customerCount: { $sum: 1 },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: {
        topCustomers: customerStats,
        customerSegments,
        orderFrequency,
        period: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error("Customer report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getProductReport,
  getStaffReport,
  getCustomerReport,
};
