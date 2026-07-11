// lib/actions/launch/enrollment.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type EnrollmentData = {
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_other_names?: string;
  applicant_gender: string;
  applicant_dob: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_city?: string;
  contact_town?: string;
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_relationship: string;
  guardian_email?: string;
  guardian_phone?: string;
  prev_school_name?: string;
  prev_school_class?: string;
  prev_school_score?: string;
  applying_class_id: number;
  applying_department_id?: number;
  academic_year_id: number;
  payment_amount?: number;
  payment_channel?: string;
};

// Generate unique application ID (APP-YYYY-XXXX)
async function generateApplicationId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("za_demo_admission")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);
  
  const sequence = ((count || 0) + 1).toString().padStart(4, "0");
  return `APP-${year}-${sequence}`;
}

// Main enrollment submission action
export async function submitEnrollment(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const { data: authUser } = await supabase.auth.getUser();
    const adminName = authUser?.user?.email || "system";
    
    // 1. Create Applicant
    const { data: applicant, error: applicantError } = await supabase
      .from("za_demo_applicant")
      .insert({
        first_name: formData.get("applicant_first_name")?.toString(),
        last_name: formData.get("applicant_last_name")?.toString(),
        other_names: formData.get("applicant_other_names")?.toString() || null,
        gender: formData.get("applicant_gender")?.toString(),
        date_of_birth: formData.get("applicant_dob")?.toString(),
      })
      .select()
      .single();
    
    if (applicantError) throw new Error(`Applicant creation failed: ${applicantError.message}`);
    
    // 2. Create Contact
    const { data: contact, error: contactError } = await supabase
      .from("za_demo_contact")
      .insert({
        email: formData.get("contact_email")?.toString() || null,
        phone: formData.get("contact_phone")?.toString() || null,
        address: formData.get("contact_address")?.toString() || null,
        city: formData.get("contact_city")?.toString() || null,
        town: formData.get("contact_town")?.toString() || null,
      })
      .select()
      .single();
    
    if (contactError) throw new Error(`Contact creation failed: ${contactError.message}`);
    
    // 3. Create Guardian
    const { data: guardian, error: guardianError } = await supabase
      .from("za_demo_guardian")
      .insert({
        first_name: formData.get("guardian_first_name")?.toString(),
        last_name: formData.get("guardian_last_name")?.toString(),
        relationship: formData.get("guardian_relationship")?.toString(),
        email: formData.get("guardian_email")?.toString() || null,
        phone: formData.get("guardian_phone")?.toString() || null,
      })
      .select()
      .single();
    
    if (guardianError) throw new Error(`Guardian creation failed: ${guardianError.message}`);
    
    // 4. Create Previous School (optional)
    let prevSchoolId = null;
    const prevSchoolName = formData.get("prev_school_name")?.toString();
    if (prevSchoolName && prevSchoolName.trim() !== "") {
      const { data: prevSchool, error: prevSchoolError } = await supabase
        .from("za_demo_previous_school")
        .insert({
          name: prevSchoolName,
          class_ended: formData.get("prev_school_class")?.toString() || null,
          average_score: formData.get("prev_school_score")?.toString() ? parseFloat(formData.get("prev_school_score")!.toString()) : null,
        })
        .select()
        .single();
      
      if (!prevSchoolError && prevSchool) prevSchoolId = prevSchool.id;
    }
    
    // 5. Create Payment (optional)
    let paymentId = null;
    const paymentAmount = formData.get("payment_amount")?.toString();
    if (paymentAmount && parseInt(paymentAmount) > 0) {
      const { data: payment, error: paymentError } = await supabase
        .from("za_demo_payment")
        .insert({
          payee_name: `${applicant.first_name} ${applicant.last_name}`,
          amount: parseFloat(paymentAmount),
          payment_reference: formData.get("payment_reference")?.toString() || null,
          status: "pending",
          channel: formData.get("payment_channel")?.toString() || "cash",
          payment_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      
      if (!paymentError && payment) paymentId = payment.id;
    }
    
    // 6. Create Applying For (program/class selection)
    const { data: applyingFor, error: applyingError } = await supabase
      .from("za_demo_applying_for")
      .insert({
        class_id: formData.get("applying_class_id") ? parseInt(formData.get("applying_class_id")!.toString()) : null,
        department_id: formData.get("applying_department_id") ? parseInt(formData.get("applying_department_id")!.toString()) : null,
        academic_year_id: formData.get("academic_year_id") ? parseInt(formData.get("academic_year_id")!.toString()) : null,
        preferred_session: "morning",
        status: "active",
      })
      .select()
      .single();
    
    if (applyingError) throw new Error(`Program selection failed: ${applyingError.message}`);
    
    // 7. Create Timeline
    const { data: timeline, error: timelineError } = await supabase
      .from("za_demo_timeline")
      .insert({
        submitted_at: new Date().toISOString(),
        submitted_by: adminName,
        status: "submitted",
      })
      .select()
      .single();
    
    if (timelineError) throw new Error(`Timeline creation failed: ${timelineError.message}`);
    
    // 8. Create Admission
    const applicationId = await generateApplicationId();
    
    const { data: admission, error: admissionError } = await supabase
      .from("za_demo_admission")
      .insert({
        application_number: applicationId,
        applicant_id: applicant.id,
        contact_id: contact.id,
        guardian_id: guardian.id,
        prev_school_id: prevSchoolId,
        applying_for_id: applyingFor.id,
        admission_type: formData.get("admission_type")?.toString() || "online",
        status: "pending",
        payment_id: paymentId,
        timeline_id: timeline.id,
        remarks: formData.get("remarks")?.toString() || null,
      })
      .select()
      .single();
    
    if (admissionError) throw new Error(`Admission submission failed: ${admissionError.message}`);
    
    revalidatePath("/enroll/success");
    return { success: true, applicationId, admissionId: admission.id };
    
  } catch (err: any) {
    console.error("Enrollment error:", err);
    return { error: err.message };
  }
}

// Helper: Get available classes for dropdown
export async function getAvailableClasses() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: classes, error } = await supabase
      .from("za_demo_class")
      .select("id, name, level, sequence")
      .eq("status", "active")
      .order("sequence", { ascending: true });
    
    if (error) return { error: error.message, classes: [] };
    return { classes: classes || [] };
  } catch (err) {
    return { error: "Failed to load classes", classes: [] };
  }
}

// Helper: Get available departments for dropdown
export async function getAvailableDepartments() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: departments, error } = await supabase
      .from("za_demo_department")
      .select("id, name, dep_code")
      .eq("status", "active")
      .order("name", { ascending: true });
    
    if (error) return { error: error.message, departments: [] };
    return { departments: departments || [] };
  } catch (err) {
    return { error: "Failed to load departments", departments: [] };
  }
}

// Helper: Get academic years (only active/current)
export async function getAcademicYears() {
  const supabase = await createSupabaseServerClient();
  try {
    const currentYear = new Date().getFullYear();
    
    const { data: years, error } = await supabase
      .from("za_demo_academic_year")
      .select("id, year, name, is_active")
      .eq("status", "active")
      .order("year", { ascending: false });
    
    if (error) return { error: error.message, years: [] };
    return { years: years || [] };
  } catch (err) {
    return { error: "Failed to load academic years", years: [] };
  }
}

// Helper: Get current active academic year
export async function getCurrentAcademicYear() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: year, error } = await supabase
      .from("za_demo_academic_year")
      .select("id, year, name")
      .eq("is_active", true)
      .eq("status", "active")
      .single();
    
    if (error) return { error: error.message, year: null };
    return { year };
  } catch (err) {
    return { error: "Failed to load current academic year", year: null };
  }
}

// Helper: Get active terms for an academic year
export async function getActiveTerms(academicYearId: number) {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: terms, error } = await supabase
      .from("za_demo_term")
      .select("id, term_number, name")
      .eq("academic_year_id", academicYearId)
      .eq("is_active", true)
      .eq("status", "active")
      .order("term_number", { ascending: true });
    
    if (error) return { error: error.message, terms: [] };
    return { terms: terms || [] };
  } catch (err) {
    return { error: "Failed to load terms", terms: [] };
  }
}