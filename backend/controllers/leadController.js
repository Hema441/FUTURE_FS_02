const Lead = require('../models/Lead');

exports.getLeads = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    
    let query = { createdBy: req.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'date_asc') sortOption = { createdAt: 1 };

    const leads = await Lead.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Lead.countDocuments(query);

    res.json({
      leads,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalLeads: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createLead = async (req, res) => {
  try {
    const newLead = new Lead({ ...req.body, createdBy: req.user.id });
    const lead = await newLead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    let lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user.id });
    
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'Won').length;
    const conversionRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0;

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    res.json({
      totalLeads,
      wonLeads,
      conversionRate,
      statusData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.exportLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    
    // Create CSV content
    const headers = ['Name,Email,Phone,Company,Source,Status,Follow-up Date,Notes,Created At\n'];
    const csvRows = leads.map(lead => {
      const escape = (str) => {
        if (!str) return '';
        const stringified = String(str);
        return stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') 
          ? `"${stringified.replace(/"/g, '""')}"` 
          : stringified;
      };
      
      return [
        escape(lead.name),
        escape(lead.email),
        escape(lead.phone),
        escape(lead.company),
        escape(lead.source),
        escape(lead.status),
        escape(lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : ''),
        escape(lead.notes),
        escape(new Date(lead.createdAt).toLocaleDateString())
      ].join(',');
    });
    
    const csvContent = headers.concat(csvRows).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error during export' });
  }
};
