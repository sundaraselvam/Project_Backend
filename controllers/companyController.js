import Company from "../models/Company.js";

export const createCompany = async (req, res) => {
  try {
    const { name, description, location, website } = req.body;
    const company = await Company.create({ name, description, location, website, owner: req.user.userID });
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    if (String(company.owner) !== req.user.userID) return res.status(403).json({ message: "Not authorized" });
    Object.assign(company, req.body);
    await company.save();
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (String(company.owner) !== req.user.userID) return res.status(403).json({ message: 'Not authorized' });
    company.logo = `/uploads/images/${req.file.filename}`;
    await company.save();
    res.json({ message: 'Logo uploaded', path: company.logo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
