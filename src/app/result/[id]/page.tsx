'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Heart,
  Dna,
  Eye,
  EyeOff,
  ArrowLeft,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

interface GeneticResult {
  category: string;
  findings: {
    condition: string;
    risk: 'high' | 'moderate' | 'low' | 'negative';
    description: string;
    recommendations?: string[];
  }[];
}

interface ResultData {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  testDate: string;
  completedDate: string;
  
  // Summary
  overallRisk: 'low' | 'moderate' | 'high';
  keyFindings: string[];
  
  // Detailed Results
  geneticResults: GeneticResult[];
  
  // Recommendations
  medicalRecommendations: string[];
  lifestyleRecommendations: string[];
  
  // Metadata
  reportGenerated: boolean;
  reportUrl?: string;
}

export default function ResultPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Fetch order and result data
  useEffect(() => {
    const fetchResult = async () => {
      if (!user?.uid || !orderId) return;

      try {
        setPageLoading(true);
        setError(null);

        // Fetch order details
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });

        if (!response.ok) {
          throw new Error('Order not found or access denied');
        }

        const orderData = await response.json();
        setOrder(orderData);

        // Check if results are ready
        if (orderData.trackingStage !== 'result_ready') {
          setError('Results are not yet available. Please check back later.');
          return;
        }

        // Mock result data (in production, this would come from a backend service)
        const mockResults: ResultData = {
          orderId: orderId,
          userId: user.uid,
          userName: user.displayName || 'User',
          userEmail: user.email || '',
          testDate: orderData.createdAt || new Date().toISOString(),
          completedDate: new Date().toISOString(),
          overallRisk: 'moderate',
          keyFindings: [
            'Carrier status for Cystic Fibrosis identified',
            'Moderate risk for Type 2 Diabetes',
            'Protective variant for Lactose Tolerance detected',
          ],
          geneticResults: [
            {
              category: 'Hereditary Cancer Syndrome',
              findings: [
                {
                  condition: 'BRCA1/BRCA2 Mutations',
                  risk: 'negative',
                  description: 'No pathogenic variants detected',
                },
                {
                  condition: 'Lynch Syndrome',
                  risk: 'negative',
                  description: 'No mutations found in DNA mismatch repair genes',
                },
              ],
            },
            {
              category: 'Cardiovascular Disorders',
              findings: [
                {
                  condition: 'Familial Hypercholesterolemia',
                  risk: 'low',
                  description: 'Carrier of one APOB mutation',
                  recommendations: [
                    'Regular lipid panel screening',
                    'Consult with cardiologist',
                    'Monitor cholesterol levels annually',
                  ],
                },
                {
                  condition: 'Hypertrophic Cardiomyopathy',
                  risk: 'negative',
                  description: 'No pathogenic variants identified',
                },
              ],
            },
            {
              category: 'Metabolic Disorders',
              findings: [
                {
                  condition: 'Type 2 Diabetes Risk',
                  risk: 'moderate',
                  description: 'Genetic predisposition identified with 1.4x increased risk',
                  recommendations: [
                    'Maintain healthy weight',
                    'Regular physical activity (150 min/week)',
                    'Balanced diet with reduced sugar',
                    'Regular glucose monitoring',
                  ],
                },
                {
                  condition: 'Celiac Disease',
                  risk: 'negative',
                  description: 'Unlikely to develop celiac disease',
                },
              ],
            },
          ],
          medicalRecommendations: [
            'Schedule annual comprehensive screening',
            'Consult with a genetic counselor to discuss results',
            'Share results with family members who may be at risk',
            'Keep results updated with your primary care physician',
          ],
          lifestyleRecommendations: [
            'Maintain regular exercise routine (at least 150 minutes per week)',
            'Follow a balanced Mediterranean diet',
            'Avoid smoking and limit alcohol consumption',
            'Maintain healthy sleep schedule (7-9 hours)',
            'Practice stress management and mindfulness',
          ],
          reportGenerated: true,
        };

        setResultData(mockResults);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load results'
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchResult();
  }, [user?.uid, user?.email, orderId]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Unable to Display Results
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'negative':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'negative':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tracking
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Genetic Test Results
              </h1>
              <p className="text-gray-600">
                Comprehensive DNA analysis report
              </p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Overall Risk Card */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Dna className="h-6 w-6 text-blue-600" />
                Overall Assessment
              </CardTitle>
              <Badge
                className={`text-base px-4 py-2 ${
                  resultData.overallRisk === 'high'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : resultData.overallRisk === 'moderate'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-green-100 text-green-800 border-green-300'
                }`}
              >
                {resultData.overallRisk.toUpperCase()} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{resultData.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Test Date</p>
                  <p className="font-medium">
                    {format(new Date(resultData.testDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
              <ul className="space-y-2">
                {resultData.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results Tabs */}
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Genetic Results</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="about">About This Report</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {resultData.geneticResults.map((category, catIdx) => (
              <Card key={catIdx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dna className="h-5 w-5 text-blue-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.findings.map((finding, findIdx) => (
                    <div
                      key={findIdx}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {finding.condition}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getRiskIcon(finding.risk)}
                          <Badge
                            className={`border ${getRiskColor(finding.risk)}`}
                            variant="outline"
                          >
                            {finding.risk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        {finding.description}
                      </p>
                      {finding.recommendations && finding.recommendations.length > 0 && (
                        <div className="bg-blue-50 rounded p-3 border border-blue-100">
                          <p className="text-xs font-semibold text-blue-900 mb-2">
                            Recommendations:
                          </p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {finding.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Medical Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {resultData.medicalRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Lifestyle Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {resultData.lifestyleRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About This Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Report Information
                  </h4>
                  <p className="text-sm">
                    This genetic test report is based on comprehensive DNA analysis covering over 6,000
                    genetic conditions including hereditary cancers, cardiovascular disorders, metabolic
                    diseases, and pharmacogenomics.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    How to Interpret Results
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Negative:</span> No pathogenic variants detected
                      for this condition
                    </p>
                    <p>
                      <span className="font-semibold">Low Risk:</span> Carrier status or low genetic
                      predisposition
                    </p>
                    <p>
                      <span className="font-semibold">Moderate Risk:</span> Increased genetic
                      predisposition requiring monitoring
                    </p>
                    <p>
                      <span className="font-semibold">High Risk:</span> Pathogenic variants identified
                      requiring medical consultation
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Next Steps
                  </h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Discuss results with a genetic counselor</li>
                    <li>Share report with your primary care physician</li>
                    <li>Follow up with specialists as recommended</li>
                    <li>Implement lifestyle recommendations</li>
                    <li>Update family members who may be at risk</li>
                  </ol>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Disclaimer:</strong> This report is for informational purposes only and
                    should not be considered medical advice. Always consult with qualified healthcare
                    professionals before making any medical decisions based on these results.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
