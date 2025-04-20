const express = require("express");
const router = express.Router();
const LeaveRequest = require("../models/LeaveRequest");
const protect = require("../middleware/authMiddleware");

// Apply for Leave Route
router.post("/apply", protect, async (req, res) => {
  const { reason, startDate, endDate } = req.body;

  try {
    const leaveRequest = new LeaveRequest({
      student: req.user, // Get student ID from the JWT token
      reason,
      startDate,
      endDate,
    });

    await leaveRequest.save();

    res
      .status(201)
      .json({ message: "Leave request submitted successfully", leaveRequest });
  } catch (error) {
    res.status(500).json({ message: "Error submitting leave request" });
  }
});

// Get All Leave Requests (for admin)
router.get("/all", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const leaveRequests = await LeaveRequest.find().populate(
      "student",
      "name email"
    );
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests" });
  }
});

// Cancel a Leave Request (for students)
router.delete("/cancel/:id", protect, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Only allow the student who created the request to cancel it
    if (leaveRequest.student.toString() !== req.user) {
      return res
        .status(403)
        .json({ message: "You cannot cancel someone else's leave request" });
    }

    await leaveRequest.remove();
    res.json({ message: "Leave request canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error canceling leave request" });
  }
});

module.exports = router;
