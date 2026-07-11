// lib/actions/pdf.ts
"use server";

import { generateFeeReceiptPDF, generateTerminalReportPDF } from '@/lib/pdf/generator';
import { createSupabaseServerClient } from '@/lib/server';
import { getStudentTerminalReportData } from '../action/admin/grading';

// ============================================
// TYPES
// ============================================

const DEFAULT_ASSESSMENT_WEIGHT = 50;
const DEFAULT_EXAM_WEIGHT = 50;

interface FeeReceiptRequest {
  studentFeeId?: number;
  studentId?: number;
  paymentId?: number;
  customData?: any;
}

interface TerminalReportRequest {
  studentId: number;
  classId: number;
  academicYearId: number;
  term?: number;
  customData?: {
    reopeningDate?: string;
    promotedTo?: string;
    classTeacherRemarks?: string;
    attitude?: string;
    interest?: string;
    [key: string]: any;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to calculate fee totals
async function calculateStudentFeeTotals(studentId: number, academicYearId?: number) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from('za_demo_student_fees')
    .select('original_amount, discounted_amount, paid_amount, balance')
    .eq('student_id', studentId);
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  const { data: fees, error } = await query;
  
  if (error || !fees) {
    return { totalOwed: 0, totalPaid: 0, totalBalance: 0 };
  }
  
  const totalOwed = fees.reduce((sum, f) => sum + (f.discounted_amount || f.original_amount), 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0);
  
  return { totalOwed, totalPaid, totalBalance };
}

// Helper to get grade letter and remarks from score
function getGradeLetterAndRemarks(score: number | null): { letter: string; remarks: string } {
  if (score === null) {
    return { letter: "-", remarks: "No grade entered" };
  }
  
  if (score >= 80) {
    return { letter: "A", remarks: "Excellent" };
  } else if (score >= 70) {
    return { letter: "B", remarks: "Good" };
  } else if (score >= 60) {
    return { letter: "C", remarks: "Credit" };
  } else if (score >= 50) {
    return { letter: "D", remarks: "Pass" };
  } else if (score >= 40) {
    return { letter: "E", remarks: "Weak Pass" };
  } else {
    return { letter: "F", remarks: "Fail" };
  }
}

// ============================================
// TERMINAL REPORT GENERATION
// ============================================

/**
 * Generate a terminal report PDF for a student
 * Uses class_subject as source of truth for curriculum
 */

export async function generateStudentTerminalReport(request: TerminalReportRequest) {
  try {
    // Use the existing function that leverages class_subject
    const reportData = await getStudentTerminalReportData(
      request.studentId,
      request.classId,
      request.academicYearId,
      request.term
    );

    console.log('Fetched report data:', reportData);
    
    if (reportData.error) {
      console.error('Error fetching report data:', reportData.error);
      return { error: reportData.error };
    }
    
    // Transform data for PDF generator
    const subjectsForPdf = reportData.subjects!.map((subject: any) => ({
      subject: subject.subject,
      classScore: subject.classScore,
      examScore: subject.examScore,
      totalScore: subject.totalScore || 0,
      grade: subject.letterGrade,
      remarks: subject.remarks,
      hasScores: subject.hasScores,
    }));

    console.log('Transformed subjects for PDF:', subjectsForPdf);
    
    // Calculate overall performance
    const overallScore = reportData.overallAverage ? parseFloat(reportData.overallAverage) : null;
    const { letter: overallGrade, remarks: overallRemarks } = getGradeLetterAndRemarks(overallScore);
    
    // Get term name from the term object if available, otherwise use a default
    const termName = reportData.term?.name || (request.term ? `Term ${request.term}` : "Term");
    
    // Prepare data for PDF - FIXED PROPERTIES
    const pdfData = {
      studentName: reportData.student!.name,
      studentId: reportData.student!.admissionNumber || reportData.student!.studentNumber || 'N/A',  // Fixed: use studentNumber instead of studentId
      className: reportData.class!.name,
      term: termName,  // Fixed: academicYear doesn't have term, use term from reportData
      academicYear: reportData.academicYear!.year.toString(),
      overallAverage: reportData.overallAverage || '0',
      overallLetterGrade: reportData.overallLetter,
      overallRemarks: reportData.overallRemarks,
      subjects: subjectsForPdf,
      subjectCount: reportData.summary!.totalSubjects,
      subjectsWithGrades: reportData.summary!.subjectsWithGrades,
      subjectsWithoutGrades: reportData.summary!.subjectsWithoutGrades,
      reopeningDate: request.customData?.reopeningDate || 'To be announced',
      promotedTo: request.customData?.promotedTo || '',
      classTeacherRemarks: request.customData?.classTeacherRemarks || '',
      attitude: request.customData?.attitude || '',
      interest: request.customData?.interest || '',
      assessmentWeight: DEFAULT_ASSESSMENT_WEIGHT,
      examWeight: DEFAULT_EXAM_WEIGHT,
    };
    
    // Merge with any additional custom data
    const finalData = { ...pdfData, ...request.customData };
    
    const pdfDataUrl = await generateTerminalReportPDF(finalData);
    console.log('Generated PDF data URL:', pdfDataUrl);
    return { success: true, pdf: pdfDataUrl, reportData: finalData };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return { error: 'Failed to generate report' };
  }
}

// ============================================
// FEE RECEIPT GENERATION
// ============================================

/**
 * Generate a fee receipt PDF
 */
export async function generateStudentFeeReceipt(request: FeeReceiptRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    let receiptData: any = {};
    
    if (request.studentFeeId) {
      const { data: studentFee, error: feeError } = await supabase
        .from('za_demo_student_fees')
        .select(`
          *,
          student:student_id (id, first_name, last_name, admission_number),
          class:class_id (id, name),
          academic_year:academic_year_id (id, year, term)
        `)
        .eq('id', request.studentFeeId)
        .single();
      
      if (feeError) {
        return { error: 'Student fee record not found' };
      }
      
      if (studentFee) {
        const { totalOwed, totalBalance } = await calculateStudentFeeTotals(
          studentFee.student_id,
          studentFee.academic_year_id
        );
        
        receiptData = {
          receiptNo: `RCP-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          studentName: `${studentFee.student?.first_name} ${studentFee.student?.last_name}`,
          studentId: studentFee.student?.admission_number || 'N/A',
          className: studentFee.class?.name || 'N/A',
          term: studentFee.academic_year?.term || 'N/A',
          academicYear: studentFee.academic_year?.year || new Date().getFullYear(),
          receivedFrom: `${studentFee.student?.first_name} ${studentFee.student?.last_name}`,
          paymentType: 'School Fees',
          paymentFor: `${studentFee.academic_year?.term || ''} Term Fees`,
          amountPaid: studentFee.paid_amount || 0,
          fees: [
            { description: 'Tuition Fee', amount: studentFee.original_amount || 0 },
            ...(studentFee.discounted_amount ? [{ description: 'Discount Applied', amount: - (studentFee.original_amount - studentFee.discounted_amount) }] : []),
          ],
          total: totalOwed,
          balance: totalBalance,
          totalFees: totalOwed || 0,
          paymentMethod: 'Cash',
          paymentDate: new Date().toLocaleDateString(),
        };
      }
    } else if (request.paymentId) {
      const { data: payment, error: paymentError } = await supabase
        .from('za_demo_fee_payments')
        .select(`
          *,
          student:student_id (id, first_name, last_name, admission_number),
          student_fee:student_fee_id (
            id,
            class_id,
            academic_year_id,
            term,
            original_amount,
            discounted_amount,
            paid_amount,
            balance,
            class:class_id (name),
            academic_year:academic_year_id (year, term)
          ),
          recorded_by_staff:recorded_by (first_name, last_name)
        `)
        .eq('id', request.paymentId)
        .single();
      
      if (paymentError) {
        return { error: 'Payment record not found' };
      }
      
      if (payment) {
        const { totalOwed, totalBalance } = await calculateStudentFeeTotals(
          payment.student_id,
          payment.student_fee?.academic_year_id
        );
        
        receiptData = {
          receiptNo: payment.receipt_number || `RCP-${Date.now()}`,
          date: new Date(payment.payment_date).toLocaleDateString(),
          studentName: `${payment.student?.first_name} ${payment.student?.last_name}`,
          studentId: payment.student?.admission_number || 'N/A',
          className: payment.student_fee?.class?.name || 'N/A',
          term: payment.student_fee?.academic_year?.term || 'N/A',
          academicYear: payment.student_fee?.academic_year?.year || new Date().getFullYear(),
          receivedFrom: `${payment.student?.first_name} ${payment.student?.last_name}`,
          paymentType: 'School Fees',
          paymentFor: `${payment.student_fee?.academic_year?.term || ''} Term Fees`,
          amountPaid: payment.amount,
          fees: [
            { description: 'Payment Received', amount: payment.amount },
          ],
          total: payment.amount,
          balance: totalBalance,
          totalFees: totalOwed || 0,
          paymentMethod: payment.payment_method || 'Cash',
          paymentDate: new Date(payment.payment_date).toLocaleDateString(),
          recordedBy: payment.recorded_by_staff ? `${payment.recorded_by_staff.first_name} ${payment.recorded_by_staff.last_name}` : 'System',
        };
      }
    } else if (request.studentId) {
      // Get all fees for a student
      const { data: studentFees, error: feesError } = await supabase
        .from('za_demo_student_fees')
        .select(`
          *,
          class:class_id (name),
          academic_year:academic_year_id (year, term)
        `)
        .eq('student_id', request.studentId);
      
      if (feesError) {
        return { error: 'Student fees not found' };
      }
      
      if (studentFees && studentFees.length > 0) {
        const { totalOwed, totalPaid, totalBalance } = await calculateStudentFeeTotals(request.studentId);
        const latestFee = studentFees[studentFees.length - 1];
        
        // Get student details
        const { data: student } = await supabase
          .from('za_demo_student')
          .select('first_name, last_name, admission_number')
          .eq('id', request.studentId)
          .single();
        
        receiptData = {
          receiptNo: `RCP-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          studentName: student ? `${student.first_name} ${student.last_name}` : 'Student',
          studentId: student?.admission_number || request.customData?.studentId || 'N/A',
          className: latestFee.class?.name || 'N/A',
          term: latestFee.academic_year?.term || 'N/A',
          academicYear: latestFee.academic_year?.year || new Date().getFullYear(),
          receivedFrom: student ? `${student.first_name} ${student.last_name}` : 'Student',
          paymentType: 'School Fees',
          paymentFor: 'Fee Statement',
          amountPaid: totalPaid,
          fees: studentFees.map(fee => ({
            description: `${fee.academic_year?.term || ''} Term - ${fee.class?.name || ''}`,
            amount: fee.discounted_amount || fee.original_amount,
          })),
          total: totalOwed,
          balance: totalBalance,
          totalFees: totalOwed,
          paymentMethod: 'Various',
          paymentDate: new Date().toLocaleDateString(),
        };
      }
    }
    
    // If no data found
    if (Object.keys(receiptData).length === 0) {
      return { error: 'No fee data found for the given criteria' };
    }
    
    const finalData = { ...receiptData, ...request.customData };
    const pdfDataUrl = await generateFeeReceiptPDF(finalData);
    return { success: true, pdf: pdfDataUrl, receiptData: finalData };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return { error: 'Failed to generate receipt' };
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Generate multiple fee receipts in bulk
 */
export async function bulkGenerateReceipts(studentFeeIds: number[]) {
  const results = [];
  for (const id of studentFeeIds) {
    const result = await generateStudentFeeReceipt({ studentFeeId: id });
    results.push(result);
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => r.error).length;
  
  return { 
    success: true, 
    results,
    summary: {
      total: results.length,
      successful,
      failed,
    },
  };
}

/**
 * Generate terminal reports for multiple students in bulk
 */
export async function bulkGenerateReports(
  studentIds: number[], 
  classId: number, 
  academicYearId: number,
  customData?: any
) {
  const results = [];
  for (const studentId of studentIds) {
    const result = await generateStudentTerminalReport({ 
      studentId, 
      classId, 
      academicYearId,
      customData,
    });
    results.push(result);
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => r.error).length;
  
  return { 
    success: true, 
    results,
    summary: {
      total: results.length,
      successful,
      failed,
    },
  };
}

/**
 * Generate a single payment receipt
 */
export async function generatePaymentReceipt(paymentId: number) {
  const supabase = await createSupabaseServerClient();

  try {
    // Fetch payment details with related data
    const { data: payment, error } = await supabase
      .from("za_demo_fee_payments")
      .select(`
        *,
        student:student_id (
          id,
          first_name,
          last_name,
          admission_number,
          student_number,
          current_class:current_class_id (id, name)
        ),
        student_fee:student_fee_id (
          id,
          academic_year_id,
          term_id,
          original_amount,
          discounted_amount,
          arrears,
          balance,
          academic_year:academic_year_id (id, year, name),
          term:term_id (id, term_number, name)
        ),
        recorded_by_staff:recorded_by (id, first_name, last_name)
      `)
      .eq("id", paymentId)
      .single();

    if (error) throw new Error(error.message);
    if (!payment) throw new Error("Payment not found");

    // Prepare receipt data
    const receiptData = {
      receiptNo: payment.receipt_number,
      date: new Date(payment.payment_date).toLocaleDateString(),
      studentName: `${payment.student?.first_name || ""} ${payment.student?.last_name || ""}`.trim(),
      studentId: payment.student?.admission_number || payment.student?.student_number || "",
      className: payment.student?.current_class?.name || "",
      term: payment.student_fee?.term?.name || `Term ${payment.student_fee?.term_id}`,
      academicYear: payment.student_fee?.academic_year?.year?.toString() || "",
      receivedFrom: `${payment.student?.first_name || ""} ${payment.student?.last_name || ""}`.trim(),
      paymentType: "School Fees",
      paymentFor: payment.student_fee?.term?.name || "Term Fees",
      amountPaid: payment.amount,
      fees: [{ description: "Payment Received", amount: payment.amount }],
      total: payment.amount,
      balance: payment.student_fee?.balance || 0,
      totalFees: (payment.student_fee?.discounted_amount || payment.student_fee?.original_amount || 0) + (payment.student_fee?.arrears || 0),
      paymentMethod: payment.payment_method,
      paymentDate: new Date(payment.payment_date).toLocaleDateString(),
      recordedBy: payment.recorded_by_staff ? `${payment.recorded_by_staff.first_name} ${payment.recorded_by_staff.last_name}` : "System",
    };

    const pdfDataUrl = await generateFeeReceiptPDF(receiptData);
    return { success: true, pdf: pdfDataUrl };
  } catch (err: any) {
    console.error("Error generating payment receipt:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Generate multiple payment receipts in bulk
 */
export async function generateBulkPaymentReceipts(paymentIds: number[]) {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const paymentId of paymentIds) {
    const result = await generatePaymentReceipt(paymentId);
    results.push({
      paymentId,
      success: result.success,
      pdf: result.success ? result.pdf : null,
      error: result.success ? null : result.error,
    });
    if (result.success) successful++;
    else failed++;
  }

  return {
    success: successful > 0,
    results,
    summary: { successful, failed, total: paymentIds.length },
  };
}

// ============================================
// REPORT PREVIEW (for UI)
// ============================================

/**
 * Get preview data for a terminal report (no PDF generation)
 * Useful for showing preview before generating PDF
 */
export async function previewStudentTerminalReport(
  studentId: number,
  classId: number,
  academicYearId: number,
  term?: number
) {
  try {
    const reportData = await getStudentTerminalReportData(
      studentId,
      classId,
      academicYearId,
      term
    );
    
    if (reportData.error) {
      return { error: reportData.error };
    }
    
    // Return the data structure for preview
    return {
      success: true,
      preview: {
        student: reportData.student,
        class: reportData.class,
        academicYear: reportData.academicYear,
        subjects: reportData.subjects,
        overallAverage: reportData.overallAverage,
        overallLetter: reportData.overallLetter,
        overallRemarks: reportData.overallRemarks,
        summary: reportData.summary,
      },
    };
  } catch (error) {
    console.error('Preview generation error:', error);
    return { error: 'Failed to generate preview' };
  }
}