import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";

import Findings from "../model/finding.model.js";
import mongoose from "mongoose";

export const getFindingsByScan = ErrorWrapper( async (req, res, next) => {
  try {
    const { scanId } = req.params;

    const findings = await Findings.find({ scanId });

    res.status(200).json({
      success: true,
      findings
    });

  } catch (error) {
    throw new ErrorHandler(401, error.message);
  }
});




export const filterFindings = ErrorWrapper( async (req, res) => {
  try {
    const { severity, resourceType, category } = req.query;

    const query = {};

    if (severity) query.severity = severity;
    if (resourceType) query.resourceType = resourceType;
    if (category) query.category = category;

    const findings = await Findings.find(query);

    res.status(200).json({
      success: true,
      findings
    });

  } catch (error) {
    
    throw new ErrorHandler(401, error.message);

  }
});




export const getFindingsSummary = ErrorWrapper (async (req, res) => {
  try {
    const { scanId } = req.params;

    const summary = await Findings.aggregate([
      {
        $match: {
          scanId: new mongoose.Types.ObjectId(scanId)
        }
      },
      {
        $group: {
          _id: {
            severity: "$severity",
            category: "$category"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      summary
    });

  } catch (error) {

    throw new ErrorHandler(401, error.message);

  }
}); 