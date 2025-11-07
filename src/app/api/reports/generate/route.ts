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
    sleepEnergy,
    cardiovascularHealth,
    metabolicHealth,
    digestiveHealth,
    cancerImmuneHealth,
    neurologicalHealth,
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
  logReport(`     ✓ Health Questionnaire: ${Object.keys(sleepEnergy || {}).length} sleep, ${Object.keys(cardiovascularHealth || {}).length} cardio questions answered`);

  // Format health questionnaire responses
  const formatQuestionnaire = (category: string, data: Record<string, string> = {}) => {
    if (!data || Object.keys(data).length === 0) return '';
    
    const questions: Record<string, string> = {
      sleep_hours: 'Do you sleep less than 6 or more than 9 hours per night consistently?',
      wake_gasping: 'Do you often wake up gasping for air, choking, or with a dry mouth?',
      exhausted: 'Do you feel exhausted even after a full night\'s sleep?',
      sleep_changes: 'Have you noticed sudden changes in your sleep pattern in the past month?',
      night_sweats: 'Do you experience night sweats or abnormal body temperature during sleep?',
      
      chest_pain: 'Do you frequently feel chest tightness, pain, or pressure, especially during exertion?',
      shortness_breath: 'Do you experience shortness of breath when walking short distances or climbing stairs?',
      swelling: 'Have you noticed swelling in your ankles, feet, or hands recently?',
      irregular_heartbeat: 'Do you experience irregular or rapid heartbeat episodes?',
      heart_history: 'Do you have a history of high blood pressure, high cholesterol, or diabetes?',
      
      weight_change: 'Have you experienced unexplained weight loss or gain in the past 3 months?',
      thirst_urinate: 'Do you often feel excessively thirsty or urinate more than normal?',
      shaky_dizzy: 'Do you frequently feel shaky, dizzy, or fatigued without reason?',
      temp_tolerance: 'Have you noticed significant changes in body temperature tolerance (cold or heat)?',
      skin_hair_nails: 'Do you have persistent dry skin, thinning hair, or brittle nails?',
      
      indigestion: 'Have you had persistent indigestion, heartburn, or difficulty swallowing?',
      blood_stool: 'Have you noticed blood in your stool, dark tar-like stools, or abdominal pain?',
      diarrhea_bloating: 'Do you have frequent diarrhea, constipation, or unexplained bloating?',
      appetite_loss: 'Have you recently lost appetite or feel full very quickly after eating?',
      nausea_vomiting: 'Do you experience chronic nausea or vomiting without identifiable cause?',
      
      lumps_swelling: 'Have you found any lumps, swellings, or thickened areas in your body?',
      fever_sweats: 'Have you experienced unexplained fever, chills, or night sweats lasting weeks?',
      bruise_bleed: 'Do you bruise or bleed more easily than usual?',
      skin_changes: 'Have you noticed any non-healing sores, warts, or skin color changes?',
      cough_blood: 'Have you experienced persistent cough, hoarseness, or blood in sputum?',
      
      headaches: 'Do you experience frequent headaches, vision changes, or episodes of dizziness?',
      numbness_tingling: 'Have you felt numbness, tingling, or weakness in your limbs?',
      tremors: 'Do you have tremors or uncontrolled muscle movements?',
      balance_loss: 'Have you experienced loss of balance or coordination recently?',
      pain_joints: 'Do you have persistent pain in joints, bones, or muscles without clear cause?',
    };

    let result = `\n## ${category}:\n`;
    for (const [key, answer] of Object.entries(data)) {
      const question = questions[key] || key;
      result += `- Q: ${question}\n  A: ${answer}\n`;
    }
    return result;
  };

  const healthQuestionnaireSection = `
## DETAILED HEALTH QUESTIONNAIRE RESPONSES:
${formatQuestionnaire('Sleep and Energy', sleepEnergy)}
${formatQuestionnaire('Cardiovascular and Circulatory Health', cardiovascularHealth)}
${formatQuestionnaire('Metabolic and Endocrine Health', metabolicHealth)}
${formatQuestionnaire('Digestive and Abdominal Health', digestiveHealth)}
${formatQuestionnaire('Cancer and Immune System Indicators', cancerImmuneHealth)}
${formatQuestionnaire('Neurological and Musculoskeletal Health', neurologicalHealth)}
`;

  return `You are a professional health and wellness analyst. Based on the following comprehensive health assessment, analyze my answers and generate a highly detailed, structured report about my overall health and lifestyle.

INSTRUCTIONS FOR ANALYSIS:
1. Assess my lifestyle based on the following categories: Sleep & Energy, Cardiovascular Health, Metabolic Health, Digestive Health, Cancer Risk Indicators, and Neurological/Musculoskeletal Health

2. Identify which aspects of my lifestyle may be healthy or unhealthy, citing CONCRETE EVIDENCE from my questionnaire answers and personal health data

3. For EACH major health risk area (e.g., heart disease, diabetes, cancer, sleep disorders, neurological issues), estimate and CLEARLY STATE my risk level with supporting rationale:
   - LOW RISK: No concerning patterns or symptoms
   - MODERATE RISK: Some warning signs or lifestyle factors present
   - HIGH RISK: Multiple concerning indicators requiring attention
   - URGENT: Red flags requiring prompt medical consultation

4. Provide PERSONALIZED, ACTIONABLE advice for improving any areas of concern:
   - Sleep hygiene recommendations (specific to my answers)
   - Healthy eating suggestions (based on my dietary preferences and digestive health)
   - Physical activity recommendations (considering my current exercise level and cardiovascular status)
   - Stress management strategies (tailored to my stress level)
   - Preventive screening recommendations (based on risk factors)

5. Highlight ANY URGENT WARNING SIGNS or 'RED FLAGS' that may require PROMPT MEDICAL CONSULTATION

6. Organize the report in clear sections for each health domain with:
   - Bullet points for key findings
   - Concise explanations of why each finding matters
   - Risk level indicators (LOW/MODERATE/HIGH/URGENT)
   - Specific actionable steps

7. Ensure the analysis is thorough, nuanced, evidence-based, and user-friendly (NOT generic)

---

## PERSONAL HEALTH PROFILE:
Name: ${userName}
Age: ${age} years
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
Blood Group: ${bloodGroup}
Ethnicity: ${ethnicity}

## LIFESTYLE DATA:
- Smoking Status: ${smoking}
- Alcohol Consumption: ${alcohol}
- Exercise Frequency: ${exercise}
- Current Medications: ${takingMedications === 'yes' ? medications : 'None reported'}
- Allergies: ${hasAllergies === 'yes' ? allergies : 'None reported'}
- Sleep Quality: ${sleepQuality}
- Stress Level: ${stressLevel}
- Dietary Preferences: ${dietaryPreferences}

## TEST MOTIVATION:
${
  motivations && motivations.length > 0
    ? `Primary reasons for testing: ${motivations.join(', ')}`
    : 'No specific motivations provided'
}
${otherMotivation ? `\nAdditional motivation: ${otherMotivation}` : ''}

${healthQuestionnaireSection}

---

## REPORT FORMAT REQUIREMENT:
Create a comprehensive report with these sections:

1. **Executive Summary** (2-3 paragraphs synthesizing overall health status)
2. **Sleep and Energy Assessment** (analysis of sleep patterns, fatigue, energy levels with risk level)
3. **Cardiovascular and Circulatory Health** (heart health, blood pressure indicators, exercise capacity with risk level)
4. **Metabolic and Endocrine Health** (weight management, blood sugar indicators, thyroid function signs with risk level)
5. **Digestive and Abdominal Health** (digestive system status, GI concerns with risk level)
6. **Cancer Risk Assessment** (immune system markers, warning signs with risk level)
7. **Neurological and Musculoskeletal Health** (nervous system, brain health, muscle/joint status with risk level)
8. **Key Recommendations** (prioritized action items based on identified risks)
9. **Urgent Concerns** (if any red flags requiring immediate medical attention)
10. **Personalized Wellness Plan** (3-6 month plan with specific, measurable goals)

Use headings, bullet points, and clear formatting. Make it professional yet accessible. Base every recommendation on evidence from the health questionnaire responses provided.
`;
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
