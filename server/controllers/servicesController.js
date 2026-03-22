import Service from "../models/Service.js";

export const getServices = async (_req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

export const createService = async (req, res) => {
  try {
    const serviceData = { ...req.body };

    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.create(serviceData);

    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};