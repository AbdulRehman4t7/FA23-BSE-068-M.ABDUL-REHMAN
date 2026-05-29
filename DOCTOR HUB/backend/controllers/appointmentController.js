import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import Assistant from '../models/Assistant.js';
import asyncHandler from '../utils/asyncHandler.js';

const defaultTimeline = () => [{ step: 'booked', timestamp: new Date() }];

export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date, timeSlot, notes } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor?.isApproved) {
    res.status(400);
    throw new Error('Doctor not available for booking');
  }

  const clinic = await Clinic.findOne({ _id: clinicId, doctorId });
  if (!clinic) {
    res.status(400);
    throw new Error('Invalid clinic for this doctor');
  }

  const existing = await Appointment.findOne({
    clinicId,
    date: new Date(date),
    timeSlot,
    status: { $nin: ['cancelled'] },
  });
  if (existing) {
    res.status(400);
    throw new Error('Time slot already booked');
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    clinicId,
    date,
    timeSlot,
    notes,
    timeline: defaultTimeline(),
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('doctorId')
    .populate('clinicId')
    .populate('patientId', 'name email phone');

  res.status(201).json({ success: true, appointment: populated });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const { status, date, clinicId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    filter.date = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }
  if (clinicId) filter.clinicId = clinicId;

  const role = req.user.role;

  if (role === 'patient') {
    filter.patientId = req.user._id;
  } else if (role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.json({ success: true, appointments: [], total: 0 });
    }
    filter.doctorId = doctor._id;
  } else if (role === 'assistant') {
    const assignments = await Assistant.find({ userId: req.user._id });
    filter.clinicId = { $in: assignments.map((a) => a.clinicId) };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'name email phone profileImage')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profileImage' } })
      .populate('clinicId', 'name city address')
      .populate('paymentId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  res.json({ success: true, appointments, total, page: Number(page) });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name email phone profileImage')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profileImage' } })
    .populate('clinicId')
    .populate('paymentId');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  res.json({ success: true, appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  appointment.timeline.push({ step: status, timestamp: new Date() });
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email')
    .populate('clinicId', 'name');

  res.json({ success: true, appointment: populated });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (
    req.user.role === 'patient' &&
    (appointment.patientId.toString() !== req.user._id.toString() ||
      appointment.status !== 'pending')
  ) {
    res.status(403);
    throw new Error('Can only cancel pending appointments');
  }

  appointment.status = 'cancelled';
  appointment.timeline.push({ step: 'cancelled', timestamp: new Date() });
  await appointment.save();

  res.json({ success: true, appointment });
});
