// Mock + Live ML prediction system for barangay management
// The UI imports functions from here. We preserve the same shapes and names.
// Live data is fetched from the API; if unavailable, we fall back to mocks.

// ===========================
// Types used by the dashboard
// ===========================
export interface MLInsights {
  overallEfficiency: number
  hotspots: HotspotPrediction[]
  serviceDemand: ServiceDemandForecast[]
  resourceAllocation: ResourceAllocation[]
  emergencyPredictions: EmergencyPrediction[]
  recommendations: string[]
  // Optional meta
  lastUpdated?: string
  serverTime?: string
}

export interface HotspotPrediction {
  location: string
  riskScore: number
  predictedComplaints: number
  commonIssues: string[]
  recommendedActions: string[]
}

export interface ServiceDemandForecast {
  service: string
  currentDemand: number
  predictedDemand: number
  confidence: number
  recommendedStaff: number
  peakHours: string[]
}

export interface ResourceAllocation {
  hall: string
  currentLoad: number
  predictedLoad: number
  efficiency: number
  recommendedStaff: number
  priorityServices: string[]
}

export interface EmergencyPrediction {
  type: string
  location: string
  probability: number
  estimatedResponseTime: number
  requiredResources: string[]
  preventiveMeasures: string[]
}

export interface TrendAnalysis {
  complaintTrends: { category: string; trend: 'up' | 'down' | 'stable' | 'flat'; percentage: number }[]
  serviceTrends: { service: string; trend: 'up' | 'down' | 'stable' | 'flat'; percentage: number }[]
  // Optional meta
  lastUpdated?: string
  serverTime?: string
}

// ==========================================
// Live data layer (fetch-first with fallback)
// ==========================================
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

async function fetchJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Fetch-first; falls back to the local generator below (no UI change)
export async function getRealtimePredictions(): Promise<MLInsights> {
  try {
    const data = await fetchJson('/analytics/ml-insights')
    return data as MLInsights
  } catch {
    return await generateMLInsights()
  }
}

// Fetch-first; falls back to the simulated version below (no UI change)
export async function analyzeTrends(): Promise<TrendAnalysis> {
  try {
    const data = await fetchJson('/analytics/trends')
    return data as TrendAnalysis
  } catch {
    return defaultAnalyzeTrends()
  }
}

// =====================================================
// Simulated/mock implementations (kept as safe fallback)
// =====================================================

// Full mock generator for MLInsights
export async function generateMLInsights(): Promise<MLInsights> {
  // small artificial delay to mimic network/model time
  await new Promise(resolve => setTimeout(resolve, 400))

  const hotspots: HotspotPrediction[] = [
    {
      location: 'Purok 2 - Riverside',
      riskScore: 78,
      predictedComplaints: 12,
      commonIssues: ['Flooding', 'Drainage clog', 'Street light'],
      recommendedActions: ['Deploy cleanup crew', 'Notify residents', 'Pre-position pumps'],
    },
    {
      location: 'Manggahan Proper - Market',
      riskScore: 61,
      predictedComplaints: 8,
      commonIssues: ['Garbage pick-up', 'Traffic'],
      recommendedActions: ['Extra pick-up', 'Traffic aide 5–7 PM'],
    },
  ]

  const serviceDemand: ServiceDemandForecast[] = [
    {
      service: 'Document Requests',
      currentDemand: 23,
      predictedDemand: 34,
      confidence: 86,
      recommendedStaff: 3,
      peakHours: ['10:00-12:00', '14:00-16:00'],
    },
    {
      service: 'Complaint Processing',
      currentDemand: 15,
      predictedDemand: 26,
      confidence: 78,
      recommendedStaff: 2,
      peakHours: ['09:00-11:00', '15:00-17:00'],
    },
  ]

  const resourceAllocation: ResourceAllocation[] = [
    {
      hall: 'Manggahan Proper',
      currentLoad: 68,
      predictedLoad: 81,
      efficiency: 74,
      recommendedStaff: 2,
      priorityServices: ['Document Requests', 'Clearance'],
    },
    {
      hall: 'Napico',
      currentLoad: 51,
      predictedLoad: 64,
      efficiency: 79,
      recommendedStaff: 1,
      priorityServices: ['Complaint Processing'],
    },
  ]

  const emergencyPredictions: EmergencyPrediction[] = [
    {
      type: 'Flood Risk',
      location: 'Riverside - Purok 2',
      probability: 41,
      estimatedResponseTime: 12,
      requiredResources: ['Water pump', 'Evac team', 'Ambulance'],
      preventiveMeasures: ['Clear drainage', 'Warn high-risk families'],
    },
    {
      type: 'Fire Hazard',
      location: 'Market Area',
      probability: 17,
      estimatedResponseTime: 8,
      requiredResources: ['Fire truck', 'Medic'],
      preventiveMeasures: ['Inspect stalls', 'Kill switch for LPG'],
    },
  ]

  return {
    overallEfficiency: 82,
    hotspots,
    serviceDemand,
    resourceAllocation,
    emergencyPredictions,
    recommendations: [
      'Assign +2 staff to Manggahan Proper 1–3 PM.',
      'Pre-position pumps in Purok 2 before heavy rain.',
      'Extend document window by 1 hour on Fridays.',
    ],
    lastUpdated: new Date().toISOString(),
  }
}

// Simulated local trends (ORIGINAL “simulated” function renamed)
// This is the fallback used by analyzeTrends() if the API is unavailable.
export function defaultAnalyzeTrends(): TrendAnalysis {
  return {
    complaintTrends: [
      { category: 'Infrastructure', trend: 'up', percentage: 15 },
      { category: 'Public Safety', trend: 'down', percentage: 8 },
      { category: 'Environmental', trend: 'stable', percentage: 2 },
      { category: 'Public Services', trend: 'up', percentage: 12 },
    ],
    serviceTrends: [
      { service: 'Document Requests', trend: 'up', percentage: 23 },
      { service: 'Complaint Filing', trend: 'down', percentage: 5 },
      { service: 'Community Programs', trend: 'up', percentage: 18 },
      { service: 'Emergency Response', trend: 'stable', percentage: 1 },
    ],
  }
}

// Predict optimal resource allocation (mock single hall API)
export async function predictResourceAllocation(hallId: string): Promise<ResourceAllocation> {
  await new Promise(resolve => setTimeout(resolve, 500))

  const halls: Record<string, ResourceAllocation> = {
    napico: {
      hall: 'Napico Hall',
      currentLoad: 72,
      predictedLoad: 85,
      efficiency: 91,
      recommendedStaff: 12,
      priorityServices: ['Document Processing', 'Business Permits'],
    },
    greenpark: {
      hall: 'Greenpark Hall',
      currentLoad: 68,
      predictedLoad: 78,
      efficiency: 88,
      recommendedStaff: 10,
      priorityServices: ['Complaint Resolution', 'Community Services'],
    },
  }

  return halls[hallId] || halls.napico
}

// Generate complaint hotspot predictions (mock)
export async function predictComplaintHotspots(): Promise<HotspotPrediction[]> {
  await new Promise(resolve => setTimeout(resolve, 800))

  return [
    {
      location: 'Block 5, Main Street',
      riskScore: 78,
      predictedComplaints: 12,
      commonIssues: ['Street Lighting', 'Road Maintenance', 'Noise Issues'],
      recommendedActions: [
        'Schedule immediate street light inspection',
        'Deploy additional patrol units',
        'Conduct community meeting',
      ],
    },
    {
      location: 'Greenpark Village Area',
      riskScore: 65,
      predictedComplaints: 8,
      commonIssues: ['Waste Management', 'Traffic Congestion'],
      recommendedActions: ['Increase garbage collection frequency', 'Install traffic management signs'],
    },
  ]
}

// Emergency response optimization (mock)
export async function optimizeEmergencyResponse(emergencyType: string): Promise<EmergencyPrediction> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const emergencies: Record<string, EmergencyPrediction> = {
    flood: {
      type: 'Flood Risk',
      location: 'Low-lying areas near river',
      probability: 35,
      estimatedResponseTime: 15,
      requiredResources: ['Emergency vehicles', 'Rescue equipment', 'Medical supplies'],
      preventiveMeasures: ['Clear drainage systems', 'Pre-position emergency supplies', 'Alert residents'],
    },
    fire: {
      type: 'Fire Hazard',
      location: 'Dense residential areas',
      probability: 22,
      estimatedResponseTime: 8,
      requiredResources: ['Fire trucks', 'Medical team', 'Evacuation support'],
      preventiveMeasures: ['Fire safety inspections', 'Community fire drills', 'Equipment maintenance'],
    },
  }

  return emergencies[emergencyType as keyof typeof emergencies] || emergencies.flood
}
