const Service = require("../models/Service");

exports.getServices = async (_req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch services", error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch service", error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create service", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update service", error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete service", error: error.message });
  }
};
