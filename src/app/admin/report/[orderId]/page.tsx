// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useAdmin } from '@/contexts/admin-context';
// import { getOrderById, getReportByOrderId, saveReportToFirestore, updateReportStatus } from '@/lib/firestore';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { format } from "date-fns";
// //import { Report } from "@/types/report";
// import { Skeleton } from '@/components/ui/skeleton';
// import MarkdownRenderer from "@/components/MarkdownRenderer";
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   FileText,
//   Download,
//   Share2,
//   AlertCircle,
//   CheckCircle,
//   Loader,
//   ArrowLeft,
//   Copy,
//   Brain,
//   Zap,
//   BarChart3,
// } from 'lucide-react';

// import { useToast } from '@/hooks/use-toast';

// interface Order {
//   orderId: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   [key: string]: any;
// }

// interface Report {
//   id?: string;
//   reportId: string;
//   orderId: string;
//   userName: string;
//   generatedAt: string;
//   status: 'generating' | 'completed' | 'failed';
//   title: string;
//   summary: string;
//   sections: Array<{ title: string; content: string }>;
//   recommendations: string[];
//   conclusions: string;
//   fullContent: string;
//   error?: string;
// }

// // Cleans Gemini AI response by removing unwanted asterisks and normalizing text
// function cleanGeminiContent(rawContent: string): string {
//   let cleaned = rawContent;

//   // Remove sequences of 2 or more asterisks which may represent redactions or formatting
//   cleaned = cleaned.replace(/\*{2,}/g, '');

//   // Optionally remove single asterisks used for emphasis, if inappropriate in context
//   cleaned = cleaned.replace(/\*/g, '');

//   // Decode common HTML entities if found (can expand as needed)
//   cleaned = cleaned.replace(/&amp;/g, '&');
//   cleaned = cleaned.replace(/&lt;/g, '<');
//   cleaned = cleaned.replace(/&gt;/g, '>');

//   return cleaned.trim();
// }

// export default function ReportPage() {
//   const router = useRouter();
//   const params = useParams();
//   const { isAdmin, adminUser, loading: adminLoading } = useAdmin();
//   const { toast } = useToast();

//   const orderId = params.orderId as string;
//   const [order, setOrder] = useState<Order | null>(null);
//   const [report, setReport] = useState<Report | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [generating, setGenerating] = useState(false);
//   const [copied, setCopied] = useState(false);

//   // Redirect if not admin
//   useEffect(() => {
//     if (!adminLoading && !isAdmin) {
//       router.push('/');
//     }
//   }, [isAdmin, adminLoading, router]);

//   // Fetch order and check for existing report
//   useEffect(() => {
//     if (!orderId || !isAdmin) return;

//     const fetchOrderAndReport = async () => {
//       try {
//         setLoading(true);

//         // First, fetch all admin orders to find this order
//         const { getAdminOrders } = await import('@/lib/firestore');
//         const allOrders = await getAdminOrders(1000);
//         const foundOrder = allOrders.find((o) => o.orderId === orderId);

//         if (!foundOrder) {
//           toast({
//             title: 'Error',
//             description: 'Order not found',
//             variant: 'destructive',
//           });
//           router.push('/admin/dashboard');
//           return;
//         }

//         setOrder(foundOrder);

//         // Always generate a fresh report when the page loads
//         // This ensures the loading screen shows and API is called every time
//         await generateReport(foundOrder);
//       } catch (error) {
//         console.error('Error fetching order:', error);
//         toast({
//           title: 'Error',
//           description: 'Failed to load order data',
//           variant: 'destructive',
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderAndReport();
//   }, [orderId, isAdmin]);

//   // Generate report using Gemini API
//   const generateReport = async (orderData: Order) => {
//     try {
//       console.log('\n📱 [CLIENT] Starting report generation...');
//       console.log(`📱 [CLIENT] Order ID: ${orderData.orderId}`);
//       console.log(`📱 [CLIENT] User: ${orderData.userName}`);
      
//       setGenerating(true);
//       setLoading(false); // Stop showing skeleton - we're ready to show content

//       // Create placeholder report in Firestore
//       const placeholderReport: Report = {
//         reportId: `report-${orderId}-${Date.now()}`,
//         orderId: orderData.orderId,
//         userName: orderData.userName,
//         generatedAt: new Date().toISOString(),
//         status: 'generating',
//         title: 'Generating Your Personalized Health Analysis Report...',
//         summary: 'Please wait while your report is being generated.',
//         sections: [],
//         recommendations: [],
//         conclusions: '',
//         fullContent: '',
//       };

//       // Save placeholder
//       console.log('📱 [CLIENT] Saving placeholder report to Firestore...');
//       const reportId = await saveReportToFirestore(orderData.userId, placeholderReport);
//       console.log(`📱 [CLIENT] Placeholder saved with ID: ${reportId}`);
      
//       // Set the placeholder report to show loading screen immediately
//       setReport(placeholderReport);
//       console.log('📱 [CLIENT] Loading screen displayed');

//       // Call the report generation API
//       console.log('📱 [CLIENT] Calling /api/reports/generate endpoint...');
//       const apiCallStart = Date.now();
      
//       const response = await fetch('/api/reports/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           orderId: orderData.orderId,
//           orderData: orderData,
//           userName: orderData.userName,
//           userEmail: orderData.userEmail,
//         }),
//       });

//       const apiCallDuration = Date.now() - apiCallStart;
//       console.log(`📱 [CLIENT] API response received in ${apiCallDuration}ms`);
//       console.log(`📱 [CLIENT] Response status: ${response.status} ${response.statusText}`);

//       if (!response.ok) {
//         const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
//         console.error(`📱 [CLIENT] API error: ${response.statusText}`);
//         console.error(`📱 [CLIENT] Error details:`, errorBody);
//         throw new Error(`API error: ${response.statusText} - ${errorBody.error}`);
//       }

//       console.log('📱 [CLIENT] Parsing API response...');
//       const { report: generatedReport } = await response.json();

//       console.log('📱 [CLIENT] API Response structure:');
//       console.log(`   ✓ Report ID: ${generatedReport.reportId}`);
//       console.log(`   ✓ Status: ${generatedReport.status}`);
//       console.log(`   ✓ Sections: ${generatedReport.sections?.length || 0}`);
//       console.log(`   ✓ Recommendations: ${generatedReport.recommendations?.length || 0}`);

//       // Save the generated report
//       console.log('📱 [CLIENT] Saving final report to Firestore...');
//       const finalReport = {
//         ...generatedReport,
//         id: reportId,
//       };

//       await saveReportToFirestore(orderData.userId, finalReport);
//       console.log('📱 [CLIENT] Report saved to Firestore');
      
//       setReport(finalReport);
//       console.log('📱 [CLIENT] Report displayed on UI');

//       toast({
//         title: 'Success',
//         description: 'Report generated successfully!',
//       });
//     } catch (error) {
//       console.error('❌ [CLIENT] Error generating report');
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`   Error type: ${error?.constructor?.name || 'Unknown'}`);
//       console.error(`   Error message: ${errorMessage}`);
      
//       if (error instanceof Error && error.stack) {
//         console.error(`   Stack trace: ${error.stack}`);
//       }

//       // Update status to failed
//       if (order?.userId) {
//         console.log(`📱 [CLIENT] Updating report status to failed in Firestore...`);
//         await updateReportStatus(order.userId, `report-${orderId}-${Date.now()}`, 'failed', errorMessage);
//         console.log(`📱 [CLIENT] Report status updated to failed`);
//       }

//       toast({
//         title: 'Error',
//         description: 'Failed to generate report. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setGenerating(false);
//     }
//   };

//   // Download report as PDF/Text
//   const downloadReport = () => {
//     if (!report) return;

//     const content = `
// ${cleanGeminiContent(report.title)}
// Generated: ${format(new Date(report.generatedAt), 'PPP p')}
// Patient: ${report.userName}

// EXECUTIVE SUMMARY
// ${cleanGeminiContent(report.summary)}

// ---

// ${report.sections.map((section) => `${section.title}\n${cleanGeminiContent(section.content)}`).join('\n\n---\n\n')}

// ---

// RECOMMENDATIONS
// ${report.recommendations.map((rec, i) => `${i + 1}. ${cleanGeminiContent(rec)}`).join('\n')}

// ---

// CONCLUSIONS
// ${cleanGeminiContent(report.conclusions)}
//     `;

//     const element = document.createElement('a');
//     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
//     element.setAttribute('download', `report-${orderId}-${Date.now()}.txt`);
//     element.style.display = 'none';
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);

//     toast({
//       title: 'Success',
//       description: 'Report downloaded successfully!',
//     });
//   };

//   // Copy report to clipboard
//   const copyToClipboard = () => {
//     if (!report) return;

//     const content = `
// ${cleanGeminiContent(report.title)}
// Generated: ${format(new Date(report.generatedAt), 'PPP p')}

// ${cleanGeminiContent(report.summary)}

// ${report.sections.map((section) => `${section.title}\n${cleanGeminiContent(section.content)}`).join('\n\n')}

// RECOMMENDATIONS:
// ${report.recommendations.map((rec) => `• ${cleanGeminiContent(rec)}`).join('\n')}

// ${cleanGeminiContent(report.conclusions)}
//     `;

//     navigator.clipboard.writeText(content);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);

//     toast({
//       title: 'Success',
//       description: 'Report copied to clipboard!',
//     });
//   };

//   const statusColor = {
//     generating: 'bg-blue-50 border-blue-200',
//     completed: 'bg-green-50 border-green-200',
//     failed: 'bg-red-50 border-red-200',
//   };

//   const statusBadgeVariant = {
//     generating: 'default' as const,
//     completed: 'default' as const,
//     failed: 'destructive' as const,
//   };

//   if (adminLoading || loading) {
//     return (
//       <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <Button
//             variant="ghost"
//             onClick={() => router.back()}
//             className="mb-6"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>

//           <div className="space-y-6">
//             {/* Animated header skeleton */}
//             <div className="space-y-3">
//               <Skeleton className="h-12 w-64 rounded-lg bg-blue-100 animate-pulse" />
//               <Skeleton className="h-4 w-96 rounded-lg bg-blue-50 animate-pulse" />
//             </div>

//             {/* Card skeleton */}
//             <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
//               <div className="flex justify-between items-center">
//                 <Skeleton className="h-8 w-48 rounded-lg bg-blue-100 animate-pulse" />
//                 <Skeleton className="h-8 w-32 rounded-lg bg-blue-50 animate-pulse" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
//                 <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
//                 <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
//                 <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
//               </div>
//             </div>

//             {/* Report content skeleton */}
//             <Skeleton className="h-96 rounded-lg bg-blue-50 animate-pulse" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <Button
//             variant="ghost"
//             onClick={() => router.back()}
//             className="mb-6"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>

//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>Order not found</AlertDescription>
//           </Alert>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="mb-6"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Dashboard
//         </Button>

//         {/* Report Status - Only show when completed or failed */}
//         {report && (report.status === 'completed' || report.status === 'failed') && (
//           <div className={`mb-6 p-4 border rounded-lg ${statusColor[report.status]}`}>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {report.status === 'completed' && (
//                   <>
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                     <div>
//                       <h3 className="font-semibold">Report Ready</h3>
//                       <p className="text-sm text-gray-600">
//                         Generated on {format(new Date(report.generatedAt), 'PPP p')}
//                       </p>
//                     </div>
//                   </>
//                 )}
//                 {report.status === 'failed' && (
//                   <>
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                     <div>
//                       <h3 className="font-semibold">Report Generation Failed</h3>
//                       <p className="text-sm text-gray-600">
//                         {report.error || 'An error occurred while generating the report'}
//                       </p>
//                     </div>
//                   </>
//                 )}
//               </div>
//               <Badge variant={statusBadgeVariant[report.status]}>
//                 {report.status === 'completed' ? 'completed' : 'failed'}
//               </Badge>
//             </div>
//           </div>
//         )}

//         {/* AI Analyzer Screen - Show while generating */}
//         {report && report.status === 'generating' && (
//           <div className="mb-6">
//             <Card className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 overflow-hidden">
//               <CardContent className="p-12">
//                 {/* AI Brain Icon with Animation */}
//                 <div className="flex justify-center mb-12">
//                   <div className="relative w-32 h-32">
//                     {/* Rotating outer ring */}
//                     <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
                    
//                     {/* Middle ring - slower rotation */}
//                     <div className="absolute inset-4 rounded-full border-3 border-transparent border-b-pink-500 border-l-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                    
//                     {/* Brain icon center */}
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <Brain className="w-16 h-16 text-blue-600 animate-pulse" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Simple loading text */}
//                 <div className="text-center">
//                   <h2 className="text-2xl font-semibold text-gray-800 mb-2">
//                     Generating Your Report
//                   </h2>
//                   <p className="text-gray-600">
//                     Please wait while your personalized analysis is being created...
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {/* Order Information Card - Only show when not generating */}
//         {report && report.status !== 'generating' && (
//           <Card className="mb-6">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="flex items-center gap-2">
//                     <FileText className="w-5 h-5" />
//                     Health Analysis Report
//                   </CardTitle>
//                 </div>
//                 {report && report.status === 'completed' && (
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={copyToClipboard}
//                     >
//                       <Copy className="w-4 h-4 mr-2" />
//                       {copied ? 'Copied!' : 'Copy'}
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={downloadReport}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Download
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Order ID</p>
//                   <p className="font-semibold">{order.orderId}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Patient Name</p>
//                   <p className="font-semibold">{order.userName}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email</p>
//                   <p className="font-semibold text-sm">{order.userEmail}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Age</p>
//                   <p className="font-semibold">{order.age || 'N/A'}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Report Content */}
//         {report && report.status === 'completed' && (
//           <>
//             {/* Executive Summary */}
//             <Card className="mb-6">
//               <CardHeader>
//                 <CardTitle className="text-lg">Executive Summary</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                   {cleanGeminiContent(report.summary)}
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Report Sections */}
//             {report.sections.map((section, index) => (
//               <Card key={index} className="mb-6">
//                 <CardHeader>
//                   <CardTitle className="text-lg">{section.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                     {cleanGeminiContent(section.content)}
//                   </p>
//                 </CardContent>
//               </Card>
//             ))}

//             {/* Recommendations */}
//             {report.recommendations.length > 0 && (
//               <Card className="mb-6">
//                 <CardHeader>
//                   <CardTitle className="text-lg">Key Recommendations</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {report.recommendations.map((rec, index) => (
//                       <li key={index} className="flex gap-3">
//                         <span className="font-semibold text-blue-600 shrink-0">
//                           {index + 1}.
//                         </span>
//                         <span className="text-gray-700">{cleanGeminiContent(rec)}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Conclusions */}
//             <Card className="mb-6">
//               <CardHeader>
//                 <CardTitle className="text-lg">Conclusions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                   {cleanGeminiContent(report.conclusions)}
//                 </p>
//               </CardContent>
//             </Card>
//           </>
//         )}

//         {report && report.status === 'failed' && (
//           <Card>
//             <CardContent className="pt-6">
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>
//                   {report.error || 'Failed to generate report. Please try again.'}
//                 </AlertDescription>
//               </Alert>
//               <Button
//                 onClick={() => generateReport(order)}
//                 className="mt-4 w-full"
//               >
//                 Retry Report Generation
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/admin-context';
import { getOrderById, getReportByOrderId, saveReportToFirestore, updateReportStatus } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Copy,
  Brain,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface Order {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  [key: string]: any;
}

interface Report {
  id?: string;
  reportId: string;
  orderId: string;
  userName: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  title: string;
  summary: string;
  sections: Array<{ title: string; content: string }>;
  recommendations: string[];
  conclusions: string;
  fullContent: string;
  error?: string;
}

// Enhanced cleaning function for better Markdown rendering
function cleanGeminiContent(rawContent: string): string {
  let cleaned = rawContent;
  
  // Remove sequences of 3+ asterisks (invalid markdown)
  cleaned = cleaned.replace(/\*{3,}/g, '');
  
  // Decode HTML entities
  cleaned = cleaned.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>');
  
  // Ensure blank line before bullet lists (critical for markdown parsing)
  cleaned = cleaned.replace(/([^\n])\n(\* )/g, '$1\n\n$2');
  cleaned = cleaned.replace(/([^\n])\n(- )/g, '$1\n\n$2');
  
  // Ensure blank line before numbered lists
  cleaned = cleaned.replace(/([^\n])\n(\d+\. )/g, '$1\n\n$2');
  
  // Ensure blank line after headings
  cleaned = cleaned.replace(/(#{1,6} .+)\n([^\n#])/g, '$1\n\n$2');
  
  return cleaned.trim();
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    if (!orderId || !isAdmin) return;
    const fetchOrderAndReport = async () => {
      try {
        setLoading(true);
        const { getAdminOrders } = await import('@/lib/firestore');
        const allOrders = await getAdminOrders(1000);
        const foundOrder = allOrders.find((o) => o.orderId === orderId);
        if (!foundOrder) {
          toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
          router.push('/admin/dashboard');
          return;
        }
        setOrder(foundOrder);
        await generateReport(foundOrder);
      } catch {
        toast({ title: 'Error', description: 'Failed to load order data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrderAndReport();
  }, [orderId, isAdmin]);

  const generateReport = async (orderData: Order) => {
    try {
      setGenerating(true);
      setLoading(false);
      const placeholderReport: Report = {
        reportId: `report-${orderId}-${Date.now()}`,
        orderId: orderData.orderId,
        userName: orderData.userName,
        generatedAt: new Date().toISOString(),
        status: 'generating',
        title: 'Generating Your Personalized Health Analysis Report...',
        summary: 'Please wait while your report is being generated.',
        sections: [],
        recommendations: [],
        conclusions: '',
        fullContent: '',
      };
      const reportId = await saveReportToFirestore(orderData.userId, placeholderReport);
      setReport(placeholderReport);

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          orderData: orderData,
          userName: orderData.userName,
          userEmail: orderData.userEmail,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API error: ${response.statusText} - ${errorBody.error}`);
      }

      const { report: generatedReport } = await response.json();
      const finalReport = { ...generatedReport, id: reportId };
      await saveReportToFirestore(orderData.userId, finalReport);
      setReport(finalReport);

      toast({ title: 'Success', description: 'Report generated successfully!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (order?.userId) {
        await updateReportStatus(order.userId, `report-${orderId}-${Date.now()}`, 'failed', errorMessage);
      }
      toast({ title: 'Error', description: 'Failed to generate report. Please try again.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const content = `
${cleanGeminiContent(report.title)}
Generated: ${format(new Date(report.generatedAt), 'PPP p')}
Patient: ${report.userName}

EXECUTIVE SUMMARY
${cleanGeminiContent(report.summary)}

---

${report.sections.map((section) => `${section.title}\n${cleanGeminiContent(section.content)}`).join('\n\n---\n\n')}

---

RECOMMENDATIONS
${report.recommendations.map((rec, i) => `${i + 1}. ${cleanGeminiContent(rec)}`).join('\n')}

---

CONCLUSIONS
${cleanGeminiContent(report.conclusions)}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `report-${orderId}-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: 'Success', description: 'Report downloaded successfully!' });
  };

  const copyToClipboard = () => {
    if (!report) return;
    const content = `
${cleanGeminiContent(report.title)}
Generated: ${format(new Date(report.generatedAt), 'PPP p')}

${cleanGeminiContent(report.summary)}

${report.sections.map((section) => `${section.title}\n${cleanGeminiContent(section.content)}`).join('\n\n')}

RECOMMENDATIONS:
${report.recommendations.map((rec) => `• ${cleanGeminiContent(rec)}`).join('\n')}

${cleanGeminiContent(report.conclusions)}
    `;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Success', description: 'Report copied to clipboard!' });
  };

  const statusColor = {
    generating: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
  };
  const statusBadgeVariant = {
    generating: 'default' as const,
    completed: 'default' as const,
    failed: 'destructive' as const,
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-12 w-64 rounded-lg bg-blue-100 animate-pulse" />
              <Skeleton className="h-4 w-96 rounded-lg bg-blue-50 animate-pulse" />
            </div>
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 rounded-lg bg-blue-100 animate-pulse" />
                <Skeleton className="h-8 w-32 rounded-lg bg-blue-50 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
              </div>
            </div>
            <Skeleton className="h-96 rounded-lg bg-blue-50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Order not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        
        {report && (report.status === 'completed' || report.status === 'failed') && (
          <div className={`mb-6 p-4 border rounded-lg ${statusColor[report.status]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {report.status === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Report Ready</h3>
                      <p className="text-sm text-gray-600">
                        Generated on {format(new Date(report.generatedAt), 'PPP p')}
                      </p>
                    </div>
                  </>
                )}
                {report.status === 'failed' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Report Generation Failed</h3>
                      <p className="text-sm text-gray-600">
                        {report.error || 'An error occurred while generating the report'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={statusBadgeVariant[report.status]}>
                {report.status === 'completed' ? 'completed' : 'failed'}
              </Badge>
            </div>
          </div>
        )}

        {report && report.status === 'generating' && (
          <div className="mb-6">
            <Card className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 overflow-hidden">
              <CardContent className="p-12">
                <div className="flex justify-center mb-12">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
                    <div className="absolute inset-4 rounded-full border-3 border-transparent border-b-pink-500 border-l-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-16 h-16 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Generating Your Report
                  </h2>
                  <p className="text-gray-600">
                    Please wait while your personalized analysis is being created...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {report && report.status !== 'generating' && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Health Analysis Report
                  </CardTitle>
                </div>
                {report && report.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-semibold">{order.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-sm">{order.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{order.age || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {report && report.status === 'completed' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer>
                  {cleanGeminiContent(report.summary)}
                </MarkdownRenderer>
              </CardContent>
            </Card>

            {report.sections.map((section, index) => (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer>
                    {cleanGeminiContent(section.content)}
                  </MarkdownRenderer>
                </CardContent>
              </Card>
            ))}

            {report.recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer>
                    {cleanGeminiContent(report.recommendations.join('\n\n'))}
                  </MarkdownRenderer>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Conclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer>
                  {cleanGeminiContent(report.conclusions)}
                </MarkdownRenderer>
              </CardContent>
            </Card>
          </>
        )}

        {report && report.status === 'failed' && (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {report.error || 'Failed to generate report. Please try again.'}
                </AlertDescription>
              </Alert>
              <Button onClick={() => generateReport(order)} className="mt-4 w-full">
                Retry Report Generation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
