const aiService = require('../services/ai.service');
const { successResponse } = require('../utils/response.util');

const getInsights = async (req, res) => {
  const insights = await aiService.generateInsights();
  return successResponse(res, insights, 'AI Fleet Insights generated successfully.');
};

module.exports = { getInsights };
