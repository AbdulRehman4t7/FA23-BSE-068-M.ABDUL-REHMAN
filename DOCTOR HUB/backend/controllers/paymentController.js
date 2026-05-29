import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Assistant from '../models/Assistant.js';
import { getFileUrl } from '../config/multer.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createPayment = asyncHandler(async (req, res) => {
  const { appointmentId, amount } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Payment screenshot is required');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.patientId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Invalid appointment');
  }

  const existing = await Payment.findOne({ appointmentId });
  if (existing) {
    res.status(400);
    throw new Error('Payment already submitted for this appointment');
  }

  const payment = await Payment.create({
    appointmentId,
    screenshot: getFileUrl(req.file.filename),
    amount: Number(amount),
    status: 'pending',
  });

  appointment.paymentId = payment._id;
  appointment.timeline.push({ step: 'payment_uploaded', timestamp: new Date() });
  await appointment.save();

  res.status(201).json({ success: true, payment });
});

export const getPendingPayments = asyncHandler(async (req, res) => {
  const { clinicId, date, status = 'pending' } = req.query;

  const assignments = await Assistant.find({ userId: req.user._id });
  const clinicIds = assignments.map((a) => a.clinicId.toString());

  const appointmentFilter = { clinicId: { $in: clinicIds } };
  if (clinicId && clinicIds.includes(clinicId)) {
    appointmentFilter.clinicId = clinicId;
  }
  if (date) {
    const d = new Date(date);
    appointmentFilter.date = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }

  const appointmentIds = await Appointment.distinct('_id', appointmentFilter);

  const payments = await Payment.find({
    appointmentId: { $in: appointmentIds },
    status,
  })
    .populate({
      path: 'appointmentId',
      populate: [
        { path: 'patientId', select: 'name email phone' },
        { path: 'clinicId', select: 'name city' },
        { path: 'doctorId', populate: { path: 'userId', select: 'name' } },
      ],
    })
    .sort({ createdAt: -1 });

  const verifiedToday = await Payment.countDocuments({
    verifiedBy: req.user._id,
    status: 'verified',
    updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  res.json({
    success: true,
    payments,
    stats: {
      pendingCount: payments.filter((p) => p.status === 'pending').length,
      verifiedToday,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { status, verificationNote } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be verified or rejected');
  }

  const payment = await Payment.findById(req.params.id).populate('appointmentId');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  payment.status = status;
  payment.verifiedBy = req.user._id;
  payment.verificationNote = verificationNote || '';
  await payment.save();

  const appointment = await Appointment.findById(payment.appointmentId._id);
  if (status === 'verified') {
    appointment.status = 'confirmed';
    appointment.timeline.push({ step: 'payment_verified', timestamp: new Date() });
    appointment.timeline.push({ step: 'confirmed', timestamp: new Date() });
  } else {
    appointment.timeline.push({ step: 'payment_rejected', timestamp: new Date() });
  }
  await appointment.save();

  res.json({ success: true, payment, appointment });
});
