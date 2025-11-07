import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logReport, logReportError } from '@/lib/logger';

interface ReportRequest {
  orderId: string;
  orderData: any;
  userName: string;
  userEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    // IMPORTANT: This will definitely show in terminal
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀🚀🚀 REPORT GENERATION STARTED 🚀🚀🚀');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🚀 [REPORT GENERATION] Starting report generation process...');
    
    logReport('\n\n');
    logReport('═══════════════════════════════════════════════════════════');
    logReport('🚀🚀🚀 REPORT GENERATION STARTED 🚀🚀🚀');
    logReport('═══════════════════════════════════════════════════════════');
    logReport('\n🚀 [REPORT GENERATION] Starting report generation process...');
    const startTime = Date.now();

    const body: ReportRequest = await request.json();
    const { orderId, orderData, userName, userEmail } = body;

    logReport('📋 [REPORT GENERATION] Request received:');
    logReport(`   - Order ID: ${orderId}`);
    logReport(`   - User Name: ${userName}`);
    logReport(`   - User Email: ${userEmail}`);
    logReport(`   - Order Data Fields: ${Object.keys(orderData).length}`);

    if (!orderId || !orderData || !userName) {
      logReportError('❌ [REPORT GENERATION] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: orderId, orderData, userName' },
        { status: 400 }
      );
    }

    // Initialize Gemini AI
    logReport('🔧 [REPORT GENERATION] Initializing Gemini AI...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logReportError('❌ [REPORT GENERATION] GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    logReport('✅ [REPORT GENERATION] API Key loaded');

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    logReport('✅ [REPORT GENERATION] Gemini model initialized (gemini-2.5-flash)');

    // Prepare the prompt with user's questionnaire data
    logReport('📝 [REPORT GENERATION] Generating prompt from order data...');
    const prompt = generateReportPrompt(orderData, userName);
    logReport(`✅ [REPORT GENERATION] Prompt generated (${prompt.length} characters)`);
    logReport('📄 [REPORT GENERATION] Prompt preview:', prompt.substring(0, 200) + '...');

    // Generate report using Gemini
    logReport('🚀🚀🚀 [REPORT GENERATION] Calling Gemini API to generate report... 🚀🚀🚀');
    logReport('⏳ [REPORT GENERATION] This may take 20-60 seconds...');
    const apiCallStart = Date.now();
    
    const result = await model.generateContent(prompt);
    
    const apiCallDuration = Date.now() - apiCallStart;
    logReport(`✅✅✅ [REPORT GENERATION] Gemini API call completed in ${apiCallDuration}ms ✅✅✅`);
    
    const response = result.response;
    const reportContent = response.text();
    
    logReport(`✅ [REPORT GENERATION] Report content received (${reportContent.length} characters)`);
    logReport('📄 [REPORT GENERATION] Report preview:', reportContent.substring(0, 300) + '...');

    // Parse the generated report
    logReport('🔍 [REPORT GENERATION] Parsing report into sections...');
    const parseStart = Date.now();
    const parsedReport = parseGeminiReport(reportContent, orderId, userName, userEmail);
    const parseDuration = Date.now() - parseStart;
    
    logReport(`✅ [REPORT GENERATION] Report parsed in ${parseDuration}ms`);
    logReport(`📊 [REPORT GENERATION] Report structure:`);
    logReport(`   - Report ID: ${parsedReport.reportId}`);
    logReport(`   - Status: ${parsedReport.status}`);
    logReport(`   - Title: ${parsedReport.title}`);
    logReport(`   - Sections: ${parsedReport.sections.length}`);
    logReport(`   - Recommendations: ${parsedReport.recommendations.length}`);
    
    logReport('\n📄 [REPORT GENERATION] Sections:');
    parsedReport.sections.forEach((section, index) => {
      logReport(`   ${index + 1}. ${section.title} (${section.content.length} chars)`);
    });
    const totalDuration = Date.now() - startTime;
    console.log(`\n✅ [REPORT GENERATION] Report generation completed in ${totalDuration}ms`);
    console.log('🎉 [REPORT GENERATION] Returning report to client\n');

    return NextResponse.json({
      success: true,
      report: parsedReport,
      rawContent: reportContent,
    });
  } catch (error) {
    logReportError('❌ [REPORT GENERATION] ERROR:', error);
    logReportError('📋 [REPORT GENERATION] Error details:', error instanceof Error ? error.message : 'Unknown error');
    logReportError('🔗 [REPORT GENERATION] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a comprehensive prompt for Gemini based on order/questionnaire data
 */
function generateReportPrompt(orderData: any, userName: string): string {
  logReport('   📋 Extracting order data fields:');
  
  const {
    age,
    gender,
    height,
    weight,
    bloodGroup,
    ethnicity,
    smoking,
    alcohol,
    exercise,
    medications,
    takingMedications,
    allergies,
    hasAllergies,
    sleepQuality,
    stressLevel,
    dietaryPreferences,
    motivations,
    otherMotivation,
  } = orderData;

  logReport(`     ✓ Age: ${age}`);
  logReport(`     ✓ Gender: ${gender}`);
  logReport(`     ✓ Blood Group: ${bloodGroup}`);
  logReport(`     ✓ Ethnicity: ${ethnicity}`);
  logReport(`     ✓ Smoking: ${smoking}`);
  logReport(`     ✓ Alcohol: ${alcohol}`);
  logReport(`     ✓ Exercise: ${exercise}`);
  logReport(`     ✓ Sleep Quality: ${sleepQuality}`);
  logReport(`     ✓ Stress Level: ${stressLevel}`);
  logReport(`     ✓ Dietary Preferences: ${dietaryPreferences}`);
  logReport(`     ✓ Motivations: ${motivations ? motivations.join(', ') : 'None'}`);

  return `You are a professional health and genomics analyst. Based on the following information from a DNA testing kit order, generate a comprehensive personalized health analysis report. 

IMPORTANT: Generate a well-structured report with:
1. Executive Summary (2-3 paragraphs)
2. Health Profile Analysis (based on their lifestyle and health data)
3. Genetic Insights & Recommendations (based on their demographics and health factors)
4. Lifestyle & Wellness Recommendations (tailored to their profile)
5. Key Findings & Risk Factors (if any)
6. Next Steps & Follow-up Recommendations

---
CUSTOMER INFORMATION:
Name: ${userName}
Age: ${age} years
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
Blood Group: ${bloodGroup}
Ethnicity: ${ethnicity}

HEALTH & LIFESTYLE DATA:
- Smoking Status: ${smoking}
- Alcohol Consumption: ${alcohol}
- Exercise Frequency: ${exercise}
- Current Medications: ${takingMedications === 'yes' ? medications : 'None'}
- Allergies: ${hasAllergies === 'yes' ? allergies : 'None'}
- Sleep Quality: ${sleepQuality}
- Stress Level: ${stressLevel}
- Dietary Preferences: ${dietaryPreferences}

TEST MOTIVATION:
${
  motivations && motivations.length > 0
    ? `Primary reasons for testing: ${motivations.join(', ')}`
    : 'No specific motivations provided'
}
${otherMotivation ? `\nAdditional motivation: ${otherMotivation}` : ''}

---

Please generate a professional, actionable health report that:
1. Acknowledges their health profile
2. Provides personalized insights based on their age, gender, and lifestyle
3. Offers evidence-based recommendations for wellness
4. Highlights areas of concern or opportunity for improvement
5. Is encouraging and empowering in tone
6. Includes specific, actionable steps they can take

Format the report with clear section headings and bullet points where appropriate.`;
}

/**
 * Parse the Gemini-generated report into structured sections
 */
function parseGeminiReport(
  content: string,
  orderId: string,
  userName: string,
  userEmail: string
) {
  console.log('   🔍 Parsing report content...');
  
  // Extract sections from the report
  const sections: Array<{ title: string; content: string }> = [];
  
  // Split by common report section headers
  const sectionRegex = /^(#{1,3}\s+.+?)$/gm;
  const parts = content.split(sectionRegex).filter(Boolean);

  console.log(`   📑 Found ${Math.floor(parts.length / 2)} sections in report`);

  for (let i = 0; i < parts.length; i += 2) {
    const title = parts[i]?.replace(/^#+\s+/, '').trim() || 'Section';
    const sectionContent = parts[i + 1]?.trim() || '';
    
    if (sectionContent) {
      sections.push({ title, content: sectionContent });
      console.log(`     ✓ Section ${sections.length}: "${title}" (${sectionContent.length} chars)`);
    }
  }

  // If parsing failed or no sections found, create basic structure
  if (sections.length === 0) {
    console.log('   ⚠️  No structured sections found, creating fallback section');
    sections.push({
      title: 'Health Analysis Report',
      content: content,
    });
  }

  // Extract summary (first 2-3 paragraphs)
  const summary = content
    .split('\n\n')
    .slice(0, 2)
    .join('\n\n')
    .substring(0, 500);

  console.log(`   ✓ Summary extracted (${summary.length} characters)`);

  // Extract recommendations (look for bulleted items)
  const recommendations = extractRecommendations(content);
  console.log(`   ✓ ${recommendations.length} recommendations extracted`);

  const conclusions = extractConclusions(content);
  console.log(`   ✓ Conclusions extracted (${conclusions.length} characters)`);

  const reportObj = {
    reportId: `report-${orderId}-${Date.now()}`,
    orderId,
    userName,
    userEmail,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'completed' as const,
    title: 'Personalized Health Analysis Report',
    summary,
    sections,
    recommendations,
    conclusions,
    fullContent: content,
  };

  console.log(`   ✅ Report object created successfully`);
  console.log(`      - Report ID: ${reportObj.reportId}`);
  console.log(`      - Sections: ${reportObj.sections.length}`);
  console.log(`      - Recommendations: ${reportObj.recommendations.length}`);

  return reportObj;
}

/**
 * Extract actionable recommendations from report content
 */
function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  
  // Look for bullet points or numbered items
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/)) {
      const recommendation = line.replace(/^[-•*\d.]+\s+/, '').trim();
      if (recommendation && recommendation.length > 10) {
        recommendations.push(recommendation);
      }
    }
  }

  // If no recommendations found, extract key insights
  if (recommendations.length === 0) {
    const insights = content.match(/\b(recommend|consider|should|important|focus|prioritize)[\s\S]{0,100}/gi) || [];
    return insights.map(i => i.trim()).slice(0, 5);
  }

  return recommendations.slice(0, 10); // Return top 10 recommendations
}

/**
 * Extract conclusions from report content
 */
function extractConclusions(content: string): string {
  // Look for conclusion section
  const conclusionMatch = content.match(
    /(?:conclusion|summary|final\s+thoughts|key\s+takeaway)[\s:]*\n?([\s\S]*?)(?:\n\n|$)/i
  );
  
  if (conclusionMatch && conclusionMatch[1]) {
    return conclusionMatch[1].trim().substring(0, 500);
  }

  // Fallback: use last 2-3 paragraphs
  const paragraphs = content.split('\n\n');
  return paragraphs.slice(-2).join('\n\n');
}
