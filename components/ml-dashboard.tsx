"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, MapPin, Users, AlertTriangle, Clock, Target, BarChart3, RefreshCw, Zap, Shield, Activity, Sparkles, Star } from 'lucide-react'
import { generateMLInsights, getRealtimePredictions, analyzeTrends, type MLInsights, type TrendAnalysis } from "@/lib/ml-predictions"

export function MLDashboard() {
  const [insights, setInsights] = useState<MLInsights | null>(null)
  const [trends, setTrends] = useState<TrendAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [mlInsights, trendData] = await Promise.all([
        getRealtimePredictions(),
        Promise.resolve(analyzeTrends())
      ])
      setInsights(mlInsights)
      setTrends(trendData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load ML data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPredictions = async () => {
    setIsLoading(true)
    try {
      const newInsights = await getRealtimePredictions()
      setInsights(newInsights)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to refresh predictions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200"
    if (score >= 40) return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-200"
    return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-200"
  }

  if (isLoading && !insights) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
            Loading AI Predictions...
          </p>
          <p className="text-sm text-gray-600 mt-2">Analyzing data patterns with machine learning</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
              AI Predictions & Analytics
            </span>
          </h2>
          <p className="text-gray-600 mt-3 text-lg">
            Machine learning insights to optimize barangay services and resource allocation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-full border">
            <Clock className="h-4 w-4 inline mr-2" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            onClick={refreshPredictions} 
            disabled={isLoading} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">System Efficiency</p>
                  <p className="text-3xl font-bold text-blue-700">{insights.overallEfficiency}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress value={insights.overallEfficiency} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">High-Risk Areas</p>
                  <p className="text-3xl font-bold text-red-700">
                    {insights.hotspots.filter(h => h.riskScore >= 70).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-white card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Predicted Demand</p>
                  <p className="text-3xl font-bold text-yellow-700">
                    {insights.serviceDemand.reduce((sum, s) => sum + s.predictedDemand, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">AI Recommendations</p>
                  <p className="text-3xl font-bold text-green-700">{insights.recommendations.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="hotspots" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-100 to-yellow-100 p-1 h-12">
          <TabsTrigger 
            value="hotspots" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md font-semibold"
          >
            Complaint Hotspots
          </TabsTrigger>
          <TabsTrigger 
            value="demand"
            className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-md font-semibold"
          >
            Service Demand
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md font-semibold"
          >
            Resource Allocation
          </TabsTrigger>
          <TabsTrigger 
            value="emergency"
            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md font-semibold"
          >
            Emergency Prediction
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md font-semibold"
          >
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotspots" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-blue-800">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span>Complaint Hotspot Prediction</span>
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Advanced machine learning analysis of areas likely to generate complaints in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights?.hotspots.map((hotspot, index) => (
                  <div key={index} className="border-0 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-xl text-gray-800">{hotspot.location}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Predicted complaints: <span className="font-semibold text-blue-600">{hotspot.predictedComplaints}</span>
                        </p>
                      </div>
                      <Badge className={`${getRiskColor(hotspot.riskScore)} font-semibold px-4 py-2`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Risk: {hotspot.riskScore}%
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold mb-3 text-gray-700">Common Issues:</p>
                        <div className="flex flex-wrap gap-2">
                          {hotspot.commonIssues.map((issue, idx) => (
                            <Badge key={idx} className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-0 text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold mb-3 text-gray-700">Recommended Actions:</p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {hotspot.recommendedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start">
                              <Star className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-yellow-800">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span>Service Demand Forecasting</span>
                <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-0">
                  <Brain className="h-3 w-3 mr-1" />
                  ML Forecast
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Predicted service demand to optimize staffing and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights?.serviceDemand.map((service, index) => (
                  <div key={index} className="border-0 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg card-hover">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl text-gray-800">{service.service}</h4>
                      <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-0 px-4 py-2">
                        <Target className="h-3 w-3 mr-1" />
                        {service.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-sm text-blue-600 font-medium">Current Demand</p>
                        <p className="text-3xl font-bold text-blue-700 mt-2">{service.currentDemand}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-sm text-green-600 font-medium">Predicted Demand</p>
                        <p className="text-3xl font-bold text-green-700 mt-2">{service.predictedDemand}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <p className="text-sm text-purple-600 font-medium">Recommended Staff</p>
                        <p className="text-3xl font-bold text-purple-700 mt-2">{service.recommendedStaff}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-3 text-gray-700">Peak Hours:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.peakHours.map((hour, idx) => (
                          <Badge key={idx} className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-0 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {hour}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-green-800">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span>Resource Allocation Optimization</span>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-0">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Optimized
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                AI-optimized staff and resource distribution across barangay halls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {insights?.resourceAllocation.map((hall, index) => (
                  <div key={index} className="border-0 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg card-hover">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl text-gray-800">{hall.hall}</h4>
                      <Badge className={`font-semibold px-4 py-2 ${
                        hall.efficiency >= 80 ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800" : 
                        hall.efficiency >= 60 ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800" : 
                        "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                      }`}>
                        <Activity className="h-3 w-3 mr-1" />
                        {hall.efficiency}% efficient
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Current Load:</span>
                          <span className="font-bold text-blue-600">{hall.currentLoad}%</span>
                        </div>
                        <Progress value={hall.currentLoad} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Predicted Load:</span>
                          <span className="font-bold text-yellow-600">{hall.predictedLoad}%</span>
                        </div>
                        <Progress value={hall.predictedLoad} className="h-3" />
                      </div>
                      
                      <div className="flex justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <span className="text-sm font-medium text-blue-600">Recommended Staff:</span>
                        <span className="font-bold text-blue-700">{hall.recommendedStaff} people</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold mb-3 text-gray-700">Priority Services:</p>
                        <div className="flex flex-wrap gap-2">
                          {hall.priorityServices.map((service, idx) => (
                            <Badge key={idx} className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-0 text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-red-800">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span>Emergency Response Prediction</span>
                <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critical AI
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                AI-powered emergency risk assessment and response optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights?.emergencyPredictions.map((emergency, index) => (
                  <div key={index} className="border-0 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-xl text-gray-800">{emergency.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          Location: {emergency.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`font-semibold px-4 py-2 ${
                          emergency.probability >= 30 ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800" :
                          emergency.probability >= 20 ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800" :
                          "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                        }`}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {emergency.probability}% probability
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-3 py-1 rounded-full">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Response: {emergency.estimatedResponseTime} min
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold mb-3 text-gray-700">Required Resources:</p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {emergency.requiredResources.map((resource, idx) => (
                            <li key={idx} className="flex items-center">
                              <Zap className="h-3 w-3 text-blue-600 mr-2" />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold mb-3 text-gray-700">Preventive Measures:</p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {emergency.preventiveMeasures.map((measure, idx) => (
                            <li key={idx} className="flex items-center">
                              <Shield className="h-3 w-3 text-green-600 mr-2" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-purple-800">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span>AI-Generated Recommendations</span>
                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-0">
                  <Brain className="h-3 w-3 mr-1" />
                  Smart Insights
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Actionable insights based on predictive analysis and data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg card-hover">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg leading-relaxed">{recommendation}</p>
                      <div className="flex items-center space-x-4 mt-4">
                        <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-0 text-xs font-semibold">
                          <Star className="h-3 w-3 mr-1" />
                          High Priority
                        </Badge>
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <Brain className="h-3 w-3 inline mr-1" />
                          Based on ML analysis
                        </span>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
                      <Zap className="h-4 w-4 mr-2" />
                      Implement
                    </Button>
                  </div>
                ))}
                
                {(!insights?.recommendations || insights.recommendations.length === 0) && (
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-white rounded-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-green-800 font-semibold text-lg">No critical recommendations at this time</p>
                    <p className="text-sm text-green-600 mt-2">System is operating efficiently</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
