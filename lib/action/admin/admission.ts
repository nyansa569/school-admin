// lib/actions/admin/admission.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type AdmissionStatus = "pending" | "reviewing" | "approved" | "declined" | "enrolled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentChannel = "cash" | "bank_transfer" | "mobile_money" | "card";

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

async function generateAdmissionNumber(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("za_demo_student")
    .select("id", { count: "exact", head: true });
  
  const sequence = ((count || 0) + 1).toString().padStart(5, "0");
  return `${year}/${sequence}`;
}

export async function getAdmissions(filters?: {
  status?: AdmissionStatus;
  fromDate?: string;
  toDate?: string;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_admission")
    .select(`
      *,
      applicant:applicant_id (
        id,
        first_name,
        last_name,
        other_names,
        gender,
        date_of_birth,
        created_at
      ),
      contact:contact_id (
        id,
        email,
        phone,
        address,
        city,
        town,
        created_at
      ),
      guardian:guardian_id (
        id,
        first_name,
        last_name,
        relationship,
        email,
        phone,
        occupation,
        created_at
      ),
      prev_school:prev_school_id (
        id,
        name,
        class_ended,
        average_score,
        year_attended,
        created_at
      ),
      payment:payment_id (
        id,
        payee_name,
        amount,
        payment_reference,
        status,
        channel,
        created_at
      ),
      timeline:timeline_id (
        id,
        submitted_at,
        submitted_by,
        reviewed_at,
        reviewed_by,
        approved_at,
        approved_by,
        rejected_at,
        rejected_by,
        rejected_reason,
        status,
        created_at
      ),
      applying_for_details:applying_for_id (
        id,
        department_id,
        class_id,
        academic_year_id,
        preferred_session,
        class:class_id (
          id,
          name,
          level
        ),
        department:department_id (
          id,
          name,
          dep_code
        ),
        academic_year:academic_year_id (
          id,
          year,
          name
        )
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  
  if (filters?.fromDate) {
    query = query.gte("created_at", filters.fromDate);
  }
  
  if (filters?.toDate) {
    query = query.lte("created_at", filters.toDate);
  }

  const { data: admissions, error } = await query;

  if (error) {
    console.error("Error fetching admissions:", error);
    return { error: error.message, admissions: [] };
  }
  
  return { admissions: admissions || [] };
}


export async function getAdmissionById(id: number) {
  const supabase = await createSupabaseServerClient();

  // First get the admission record
  const { data: admission, error } = await supabase
    .from("za_demo_admission")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !admission) {
    console.error("Error fetching admission:", error);
    return { error: error?.message || "Admission not found" };
  }

  // Load applicant data
  if (admission.applicant_id) {
    const { data: applicant } = await supabase
      .from("za_demo_applicant")
      .select("*")
      .eq("id", admission.applicant_id)
      .single();
    if (applicant) admission.applicant = applicant;
  }

  // Load contact data
  if (admission.contact_id) {
    const { data: contact } = await supabase
      .from("za_demo_contact")
      .select("*")
      .eq("id", admission.contact_id)
      .single();
    if (contact) admission.contact = contact;
  }

  // Load guardian data
  if (admission.guardian_id) {
    const { data: guardian } = await supabase
      .from("za_demo_guardian")
      .select("*")
      .eq("id", admission.guardian_id)
      .single();
    if (guardian) admission.guardian = guardian;
  }

  // Load applying_for details
  if (admission.applying_for_id) {
    const { data: applyingFor } = await supabase
      .from("za_demo_applying_for")
      .select(`
        *,
        class:class_id (id, name, level),
        department:department_id (id, name, dep_code),
        academic_year:academic_year_id (id, year, name)
      `)
      .eq("id", admission.applying_for_id)
      .single();
    if (applyingFor) admission.applying_for_details = applyingFor;
  }

  // Load timeline
  if (admission.timeline_id) {
    const { data: timeline } = await supabase
      .from("za_demo_timeline")
      .select("*")
      .eq("id", admission.timeline_id)
      .single();
    if (timeline) admission.timeline = timeline;
  }

  // Load payment
  if (admission.payment_id) {
    const { data: payment } = await supabase
      .from("za_demo_payment")
      .select("*")
      .eq("id", admission.payment_id)
      .single();
    if (payment) admission.payment = payment;
  }

  // Load previous school
  if (admission.prev_school_id) {
    const { data: prevSchool } = await supabase
      .from("za_demo_previous_school")
      .select("*")
      .eq("id", admission.prev_school_id)
      .single();
    if (prevSchool) admission.prev_school = prevSchool;
  }

  return { admission };
}

export async function getAdmissionStats() {
  const supabase = await createSupabaseServerClient();

  const { data: admissions, error } = await supabase
    .from("za_demo_admission")
    .select("status")
    .is("deleted_at", null);

  if (error) return { error: error.message };

  const stats = {
    total: admissions?.length || 0,
    pending: admissions?.filter(a => a.status === "pending").length || 0,
    reviewing: admissions?.filter(a => a.status === "reviewing").length || 0,
    approved: admissions?.filter(a => a.status === "approved").length || 0,
    declined: admissions?.filter(a => a.status === "declined").length || 0,
    enrolled: admissions?.filter(a => a.status === "enrolled").length || 0,
  };

  return { stats };
}

export async function getClasses() {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

export async function getDepartments() {
  const supabase = await createSupabaseServerClient();

  const { data: departments, error } = await supabase
    .from("za_demo_department")
    .select("id, name, dep_code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { departments: departments || [] };
}

export async function getAcademicYears() {
  const supabase = await createSupabaseServerClient();

  const { data: years, error } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
}

export async function createAdmission(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: authUser } = await supabase.auth.getUser();
    const adminName = authUser?.user?.email || "admin";

    // 1. Create Applicant
    const { data: applicant, error: applicantError } = await supabase
      .from("za_demo_applicant")
      .insert({
        first_name: formData.get("applicant_first_name")?.toString(),
        last_name: formData.get("applicant_last_name")?.toString(),
        other_names: formData.get("applicant_other_names")?.toString() || null,
        gender: formData.get("applicant_gender")?.toString(),
        date_of_birth: formData.get("applicant_dob")?.toString() || null,
        status: "active",
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
        country: "Ghana",
        status: "active",
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
        occupation: formData.get("guardian_occupation")?.toString() || null,
        status: "active",
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
          average_score: formData.get("prev_school_score") ? parseFloat(formData.get("prev_school_score")!.toString()) : null,
          year_attended: formData.get("prev_school_year") ? parseInt(formData.get("prev_school_year")!.toString()) : null,
          status: "active",
        })
        .select()
        .single();

      if (!prevSchoolError && prevSchool) {
        prevSchoolId = prevSchool.id;
      }
    }

    // 5. Create Payment (optional)
    let paymentId = null;
    const paymentAmount = formData.get("payment_amount")?.toString();
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      const { data: payment, error: paymentError } = await supabase
        .from("za_demo_payment")
        .insert({
          payee_name: formData.get("payment_payee_name")?.toString() || `${applicant.first_name} ${applicant.last_name}`,
          amount: parseFloat(paymentAmount),
          payment_reference: formData.get("payment_reference")?.toString() || null,
          status: "pending",
          channel: formData.get("payment_channel")?.toString() || "cash",
          payment_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (!paymentError && payment) {
        paymentId = payment.id;
      }
    }

    // 6. Create Applying For (program/class selection)
    const { data: applyingFor, error: applyingError } = await supabase
      .from("za_demo_applying_for")
      .insert({
        class_id: formData.get("applying_class") ? parseInt(formData.get("applying_class")!.toString()) : null,
        department_id: formData.get("applying_department") ? parseInt(formData.get("applying_department")!.toString()) : null,
        academic_year_id: formData.get("academic_year") ? parseInt(formData.get("academic_year")!.toString()) : null,
        preferred_session: formData.get("preferred_session")?.toString() || "morning",
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

    if (admissionError) throw new Error(`Admission creation failed: ${admissionError.message}`);

    revalidatePath("/admin/admissions");
    return { success: true, admissionId: admission.id, applicationId };
  } catch (err: any) {
    console.error("Create admission error:", err);
    return { error: err.message };
  }
}

export async function reviewAdmission(admissionId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser } = await supabase.auth.getUser();
  const adminName = authUser?.user?.email || "admin";

  const { admission } = await getAdmissionById(admissionId);
  if (!admission) return { error: "Admission not found" };

  if (admission.timeline_id) {
    await supabase
      .from("za_demo_timeline")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminName,
        status: "reviewed",
      })
      .eq("id", admission.timeline_id);
  }

  const { error } = await supabase
    .from("za_demo_admission")
    .update({ status: "reviewing" })
    .eq("id", admissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admissions");
  return { success: true };
}

export async function approveAdmission(admissionId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser } = await supabase.auth.getUser();
  const adminName = authUser?.user?.email || "admin";

  const { admission } = await getAdmissionById(admissionId);
  if (!admission) return { error: "Admission not found" };

  if (admission.status === "approved") {
    return { error: "Admission already approved" };
  }

  if (admission.payment_id) {
    await supabase
      .from("za_demo_payment")
      .update({ status: "paid" })
      .eq("id", admission.payment_id);
  }

  if (admission.timeline_id) {
    await supabase
      .from("za_demo_timeline")
      .update({
        approved_at: new Date().toISOString(),
        approved_by: adminName,
        status: "approved",
      })
      .eq("id", admission.timeline_id);
  }

  const admissionNumber = await generateAdmissionNumber();
  const studentNumber = `${new Date().getFullYear()}/${(admission.id + 10000).toString().slice(1)}`;
  
  const { data: student, error: studentError } = await supabase
    .from("za_demo_student")
    .insert({
      student_number: studentNumber,
      first_name: admission.applicant.first_name,
      last_name: admission.applicant.last_name,
      other_names: admission.applicant.other_names || null,
      gender: admission.applicant.gender,
      date_of_birth: admission.applicant.date_of_birth,
      admission_number: admissionNumber,
      guardian_id: admission.guardian_id,
      contact_id: admission.contact_id,
      current_class_id: admission.applying_for_details?.class_id,
      enrollment_date: new Date().toISOString().split("T")[0],
      status: "active",
    })
    .select()
    .single();

  if (studentError) {
    return { error: `Student creation failed: ${studentError.message}` };
  }

  const { error } = await supabase
    .from("za_demo_admission")
    .update({ 
      status: "approved",
    })
    .eq("id", admissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admissions");
  return { success: true, studentId: student.id, admissionNumber };
}

export async function enrollStudent(admissionId: number, studentId: number, classId: number) {
  const supabase = await createSupabaseServerClient();

  const { error: studentError } = await supabase
    .from("za_demo_student")
    .update({
      status: "active",
      current_class_id: classId,
    })
    .eq("id", studentId);

  if (studentError) return { error: studentError.message };

  const { error } = await supabase
    .from("za_demo_admission")
    .update({ status: "enrolled" })
    .eq("id", admissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admissions");
  return { success: true };
}

export async function declineAdmission(admissionId: number, reason?: string) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser } = await supabase.auth.getUser();
  const adminName = authUser?.user?.email || "admin";

  const { admission } = await getAdmissionById(admissionId);
  if (!admission) return { error: "Admission not found" };

  if (admission.timeline_id) {
    await supabase
      .from("za_demo_timeline")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminName,
        rejected_at: new Date().toISOString(),
        rejected_by: adminName,
        rejected_reason: reason || null,
        status: "rejected",
      })
      .eq("id", admission.timeline_id);
  }

  const { error } = await supabase
    .from("za_demo_admission")
    .update({ status: "declined", remarks: reason || null })
    .eq("id", admissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admissions");
  return { success: true };
}

export async function deleteAdmission(admissionId: number) {
  const supabase = await createSupabaseServerClient();

  const { admission } = await getAdmissionById(admissionId);
  if (!admission) return { error: "Admission not found" };

  // Soft delete all related records
  if (admission.applicant_id) {
    await supabase
      .from("za_demo_applicant")
      .update({ deleted_at: new Date().toISOString(), status: "deleted" })
      .eq("id", admission.applicant_id);
  }
  if (admission.contact_id) {
    await supabase
      .from("za_demo_contact")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", admission.contact_id);
  }
  if (admission.guardian_id) {
    await supabase
      .from("za_demo_guardian")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", admission.guardian_id);
  }
  if (admission.prev_school_id) {
    await supabase
      .from("za_demo_previous_school")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", admission.prev_school_id);
  }
  if (admission.payment_id) {
    await supabase
      .from("za_demo_payment")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", admission.payment_id);
  }
  if (admission.timeline_id) {
    await supabase
      .from("za_demo_timeline")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", admission.timeline_id);
  }
  if (admission.applying_for_id) {
    await supabase
      .from("za_demo_applying_for")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", admission.applying_for_id);
  }

  const { error } = await supabase
    .from("za_demo_admission")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", admissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admissions");
  return { success: true };
}

export async function updateAdmission(admissionId: number, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const { admission } = await getAdmissionById(admissionId);
    if (!admission) throw new Error("Admission not found");

    if (admission.applicant_id) {
      await supabase
        .from("za_demo_applicant")
        .update({
          first_name: formData.get("applicant_first_name")?.toString(),
          last_name: formData.get("applicant_last_name")?.toString(),
          other_names: formData.get("applicant_other_names")?.toString() || null,
          gender: formData.get("applicant_gender")?.toString(),
          date_of_birth: formData.get("applicant_dob")?.toString() || null,
        })
        .eq("id", admission.applicant_id);
    }

    if (admission.contact_id) {
      await supabase
        .from("za_demo_contact")
        .update({
          email: formData.get("contact_email")?.toString() || null,
          phone: formData.get("contact_phone")?.toString() || null,
          address: formData.get("contact_address")?.toString() || null,
          city: formData.get("contact_city")?.toString() || null,
          town: formData.get("contact_town")?.toString() || null,
        })
        .eq("id", admission.contact_id);
    }

    if (admission.guardian_id) {
      await supabase
        .from("za_demo_guardian")
        .update({
          first_name: formData.get("guardian_first_name")?.toString(),
          last_name: formData.get("guardian_last_name")?.toString(),
          relationship: formData.get("guardian_relationship")?.toString(),
          email: formData.get("guardian_email")?.toString() || null,
          phone: formData.get("guardian_phone")?.toString() || null,
          occupation: formData.get("guardian_occupation")?.toString() || null,
        })
        .eq("id", admission.guardian_id);
    }

    if (admission.applying_for_id) {
      await supabase
        .from("za_demo_applying_for")
        .update({
          class_id: formData.get("applying_class") ? parseInt(formData.get("applying_class")!.toString()) : null,
          department_id: formData.get("applying_department") ? parseInt(formData.get("applying_department")!.toString()) : null,
          academic_year_id: formData.get("academic_year") ? parseInt(formData.get("academic_year")!.toString()) : null,
          preferred_session: formData.get("preferred_session")?.toString() || "morning",
        })
        .eq("id", admission.applying_for_id);
    }

    revalidatePath("/admin/admissions");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function bulkApproveAdmissions(admissionIds: number[]) {
  const results = [];
  for (const id of admissionIds) {
    const result = await approveAdmission(id);
    results.push(result);
  }
  
  revalidatePath("/admin/admissions");
  return { success: true, results };
}

export async function bulkDeclineAdmissions(admissionIds: number[], reason?: string) {
  const results = [];
  for (const id of admissionIds) {
    const result = await declineAdmission(id, reason);
    results.push(result);
  }
  
  revalidatePath("/admin/admissions");
  return { success: true, results };
}