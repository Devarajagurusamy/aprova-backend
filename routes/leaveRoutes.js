const express = require("express");
const LeaveRequest = require("../models/LeaveRequest");
const {
  authenticateUser,
  authenticateAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Apply for Leave (User)
router.post("/apply", authenticateUser, async (req, res) => {
  const { date, reason, duration } = req.body;

  const leaveRequest = new LeaveRequest({
    user: req.userId,
    date,
    reason,
    duration,
  });
  await leaveRequest.save();

  res.json({ message: "Leave request submitted!" });
});

// Get All Leave Requests (Admin)
router.get("/all", authenticateAdmin, async (req, res) => {
  const leaveRequests = await LeaveRequest.find().populate("user", "username");
  res.json(leaveRequests);
});

// Approve/Reject Leave (Admin)
router.put("/update/:id", authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  await LeaveRequest.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: "Leave request updated!" });
});

module.exports = router;
