const prisma = require('../config/database');

const getOperationalSummary = async () => {
  const [
    totalVehicles,
    vehiclesOnTrip,
    availableVehicles,
    inShopVehicles,
    totalDrivers,
    availableDrivers,
    activeTrips,
    completedTrips,
    totalFuelLogs,
    fuelCostAggregate,
    expenseCostAggregate,
    expensesByCategory,
    upcomingMaintenance,
    expiringLicenses,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: 'AVAILABLE' } }),
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'COMPLETED' } }),
    prisma.fuelLog.count(),
    prisma.fuelLog.aggregate({ _sum: { totalCost: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.groupBy({
      by: ['expenseType'],
      _sum: { amount: true },
    }),
    prisma.maintenance.findMany({
      where: { status: 'SCHEDULED' },
      include: { vehicle: true },
      take: 5,
    }),
    prisma.driver.findMany({
      where: {
        licenseExpiry: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      take: 5,
    }),
  ]);

  const fuelCost = fuelCostAggregate._sum.totalCost || 0;
  const expenseCost = expenseCostAggregate._sum.amount || 0;

  const expensesMap = expensesByCategory.reduce((acc, curr) => {
    acc[curr.expenseType] = curr._sum.amount || 0;
    return acc;
  }, {});

  return {
    totalVehicles,
    vehiclesOnTrip,
    availableVehicles,
    inShopVehicles,
    totalDrivers,
    availableDrivers,
    activeTrips,
    completedTrips,
    totalFuelLogs,
    fuelCost,
    expenseCost,
    expensesMap,
    upcomingMaintenance: upcomingMaintenance.map((m) => `${m.vehicle.registrationNumber} scheduled for ${m.maintenanceType} on ${m.scheduledDate.toLocaleDateString()}`),
    expiringLicenses: expiringLicenses.map((d) => `${d.fullName} (License: ${d.licenseNumber}) expires on ${d.licenseExpiry.toLocaleDateString()}`),
  };
};

const getHeuristicInsights = (summary) => {
  const recommendations = [];
  const observations = [];

  // Fuel observations
  if (summary.totalFuelLogs > 0) {
    observations.push(`Total fuel spend recorded: $${summary.fuelCost.toLocaleString()} across ${summary.totalFuelLogs} refuel entries.`);
  }

  // Utilization check
  const utilization = summary.totalVehicles > 0 ? Math.round((summary.vehiclesOnTrip / summary.totalVehicles) * 100) : 0;
  observations.push(`Fleet utilization is currently at ${utilization}% (${summary.vehiclesOnTrip} of ${summary.totalVehicles} active).`);

  if (utilization < 30) {
    recommendations.push("Operational warning: Fleet utilization is low. Review scheduled drafts and consolidate regional trips to optimize load capacity.");
  } else if (utilization > 80) {
    recommendations.push("High fleet utilization detected. Consider scheduling preventive maintenance cycles during off-peak hours to avoid logistics bottlenecks.");
  }

  // Maintenance check
  if (summary.upcomingMaintenance.length > 0) {
    observations.push(`${summary.upcomingMaintenance.length} upcoming maintenance tasks scheduled.`);
    summary.upcomingMaintenance.forEach((m) => {
      recommendations.push(`Pre-operational check: Ensure alternative vehicle coverage for scheduled service: ${m}.`);
    });
  } else {
    recommendations.push("Operational tip: No upcoming maintenance scheduled. Initiate scheduled checks for high-mileage cargo trucks.");
  }

  // Expiring licenses
  if (summary.expiringLicenses.length > 0) {
    summary.expiringLicenses.forEach((l) => {
      recommendations.push(`Compliance critical: Notify driver ${l} immediately. Expired licenses automatically block trip dispatch validation.`);
    });
  }

  // Expenses breakdown check
  if (summary.expenseCost > 0) {
    observations.push(`Total operations expenses: $${summary.expenseCost.toLocaleString()}.`);
    const repairExpense = summary.expensesMap['REPAIR'] || 0;
    if (repairExpense > summary.expenseCost * 0.4) {
      recommendations.push("Financial observation: Repair expenses represent a significant portion of active trip costs. Consider scheduling systemic vehicle checks.");
    }
  }

  return {
    source: 'TransitOps Local Analyzer (Key Missing or Offline)',
    observations,
    recommendations,
  };
};

const generateInsights = async () => {
  const summary = await getOperationalSummary();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getHeuristicInsights(summary);
  }

  const prompt = `
  You are the AI Fleet Operations Analyst for TransitOps ERP. 
  Analyze the following current fleet operational summary and generate:
  1. A list of 3-4 key operational observations (e.g. utilization, fuel expenses, warnings).
  2. A list of 3-4 actionable operational recommendations (preventive maintenance, cost reductions, safety compliance).

  Operational Summary:
  - Total Vehicles: ${summary.totalVehicles}
  - Vehicles On Trip: ${summary.vehiclesOnTrip}
  - Vehicles Available: ${summary.availableVehicles}
  - Vehicles In Shop: ${summary.inShopVehicles}
  - Drivers: ${summary.totalDrivers} (Available: ${summary.availableDrivers})
  - Active Trips: ${summary.activeTrips}
  - Completed Trips: ${summary.completedTrips}
  - Total Fuel Cost: $${summary.fuelCost}
  - Total Operations Expenses: $${summary.expenseCost}
  - Expenses by Category: ${JSON.stringify(summary.expensesMap)}
  - Upcoming Maintenance: ${summary.upcomingMaintenance.join(', ')}
  - Drivers with Expiring Licenses (30 days): ${summary.expiringLicenses.join(', ')}

  Respond strictly in JSON format with two keys:
  {
    "observations": ["observation 1", "observation 2", ...],
    "recommendations": ["recommendation 1", "recommendation 2", ...]
  }
  Do not include markdown tags, code blocks, or additional explanation text in your response.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();
    const rawText = json.candidates[0].content.parts[0].text;
    // Strip code block markers if generated by the LLM
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    return {
      source: 'Gemini Operational Engine',
      observations: result.observations,
      recommendations: result.recommendations,
    };
  } catch (err) {
    console.error('Gemini API call failed, falling back to local analysis:', err.message);
    return getHeuristicInsights(summary);
  }
};

module.exports = { generateInsights };
