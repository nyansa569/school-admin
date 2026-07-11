// // lib/actions/admin/fees.ts
// "use server";

// import { createSupabaseServerClient } from "@/lib/server";
// import { revalidatePath } from "next/cache";

// // =============================================
// // HELPER FUNCTIONS
// // =============================================

// async function getCurrentStaffId(supabase: any) {
//   const { data: authUser } = await supabase.auth.getUser();
//   if (!authUser?.user) return null;

//   const { data: staff } = await supabase
//     .from("za_demo_user")
//     .select("id")
//     .eq("user_id", authUser.user.id)
//     .single();

//   return staff?.id || null;
// }

// // =============================================
// // FEE STRUCTURE MANAGEMENT
// // =============================================

// export async function createFeeStructure(formData: FormData) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const feeData: any = {
//       class_id: parseInt(formData.get("class_id")!.toString()),
//       academic_year_id: parseInt(formData.get("academic_year_id")!.toString()),
//       amount: parseFloat(formData.get("amount")!.toString()),
//       fee_type: formData.get("fee_type")?.toString() || "tuition",
//       description: formData.get("description")?.toString() || null,
//       is_mandatory: formData.get("is_mandatory") === "true",
//       due_date: formData.get("due_date") ? new Date(formData.get("due_date")!.toString()).toISOString().split("T")[0] : null,
//       late_fee_amount: formData.get("late_fee_amount") ? parseFloat(formData.get("late_fee_amount")!.toString()) : 0,
//     };

//     // Handle term_id if provided
//     const termId = formData.get("term_id");
//     if (termId && termId.toString() !== "") {
//       feeData.term_id = parseInt(termId.toString());
//     }

//     // Handle fee_type_id if provided
//     const feeTypeId = formData.get("fee_type_id");
//     if (feeTypeId && feeTypeId.toString() !== "") {
//       feeData.fee_type_id = parseInt(feeTypeId.toString());
//     }

//     const { error } = await supabase.from("za_demo_fees").insert(feeData);
//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function updateFeeStructure(id: number, formData: FormData) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const updateData: any = {
//       amount: parseFloat(formData.get("amount")!.toString()),
//       fee_type: formData.get("fee_type")?.toString(),
//       description: formData.get("description")?.toString() || null,
//       is_mandatory: formData.get("is_mandatory") === "true",
//       due_date: formData.get("due_date") ? new Date(formData.get("due_date")!.toString()).toISOString().split("T")[0] : null,
//       late_fee_amount: formData.get("late_fee_amount") ? parseFloat(formData.get("late_fee_amount")!.toString()) : 0,
//       status: formData.get("status")?.toString() || "active",
//     };

//     const termId = formData.get("term_id");
//     if (termId && termId.toString() !== "") {
//       updateData.term_id = parseInt(termId.toString());
//     } else {
//       updateData.term_id = null;
//     }

//     const feeTypeId = formData.get("fee_type_id");
//     if (feeTypeId && feeTypeId.toString() !== "") {
//       updateData.fee_type_id = parseInt(feeTypeId.toString());
//     }

//     const { error } = await supabase
//       .from("za_demo_fees")
//       .update(updateData)
//       .eq("id", id);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function deleteFeeStructure(id: number) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const { error } = await supabase
//       .from("za_demo_fees")
//       .update({ deleted_at: new Date().toISOString(), status: "deleted" })
//       .eq("id", id);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function getFeeStructures(classId?: number, academicYearId?: number, termId?: number) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase
//     .from("za_demo_fees")
//     .select(`
//       *,
//       class:class_id (id, name, level, section),
//       academic_year:academic_year_id (id, year, start_date, end_date),
//       term:term_id (id, term_number, name, start_date, end_date),
//       fee_type_ref:fee_type_id (id, name, code)
//     `)
//     .is("deleted_at", null)
//     .order("created_at", { ascending: false });

//   if (classId) query = query.eq("class_id", classId);
//   if (academicYearId) query = query.eq("academic_year_id", academicYearId);
//   if (termId) query = query.eq("term_id", termId);

//   const { data: fees, error } = await query;
//   if (error) return { error: error.message };

//   return { fees: fees || [] };
// }

// // =============================================
// // BULK FEE ASSIGNMENT TO STUDENTS
// // =============================================

// export async function bulkAssignFeesToClass(
//   classId: number,
//   academicYearId: number,
//   termId: number | null,
//   amount: number,
//   feeTypeId?: number,
//   feeType?: string,
//   dueDate?: string,
//   scholarshipType?: string,
//   discountPercentage?: number
// ) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     // Get all active students in the class
//     const { data: students, error: studentsError } = await supabase
//       .from("za_demo_student")
//       .select("id, student_number, first_name, last_name")
//       .eq("current_class_id", classId)
//       .eq("status", "active")
//       .is("deleted_at", null);

//     if (studentsError) throw new Error(studentsError.message);
//     if (!students || students.length === 0) {
//       return { error: "No active students found in this class" };
//     }

//     // Check for existing fees to avoid duplicates
//     let existingQuery = supabase
//       .from("za_demo_student_fees")
//       .select("student_id")
//       .eq("class_id", classId)
//       .eq("academic_year_id", academicYearId);

//     if (termId) {
//       existingQuery = existingQuery.eq("term_id", termId);
//     }

//     const { data: existingFees } = await existingQuery;
//     const existingStudentIds = new Set(existingFees?.map(f => f.student_id) || []);

//     // Calculate discounted amount
//     let discountedAmount = amount;
//     let finalDiscountPercentage = discountPercentage || 0;
//     let finalScholarshipType = scholarshipType || "none";

//     if (scholarshipType === "full") {
//       discountedAmount = 0;
//       finalDiscountPercentage = 100;
//     } else if (scholarshipType === "partial" && discountPercentage) {
//       discountedAmount = amount * (1 - discountPercentage / 100);
//     }

//     // Prepare fee records for new students
//     const newFees = students
//       .filter(s => !existingStudentIds.has(s.id))
//       .map(student => ({
//         student_id: student.id,
//         class_id: classId,
//         academic_year_id: academicYearId,
//         term_id: termId,
//         fee_type_id: feeTypeId || null,
//         fee_type: feeType || "tuition",
//         original_amount: amount,
//         discounted_amount: discountedAmount !== amount ? discountedAmount : null,
//         discount_percentage: finalDiscountPercentage,
//         scholarship_type: finalScholarshipType,
//         paid_amount: 0,
//         arrears: 0,
//         balance: discountedAmount,
//         due_date: dueDate || null,
//         status: "pending",
//         created_by: staffId,
//       }));

//     if (newFees.length > 0) {
//       const { error: insertError } = await supabase
//         .from("za_demo_student_fees")
//         .insert(newFees);

//       if (insertError) throw new Error(insertError.message);
//     }

//     revalidatePath("/admin/fees");
//     return { success: true, assignedCount: newFees.length, totalStudents: students.length };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // INDIVIDUAL STUDENT FEE ASSIGNMENT
// // =============================================

// export async function assignStudentFee(
//   studentId: number,
//   classId: number,
//   academicYearId: number,
//   termId: number | null,
//   amount: number,
//   feeTypeId?: number,
//   feeType?: string,
//   dueDate?: string,
//   scholarshipType?: string,
//   discountPercentage?: number,
//   arrears?: number,
//   arrearsReason?: string
// ) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     // Calculate discounted amount
//     let discountedAmount = amount;
//     let finalDiscountPercentage = discountPercentage || 0;
//     let finalScholarshipType = scholarshipType || "none";
//     let finalArrears = arrears || 0;

//     if (scholarshipType === "full") {
//       discountedAmount = 0;
//       finalDiscountPercentage = 100;
//     } else if (scholarshipType === "partial" && discountPercentage) {
//       discountedAmount = amount * (1 - discountPercentage / 100);
//     }

//     const totalAmount = discountedAmount + finalArrears;
//     const balance = totalAmount; // Initially unpaid

//     const { error } = await supabase.from("za_demo_student_fees").insert({
//       student_id: studentId,
//       class_id: classId,
//       academic_year_id: academicYearId,
//       term_id: termId,
//       fee_type_id: feeTypeId || null,
//       fee_type: feeType || "tuition",
//       original_amount: amount,
//       discounted_amount: discountedAmount !== amount ? discountedAmount : null,
//       discount_percentage: finalDiscountPercentage,
//       scholarship_type: finalScholarshipType,
//       arrears: finalArrears,
//       arrears_reason: arrearsReason || null,
//       paid_amount: 0,
//       balance: balance,
//       due_date: dueDate || null,
//       status: "pending",
//       created_by: staffId,
//     });

//     if (error) throw new Error(error.message);

//     revalidatePath(`/admin/fees/students/${studentId}`);
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // ADD ARREARS TO EXISTING STUDENT FEE
// // =============================================

// export async function addArrearsToStudentFee(
//   studentFeeId: number,
//   arrearsAmount: number,
//   reason: string
// ) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     // Get current fee record
//     const { data: fee, error: fetchError } = await supabase
//       .from("za_demo_student_fees")
//       .select("arrears, balance, paid_amount, discounted_amount, original_amount")
//       .eq("id", studentFeeId)
//       .single();

//     if (fetchError) throw new Error(fetchError.message);

//     const newArrears = fee.arrears + arrearsAmount;
//     const totalAmount = (fee.discounted_amount || fee.original_amount) + newArrears;
//     const newBalance = totalAmount - fee.paid_amount;

//     const { error } = await supabase
//       .from("za_demo_student_fees")
//       .update({
//         arrears: newArrears,
//         arrears_reason: reason,
//         arrears_approved_by: staffId,
//         balance: newBalance,
//         status: newBalance <= 0 ? "paid" : fee.paid_amount > 0 ? "partial" : "pending",
//       })
//       .eq("id", studentFeeId);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true, newArrears, newBalance };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // RECORD PAYMENT
// // =============================================

// export async function recordPayment(
//   studentFeeId: number,
//   studentId: number,
//   amount: number,
//   paymentMethod: string,
//   paymentReference?: string,
//   notes?: string
// ) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     // Get current fee record
//     const { data: studentFee, error: feeError } = await supabase
//       .from("za_demo_student_fees")
//       .select("paid_amount, balance, original_amount, discounted_amount, arrears")
//       .eq("id", studentFeeId)
//       .single();

//     if (feeError) throw new Error(feeError.message);

//     // Calculate new amounts
//     const newPaidAmount = studentFee.paid_amount + amount;
//     const newBalance = studentFee.balance - amount;
//     const newStatus = newBalance <= 0 ? "paid" : newBalance < studentFee.balance ? "partial" : "pending";

//     // Generate receipt number
//     const receiptNumber = `RCP-${Date.now()}-${studentId}-${Math.floor(Math.random() * 1000)}`;

//     // Insert payment record
//     const { error: paymentError } = await supabase.from("za_demo_fee_payments").insert({
//       student_fee_id: studentFeeId,
//       student_id: studentId,
//       amount,
//       payment_date: new Date().toISOString().split("T")[0],
//       payment_method: paymentMethod,
//       payment_reference: paymentReference || null,
//       receipt_number: receiptNumber,
//       notes: notes || null,
//       recorded_by: staffId,
//     });

//     if (paymentError) throw new Error(paymentError.message);

//     // Update student fee record (balance updates automatically via trigger)
//     const { error: updateError } = await supabase
//       .from("za_demo_student_fees")
//       .update({
//         paid_amount: newPaidAmount,
//         status: newStatus,
//       })
//       .eq("id", studentFeeId);

//     if (updateError) throw new Error(updateError.message);

//     // If fully paid, update student status if it was suspended
//     if (newBalance <= 0) {
//       const { data: studentFees } = await supabase
//         .from("za_demo_student_fees")
//         .select("id")
//         .eq("student_id", studentId)
//         .neq("status", "paid")
//         .not("balance", "eq", 0);

//       if (!studentFees || studentFees.length === 0) {
//         await supabase
//           .from("za_demo_student")
//           .update({ status: "active" })
//           .eq("id", studentId);
//       }
//     }

//     revalidatePath(`/admin/fees/students/${studentId}`);
//     revalidatePath("/admin/fees/payments");
//     return { success: true, receiptNumber };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // GET STUDENT FEE INFORMATION
// // =============================================

// export async function getStudentPaymentHistory(studentId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: payments, error } = await supabase
//     .from("za_demo_fee_payments")
//     .select(`
//       *,
//       student_fee:student_fee_id (
//         id,
//         class_id,
//         academic_year_id,
//         term_id,
//         original_amount,
//         discounted_amount,
//         arrears,
//         balance,
//         class:class_id (id, name),
//         academic_year:academic_year_id (id, year),
//         term:term_id (id, term_number, name)
//       ),
//       recorded_by_staff:recorded_by (id, first_name, last_name)
//     `)
//     .eq("student_id", studentId)
//     .order("created_at", { ascending: false });

//   if (error) return { error: error.message };
//   return { payments: payments || [] };
// }

// export async function getStudentFeeSummary(studentId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: fees, error } = await supabase
//     .from("za_demo_student_fees")
//     .select(`
//       *,
//       class:class_id (id, name, level),
//       academic_year:academic_year_id (id, year),
//       term:term_id (id, term_number, name),
//       fee_type:fee_type_id (id, name, code)
//     `)
//     .eq("student_id", studentId)
//     .order("academic_year_id", { ascending: false })
//     .order("term_id", { ascending: true });

//   if (error) return { error: error.message };

//   const totalOwed = fees.reduce((sum, f) => sum + (f.discounted_amount || f.original_amount) + (f.arrears || 0), 0);
//   const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
//   const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0);
//   const totalArrears = fees.reduce((sum, f) => sum + (f.arrears || 0), 0);
//   const hasOutstanding = fees.some(f => f.balance > 0);

//   return {
//     fees: fees || [],
//     summary: {
//       totalOwed,
//       totalPaid,
//       totalBalance,
//       totalArrears,
//       hasOutstanding,
//       activeFees: fees.filter(f => f.status !== "paid").length,
//       paidFees: fees.filter(f => f.status === "paid").length,
//     },
//   };
// }

// // =============================================
// // CLASS FEE STATUS & REPORTS
// // =============================================

// export async function getClassFeeStatus(classId: number, academicYearId?: number, termId?: number) {
//   const supabase = await createSupabaseServerClient();

//   // Get all active students in class
//   let studentsQuery = supabase
//     .from("za_demo_student")
//     .select("id, first_name, last_name, other_names, admission_number, student_number, status")
//     .eq("current_class_id", classId)
//     .eq("status", "active")
//     .is("deleted_at", null);

//   const { data: students, error: studentsError } = await studentsQuery;
//   if (studentsError) return { error: studentsError.message };

//   if (!students || students.length === 0) {
//     return { students: [] };
//   }

//   // Get fees for these students
//   let feesQuery = supabase
//     .from("za_demo_student_fees")
//     .select(`
//       id,
//       student_id,
//       academic_year_id,
//       term_id,
//       original_amount,
//       discounted_amount,
//       arrears,
//       paid_amount,
//       balance,
//       status,
//       due_date,
//       scholarship_type,
//       academic_year:academic_year_id (id, year),
//       term:term_id (id, term_number, name)
//     `)
//     .in("student_id", students.map(s => s.id));

//   if (academicYearId) {
//     feesQuery = feesQuery.eq("academic_year_id", academicYearId);
//   }
//   if (termId) {
//     feesQuery = feesQuery.eq("term_id", termId);
//   }

//   const { data: fees, error: feesError } = await feesQuery;
//   if (feesError) return { error: feesError.message };

//   // Group fees by student
//   const feesByStudent = new Map();
//   fees?.forEach(fee => {
//     if (!feesByStudent.has(fee.student_id)) {
//       feesByStudent.set(fee.student_id, []);
//     }
//     feesByStudent.get(fee.student_id).push(fee);
//   });

//   // Build student fee status
//   const studentFeeStatus = students.map(student => {
//     const studentFees = feesByStudent.get(student.id) || [];
//     const totalOwed = studentFees.reduce((sum: number, f: any) => sum + (f.discounted_amount || f.original_amount) + (f.arrears || 0), 0);
//     const totalPaid = studentFees.reduce((sum: number, f: any) => sum + f.paid_amount, 0);
//     const totalBalance = studentFees.reduce((sum: number, f: any) => sum + f.balance, 0);
//     const totalArrears = studentFees.reduce((sum: number, f: any) => sum + (f.arrears || 0), 0);
//     const hasPartial = studentFees.some((f: any) => f.balance > 0 && f.paid_amount > 0);
//     const isOverdue = studentFees.some((f: any) => f.due_date && f.balance > 0 && new Date(f.due_date) < new Date());

//     return {
//       ...student,
//       full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
//       fee_summary: {
//         totalOwed,
//         totalPaid,
//         totalBalance,
//         totalArrears,
//         hasPartial,
//         isOverdue,
//         fee_count: studentFees.length,
//       },
//       student_fees: studentFees,
//     };
//   });

//   return { students: studentFeeStatus };
// }

// // =============================================
// // FEE TRANSACTIONS & STATISTICS
// // =============================================

// export async function getAllFeesTransactions(
//   page: number = 1,
//   pageSize: number = 20,
//   filters?: {
//     studentId?: number;
//     classId?: number;
//     status?: string;
//     fromDate?: string;
//     toDate?: string;
//   }
// ) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase
//     .from("za_demo_fee_payments")
//     .select(`
//       *,
//       student:student_id (id, first_name, last_name, admission_number, student_number),
//       recorded_by_staff:recorded_by (id, first_name, last_name),
//       student_fee:student_fee_id (
//         class_id,
//         academic_year_id,
//         term_id,
//         class:class_id (id, name),
//         academic_year:academic_year_id (id, year),
//         term:term_id (id, term_number, name)
//       )
//     `, { count: "exact" })
//     .order("created_at", { ascending: false })
//     .range((page - 1) * pageSize, page * pageSize - 1);

//   if (filters?.studentId) query = query.eq("student_id", filters.studentId);
//   if (filters?.classId) query = query.eq("student_fee.class_id", filters.classId);
//   if (filters?.fromDate) query = query.gte("payment_date", filters.fromDate);
//   if (filters?.toDate) query = query.lte("payment_date", filters.toDate);

//   const { data: payments, error, count } = await query;
//   if (error) return { error: error.message };

//   return { payments: payments || [], total: count || 0 };
// }

// export async function getFeeStatistics(academicYearId?: number, termId?: number) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase.from("za_demo_student_fees").select(`
//     balance,
//     paid_amount,
//     original_amount,
//     discounted_amount,
//     arrears,
//     status
//   `);

//   if (academicYearId) {
//     query = query.eq("academic_year_id", academicYearId);
//   }
//   if (termId) {
//     query = query.eq("term_id", termId);
//   }

//   const { data: fees, error } = await query;
//   if (error) return { error: error.message };

//   if (!fees || fees.length === 0) {
//     return {
//       stats: {
//         totalExpected: 0,
//         totalPaid: 0,
//         totalOutstanding: 0,
//         totalArrears: 0,
//         collectionRate: "0",
//         fullyPaid: 0,
//         partiallyPaid: 0,
//         pending: 0,
//         totalRecords: 0,
//       },
//     };
//   }

//   const totalExpected = fees.reduce((sum, f) => sum + (f.discounted_amount || f.original_amount), 0);
//   const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
//   const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);
//   const totalArrears = fees.reduce((sum, f) => sum + (f.arrears || 0), 0);
//   const collectionRate = totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : "0";

//   const fullyPaid = fees.filter(f => f.status === "paid").length;
//   const partiallyPaid = fees.filter(f => f.status === "partial").length;
//   const pending = fees.filter(f => f.status === "pending").length;

//   return {
//     stats: {
//       totalExpected,
//       totalPaid,
//       totalOutstanding,
//       totalArrears,
//       collectionRate,
//       fullyPaid,
//       partiallyPaid,
//       pending,
//       totalRecords: fees.length,
//     },
//   };
// }

// // =============================================
// // DISCOUNT MANAGEMENT
// // =============================================

// export async function applyStudentDiscount(
//   studentFeeId: number,
//   discountPercentage: number,
//   reason?: string
// ) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     const { data: fee, error: feeError } = await supabase
//       .from("za_demo_student_fees")
//       .select("original_amount, paid_amount, balance, arrears")
//       .eq("id", studentFeeId)
//       .single();

//     if (feeError) throw new Error(feeError.message);

//     const newDiscountedAmount = fee.original_amount * (1 - discountPercentage / 100);
//     const totalAmount = newDiscountedAmount + (fee.arrears || 0);
//     const newBalance = totalAmount - fee.paid_amount;

//     const { error } = await supabase
//       .from("za_demo_student_fees")
//       .update({
//         discounted_amount: newDiscountedAmount,
//         discount_percentage: discountPercentage,
//         scholarship_type: discountPercentage >= 100 ? "full" : discountPercentage > 0 ? "partial" : "none",
//         balance: newBalance,
//         status: newBalance <= 0 ? "paid" : fee.paid_amount > 0 ? "partial" : "pending",
//       })
//       .eq("id", studentFeeId);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // STUDENT STATUS MANAGEMENT
// // =============================================

// export async function updateStudentFeeStatus(studentId: number, status: "active" | "inactive" | "suspended") {
//   const supabase = await createSupabaseServerClient();

//   const { error } = await supabase
//     .from("za_demo_student")
//     .update({ status })
//     .eq("id", studentId);

//   if (error) return { error: error.message };

//   revalidatePath(`/admin/fees/students/${studentId}`);
//   return { success: true };
// }

// // =============================================
// // LOOKUP DATA FETCHERS
// // =============================================

// export async function getClasses() {
//   const supabase = await createSupabaseServerClient();

//   const { data: classes, error } = await supabase
//     .from("za_demo_class")
//     .select("id, name, level, section, sequence")
//     .eq("status", "active")
//     .is("deleted_at", null)
//     .order("sequence", { ascending: true });

//   if (error) return { error: error.message };
//   return { classes: classes || [] };
// }

// export async function getAcademicYears() {
//   const supabase = await createSupabaseServerClient();

//   const { data: years, error } = await supabase
//     .from("za_demo_academic_year")
//     .select("id, year, name, is_active, start_date, end_date, status")
//     .order("year", { ascending: false });

//   if (error) return { error: error.message };
//   return { years: years || [] };
// }

// export async function getTerms(academicYearId?: number) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase
//     .from("za_demo_term")
//     .select("id, term_number, name, start_date, end_date, is_active, academic_year_id")
//     .eq("status", "active");

//   if (academicYearId) {
//     query = query.eq("academic_year_id", academicYearId);
//   }

//   const { data: terms, error } = await query;
//   if (error) return { error: error.message };
//   return { terms: terms || [] };
// }

// export async function getFeeTypes() {
//   const supabase = await createSupabaseServerClient();

//   const { data: feeTypes, error } = await supabase
//     .from("za_demo_fee_type")
//     .select("id, name, code, is_active")
//     .eq("is_active", true)
//     .order("name", { ascending: true });

//   if (error) return { error: error.message };
//   return { feeTypes: feeTypes || [] };
// }

// export async function getStudentsByClass(classId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: students, error } = await supabase
//     .from("za_demo_student")
//     .select("id, first_name, last_name, other_names, admission_number, student_number")
//     .eq("current_class_id", classId)
//     .eq("status", "active")
//     .is("deleted_at", null)
//     .order("first_name", { ascending: true });

//   if (error) return { error: error.message };

//   const formattedStudents = students?.map(s => ({
//     ...s,
//     full_name: `${s.first_name} ${s.last_name}${s.other_names ? ` ${s.other_names}` : ''}`
//   })) || [];

//   return { students: formattedStudents };
// }

// export async function getStudentById(studentId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: student, error } = await supabase
//     .from("za_demo_student")
//     .select(`
//       *,
//       guardian:guardian_id (id, first_name, last_name, email, phone),
//       contact:contact_id (id, email, phone, address),
//       current_class:current_class_id (id, name, level)
//     `)
//     .eq("id", studentId)
//     .single();

//   if (error) return { error: error.message };
//   return { student };
// }

// // =============================================
// // EXTRA FEE MANAGEMENT
// // =============================================

// export async function createExtraFee(data: {
//   studentId: number;
//   feeTypeId: number;
//   academicYearId: number;
//   termId?: number;
//   amount: number;
//   description?: string;
//   frequency: "daily" | "weekly" | "monthly" | "termly" | "one-time";
//   dueDate?: string;
//   createdBy?: number;
// }) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     const { error } = await supabase.from("za_demo_extra_fees").insert({
//       student_id: data.studentId,
//       fee_type_id: data.feeTypeId,
//       academic_year_id: data.academicYearId,
//       term_id: data.termId || null,
//       amount: data.amount,
//       description: data.description || null,
//       frequency: data.frequency,
//       due_date: data.dueDate || null,
//       balance: data.amount,
//       status: "pending",
//       created_by: staffId,
//     });

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function getExtraFeeById(extraFeeId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: fee, error } = await supabase
//     .from("za_demo_extra_fees")
//     .select(`
//       *,
//       student:student_id (
//         id,
//         first_name,
//         last_name,
//         other_names,
//         admission_number,
//         student_number
//       ),
//       fee_type:fee_type_id (
//         id,
//         name,
//         code,
//         description
//       ),
//       academic_year:academic_year_id (
//         id,
//         year,
//         name
//       ),
//       term:term_id (
//         id,
//         term_number,
//         name
//       )
//     `)
//     .eq("id", extraFeeId)
//     .is("deleted_at", null)
//     .single();

//   if (error) return { error: error.message };
//   return { fee };
// }

// export async function updateExtraFee(
//   extraFeeId: number,
//   data: {
//     amount?: number;
//     description?: string;
//     frequency?: string;
//     dueDate?: string;
//     status?: string;
//   }
// ) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const updateData: any = {};
//     if (data.amount !== undefined) updateData.amount = data.amount;
//     if (data.description !== undefined) updateData.description = data.description;
//     if (data.frequency !== undefined) updateData.frequency = data.frequency;
//     if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
//     if (data.status !== undefined) updateData.status = data.status;

//     const { error } = await supabase
//       .from("za_demo_extra_fees")
//       .update(updateData)
//       .eq("id", extraFeeId);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // =============================================
// // EXTRA FEE PAYMENTS
// // =============================================

// export async function recordExtraFeePayment(data: {
//   extraFeeId: number;
//   studentId: number;
//   amount: number;
//   paymentMethod: string;
//   paymentReference?: string;
//   notes?: string;
// }) {
//   const supabase = await createSupabaseServerClient();
//   const staffId = await getCurrentStaffId(supabase);

//   if (!staffId) return { error: "Staff not authenticated" };

//   try {
//     // Get current fee record
//     const { data: extraFee, error: feeError } = await supabase
//       .from("za_demo_extra_fees")
//       .select("amount, paid_amount, balance")
//       .eq("id", data.extraFeeId)
//       .single();

//     if (feeError) throw new Error(feeError.message);

//     // Calculate new amounts
//     const newPaidAmount = (extraFee.paid_amount || 0) + data.amount;
//     const newBalance = extraFee.amount - newPaidAmount;
//     const newStatus = newBalance <= 0 ? "paid" : newBalance < extraFee.amount ? "partial" : "pending";

//     // Generate receipt number
//     const receiptNumber = `EXT-${Date.now()}-${data.studentId}-${Math.floor(Math.random() * 1000)}`;

//     // Insert payment record
//     const { error: paymentError } = await supabase.from("za_demo_extra_fee_payments").insert({
//       extra_fee_id: data.extraFeeId,
//       student_id: data.studentId,
//       amount: data.amount,
//       payment_date: new Date().toISOString().split("T")[0],
//       payment_method: data.paymentMethod,
//       payment_reference: data.paymentReference || null,
//       receipt_number: receiptNumber,
//       notes: data.notes || null,
//       recorded_by: staffId,
//       type: "Extra Fee",
//     });

//     if (paymentError) throw new Error(paymentError.message);

//     // Update extra fee record
//     const { error: updateError } = await supabase
//       .from("za_demo_extra_fees")
//       .update({
//         paid_amount: newPaidAmount,
//         balance: newBalance,
//         status: newStatus,
//       })
//       .eq("id", data.extraFeeId);

//     if (updateError) throw new Error(updateError.message);

//     revalidatePath("/admin/fees");
//     return { success: true, receiptNumber };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function getExtraFeePayments(
//   extraFeeId?: number,
//   studentId?: number,
//   limit: number = 100
// ) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase
//     .from("za_demo_extra_fee_payments")
//     .select(`
//       *,
//       student:student_id (
//         id,
//         first_name,
//         last_name,
//         other_names,
//         admission_number,
//         student_number
//       ),
//       extra_fee:extra_fee_id (
//         id,
//         amount,
//         description,
//         frequency,
//         status
//       ),
//       recorded_by_staff:recorded_by (
//         id,
//         first_name,
//         last_name
//       )
//     `)
//     .order("created_at", { ascending: false })
//     .limit(limit);

//   if (extraFeeId) query = query.eq("extra_fee_id", extraFeeId);
//   if (studentId) query = query.eq("student_id", studentId);

//   const { data: payments, error } = await query;
//   if (error) return { error: error.message };
//   return { payments: payments || [] };
// }

// export async function getExtraFeeSummary(studentId: number) {
//   const supabase = await createSupabaseServerClient();

//   const { data: fees, error } = await supabase
//     .from("za_demo_extra_fees")
//     .select(`
//       *,
//       fee_type:fee_type_id (
//         id,
//         name,
//         code
//       ),
//       academic_year:academic_year_id (
//         id,
//         year,
//         name
//       ),
//       term:term_id (
//         id,
//         term_number,
//         name
//       )
//     `)
//     .eq("student_id", studentId)
//     .is("deleted_at", null)
//     .order("created_at", { ascending: false });

//   if (error) return { error: error.message };

//   const totalOwed = fees.reduce((sum, f) => sum + f.amount, 0);
//   const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
//   const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0);
//   const hasOutstanding = fees.some(f => f.balance > 0);

//   return {
//     fees: fees || [],
//     summary: {
//       totalOwed,
//       totalPaid,
//       totalBalance,
//       hasOutstanding,
//       activeFees: fees.filter(f => f.status !== "paid").length,
//       paidFees: fees.filter(f => f.status === "paid").length,
//     },
//   };
// }

// export async function getExtraFeeStatistics(academicYearId?: number, termId?: number) {
//   const supabase = await createSupabaseServerClient();

//   let query = supabase.from("za_demo_extra_fees").select(`
//     amount,
//     paid_amount,
//     balance,
//     status
//   `);

//   if (academicYearId) {
//     query = query.eq("academic_year_id", academicYearId);
//   }
//   if (termId) {
//     query = query.eq("term_id", termId);
//   }

//   const { data: fees, error } = await query;
//   if (error) return { error: error.message };

//   if (!fees || fees.length === 0) {
//     return {
//       stats: {
//         totalExpected: 0,
//         totalPaid: 0,
//         totalOutstanding: 0,
//         collectionRate: "0",
//         fullyPaid: 0,
//         partiallyPaid: 0,
//         pending: 0,
//         totalRecords: 0,
//       },
//     };
//   }

//   const totalExpected = fees.reduce((sum, f) => sum + f.amount, 0);
//   const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
//   const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);
//   const collectionRate = totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : "0";

//   const fullyPaid = fees.filter(f => f.status === "paid").length;
//   const partiallyPaid = fees.filter(f => f.status === "partial").length;
//   const pending = fees.filter(f => f.status === "pending").length;

//   return {
//     stats: {
//       totalExpected,
//       totalPaid,
//       totalOutstanding,
//       collectionRate,
//       fullyPaid,
//       partiallyPaid,
//       pending,
//       totalRecords: fees.length,
//     },
//   };
// }

// // =============================================
// // FEE TYPE MANAGEMENT (for extra fees)
// // =============================================

// export async function createFeeType(data: {
//   name: string;
//   code: string;
//   description?: string;
// }) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const { error } = await supabase.from("za_demo_fee_type").insert({
//       name: data.name,
//       code: data.code,
//       description: data.description || null,
//       is_active: true,
//     });

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function updateFeeType(id: number, data: {
//   name?: string;
//   code?: string;
//   description?: string;
//   is_active?: boolean;
// }) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const { error } = await supabase
//       .from("za_demo_fee_type")
//       .update(data)
//       .eq("id", id);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// export async function deleteFeeType(id: number) {
//   const supabase = await createSupabaseServerClient();

//   try {
//     const { error } = await supabase
//       .from("za_demo_fee_type")
//       .update({ deleted_at: new Date().toISOString(), is_active: false })
//       .eq("id", id);

//     if (error) throw new Error(error.message);

//     revalidatePath("/admin/fees");
//     return { success: true };
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// lib/actions/admin/fees.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// HELPER FUNCTIONS
// =============================================

async function getCurrentStaffId(supabase: any) {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) return null;

  const { data: staff } = await supabase
    .from("za_demo_user")
    .select("id")
    .eq("user_id", authUser.user.id)
    .single();

  return staff?.id || null;
}

// =============================================
// FEE STRUCTURE MANAGEMENT
// =============================================

export async function createFeeStructure(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const feeData: any = {
      class_id: parseInt(formData.get("class_id")!.toString()),
      academic_year_id: parseInt(formData.get("academic_year_id")!.toString()),
      amount: parseFloat(formData.get("amount")!.toString()),
      fee_type: formData.get("fee_type")?.toString() || "tuition",
      description: formData.get("description")?.toString() || null,
      is_mandatory: formData.get("is_mandatory") === "true",
      due_date: formData.get("due_date")
        ? new Date(formData.get("due_date")!.toString())
            .toISOString()
            .split("T")[0]
        : null,
      late_fee_amount: formData.get("late_fee_amount")
        ? parseFloat(formData.get("late_fee_amount")!.toString())
        : 0,
    };

    const termId = formData.get("term_id");
    if (termId && termId.toString() !== "") {
      feeData.term_id = parseInt(termId.toString());
    }

    const feeTypeId = formData.get("fee_type_id");
    if (feeTypeId && feeTypeId.toString() !== "") {
      feeData.fee_type_id = parseInt(feeTypeId.toString());
    }

    const { error } = await supabase.from("za_demo_fees").insert(feeData);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateFeeStructure(id: number, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const updateData: any = {
      amount: parseFloat(formData.get("amount")!.toString()),
      fee_type: formData.get("fee_type")?.toString(),
      description: formData.get("description")?.toString() || null,
      is_mandatory: formData.get("is_mandatory") === "true",
      due_date: formData.get("due_date")
        ? new Date(formData.get("due_date")!.toString())
            .toISOString()
            .split("T")[0]
        : null,
      late_fee_amount: formData.get("late_fee_amount")
        ? parseFloat(formData.get("late_fee_amount")!.toString())
        : 0,
      status: formData.get("status")?.toString() || "active",
    };

    const termId = formData.get("term_id");
    if (termId && termId.toString() !== "") {
      updateData.term_id = parseInt(termId.toString());
    } else {
      updateData.term_id = null;
    }

    const feeTypeId = formData.get("fee_type_id");
    if (feeTypeId && feeTypeId.toString() !== "") {
      updateData.fee_type_id = parseInt(feeTypeId.toString());
    }

    const { error } = await supabase
      .from("za_demo_fees")
      .update(updateData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteFeeStructure(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_fees")
      .update({ deleted_at: new Date().toISOString(), status: "deleted" })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getFeeStructures(
  classId?: number,
  academicYearId?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_fees")
    .select(
      `
      *,
      class:class_id (id, name, level, section),
      academic_year:academic_year_id (id, year, start_date, end_date),
      term:term_id (id, term_number, name, start_date, end_date),
      fee_type_ref:fee_type_id (id, name, code)
    `,
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (classId) query = query.eq("class_id", classId);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: fees, error } = await query;
  if (error) return { error: error.message };

  return { fees: fees || [] };
}

// =============================================
// BULK FEE ASSIGNMENT TO STUDENTS
// =============================================

export async function bulkAssignFeesToClass(
  classId: number,
  academicYearId: number,
  termId: number | null,
  amount: number,
  feeTypeId?: number,
  feeType?: string,
  dueDate?: string,
  scholarshipType?: string,
  discountPercentage?: number,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: students, error: studentsError } = await supabase
      .from("za_demo_student")
      .select("id, student_number, first_name, last_name")
      .eq("current_class_id", classId)
      .eq("status", "active")
      .is("deleted_at", null);

    if (studentsError) throw new Error(studentsError.message);
    if (!students || students.length === 0) {
      return { error: "No active students found in this class" };
    }

    let existingQuery = supabase
      .from("za_demo_student_fees")
      .select("student_id")
      .eq("class_id", classId)
      .eq("academic_year_id", academicYearId);

    if (termId) {
      existingQuery = existingQuery.eq("term_id", termId);
    }

    const { data: existingFees } = await existingQuery;
    const existingStudentIds = new Set(
      existingFees?.map((f) => f.student_id) || [],
    );

    let discountedAmount = amount;
    let finalDiscountPercentage = discountPercentage || 0;
    let finalScholarshipType = scholarshipType || "none";

    if (scholarshipType === "full") {
      discountedAmount = 0;
      finalDiscountPercentage = 100;
    } else if (scholarshipType === "partial" && discountPercentage) {
      discountedAmount = amount * (1 - discountPercentage / 100);
    }

    const newFees = students
      .filter((s) => !existingStudentIds.has(s.id))
      .map((student) => ({
        student_id: student.id,
        class_id: classId,
        academic_year_id: academicYearId,
        term_id: termId,
        fee_type_id: feeTypeId || null,
        fee_type: feeType || "tuition",
        original_amount: amount,
        discounted_amount:
          discountedAmount !== amount ? discountedAmount : null,
        discount_percentage: finalDiscountPercentage,
        scholarship_type: finalScholarshipType,
        paid_amount: 0,
        arrears: 0,
        balance: discountedAmount,
        due_date: dueDate || null,
        status: "pending",
        created_by: staffId,
      }));

    if (newFees.length > 0) {
      const { error: insertError } = await supabase
        .from("za_demo_student_fees")
        .insert(newFees);

      if (insertError) throw new Error(insertError.message);
    }

    revalidatePath("/admin/fees");
    return {
      success: true,
      assignedCount: newFees.length,
      totalStudents: students.length,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// INDIVIDUAL STUDENT FEE ASSIGNMENT
// =============================================

export async function assignStudentFee(
  studentId: number,
  classId: number,
  academicYearId: number,
  termId: number | null,
  amount: number,
  feeTypeId?: number,
  feeType?: string,
  dueDate?: string,
  scholarshipType?: string,
  discountPercentage?: number,
  arrears?: number,
  arrearsReason?: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    let discountedAmount = amount;
    let finalDiscountPercentage = discountPercentage || 0;
    let finalScholarshipType = scholarshipType || "none";
    let finalArrears = arrears || 0;

    if (scholarshipType === "full") {
      discountedAmount = 0;
      finalDiscountPercentage = 100;
    } else if (scholarshipType === "partial" && discountPercentage) {
      discountedAmount = amount * (1 - discountPercentage / 100);
    }

    const totalAmount = discountedAmount + finalArrears;
    const balance = totalAmount;

    const { error } = await supabase.from("za_demo_student_fees").insert({
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      term_id: termId,
      fee_type_id: feeTypeId || null,
      fee_type: feeType || "tuition",
      original_amount: amount,
      discounted_amount: discountedAmount !== amount ? discountedAmount : null,
      discount_percentage: finalDiscountPercentage,
      scholarship_type: finalScholarshipType,
      arrears: finalArrears,
      arrears_reason: arrearsReason || null,
      paid_amount: 0,
      balance: balance,
      due_date: dueDate || null,
      status: "pending",
      created_by: staffId,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/fees/students/${studentId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// ADD ARREARS TO EXISTING STUDENT FEE
// =============================================

export async function addArrearsToStudentFee(
  studentFeeId: number,
  arrearsAmount: number,
  reason: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: fee, error: fetchError } = await supabase
      .from("za_demo_student_fees")
      .select(
        "arrears, balance, paid_amount, discounted_amount, original_amount",
      )
      .eq("id", studentFeeId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newArrears = fee.arrears + arrearsAmount;
    const totalAmount =
      (fee.discounted_amount || fee.original_amount) + newArrears;
    const newBalance = totalAmount - fee.paid_amount;

    const { error } = await supabase
      .from("za_demo_student_fees")
      .update({
        arrears: newArrears,
        arrears_reason: reason,
        arrears_approved_by: staffId,
        balance: newBalance,
        status:
          newBalance <= 0
            ? "paid"
            : fee.paid_amount > 0
              ? "partial"
              : "pending",
      })
      .eq("id", studentFeeId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true, newArrears, newBalance };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// RECORD PAYMENT
// =============================================

export async function recordPayment(
  studentFeeId: number,
  studentId: number,
  amount: number,
  paymentMethod: string,
  paymentReference?: string,
  notes?: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: studentFee, error: feeError } = await supabase
      .from("za_demo_student_fees")
      .select(
        "paid_amount, balance, original_amount, discounted_amount, arrears",
      )
      .eq("id", studentFeeId)
      .single();

    if (feeError) throw new Error(feeError.message);

    const newPaidAmount = studentFee.paid_amount + amount;
    const newBalance = studentFee.balance - amount;
    const newStatus =
      newBalance <= 0
        ? "paid"
        : newBalance < studentFee.balance
          ? "partial"
          : "pending";

    const receiptNumber = `RCP-${Date.now()}-${studentId}-${Math.floor(Math.random() * 1000)}`;

    const { error: paymentError } = await supabase
      .from("za_demo_fee_payments")
      .insert({
        student_fee_id: studentFeeId,
        student_id: studentId,
        amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        receipt_number: receiptNumber,
        notes: notes || null,
        recorded_by: staffId,
      });

    if (paymentError) throw new Error(paymentError.message);

    const { error: updateError } = await supabase
      .from("za_demo_student_fees")
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq("id", studentFeeId);

    if (updateError) throw new Error(updateError.message);

    if (newBalance <= 0) {
      const { data: studentFees } = await supabase
        .from("za_demo_student_fees")
        .select("id")
        .eq("student_id", studentId)
        .neq("status", "paid")
        .not("balance", "eq", 0);

      if (!studentFees || studentFees.length === 0) {
        await supabase
          .from("za_demo_student")
          .update({ status: "active" })
          .eq("id", studentId);
      }
    }

    revalidatePath(`/admin/fees/students/${studentId}`);
    revalidatePath("/admin/fees/payments");
    return { success: true, receiptNumber };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// GET STUDENT FEE INFORMATION
// =============================================

export async function getStudentPaymentHistory(studentId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: payments, error } = await supabase
    .from("za_demo_fee_payments")
    .select(
      `
      *,
      student_fee:student_fee_id (
        id,
        class_id,
        academic_year_id,
        term_id,
        original_amount,
        discounted_amount,
        arrears,
        balance,
        class:class_id (id, name),
        academic_year:academic_year_id (id, year),
        term:term_id (id, term_number, name)
      ),
      recorded_by_staff:recorded_by (id, first_name, last_name)
    `,
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { payments: payments || [] };
}

export async function getStudentFeeSummary(studentId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: fees, error } = await supabase
    .from("za_demo_student_fees")
    .select(
      `
      *,
      class:class_id (id, name, level),
      academic_year:academic_year_id (id, year),
      term:term_id (id, term_number, name),
      fee_type:fee_type_id (id, name, code)
    `,
    )
    .eq("student_id", studentId)
    .order("academic_year_id", { ascending: false })
    .order("term_id", { ascending: true });

  if (error) return { error: error.message };

  const totalOwed = fees.reduce(
    (sum, f) =>
      sum + (f.discounted_amount || f.original_amount) + (f.arrears || 0),
    0,
  );
  const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0);
  const totalArrears = fees.reduce((sum, f) => sum + (f.arrears || 0), 0);
  const hasOutstanding = fees.some((f) => f.balance > 0);

  return {
    fees: fees || [],
    summary: {
      totalOwed,
      totalPaid,
      totalBalance,
      totalArrears,
      hasOutstanding,
      activeFees: fees.filter((f) => f.status !== "paid").length,
      paidFees: fees.filter((f) => f.status === "paid").length,
    },
  };
}

// =============================================
// CLASS FEE STATUS & REPORTS
// =============================================

export async function getClassFeeStatus(
  classId: number,
  academicYearId?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  let studentsQuery = supabase
    .from("za_demo_student")
    .select(
      "id, first_name, last_name, other_names, admission_number, student_number, status",
    )
    .eq("current_class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  const { data: students, error: studentsError } = await studentsQuery;
  if (studentsError) return { error: studentsError.message };

  if (!students || students.length === 0) {
    return { students: [] };
  }

  let feesQuery = supabase
    .from("za_demo_student_fees")
    .select(
      `
      id,
      student_id,
      academic_year_id,
      term_id,
      original_amount,
      discounted_amount,
      arrears,
      paid_amount,
      balance,
      status,
      due_date,
      scholarship_type,
      academic_year:academic_year_id (id, year),
      term:term_id (id, term_number, name)
    `,
    )
    .in(
      "student_id",
      students.map((s) => s.id),
    );

  if (academicYearId) {
    feesQuery = feesQuery.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    feesQuery = feesQuery.eq("term_id", termId);
  }

  const { data: fees, error: feesError } = await feesQuery;
  if (feesError) return { error: feesError.message };

  const feesByStudent = new Map();
  fees?.forEach((fee) => {
    if (!feesByStudent.has(fee.student_id)) {
      feesByStudent.set(fee.student_id, []);
    }
    feesByStudent.get(fee.student_id).push(fee);
  });

  const studentFeeStatus = students.map((student) => {
    const studentFees = feesByStudent.get(student.id) || [];
    const totalOwed = studentFees.reduce(
      (sum: number, f: any) =>
        sum + (f.discounted_amount || f.original_amount) + (f.arrears || 0),
      0,
    );
    const totalPaid = studentFees.reduce(
      (sum: number, f: any) => sum + f.paid_amount,
      0,
    );
    const totalBalance = studentFees.reduce(
      (sum: number, f: any) => sum + f.balance,
      0,
    );
    const totalArrears = studentFees.reduce(
      (sum: number, f: any) => sum + (f.arrears || 0),
      0,
    );
    const hasPartial = studentFees.some(
      (f: any) => f.balance > 0 && f.paid_amount > 0,
    );
    const isOverdue = studentFees.some(
      (f: any) =>
        f.due_date && f.balance > 0 && new Date(f.due_date) < new Date(),
    );

    return {
      ...student,
      full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ""}`,
      fee_summary: {
        totalOwed,
        totalPaid,
        totalBalance,
        totalArrears,
        hasPartial,
        isOverdue,
        fee_count: studentFees.length,
      },
      student_fees: studentFees,
    };
  });

  return { students: studentFeeStatus };
}

// =============================================
// FEE TRANSACTIONS & STATISTICS
// =============================================

export async function getAllFeesTransactions(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    studentId?: number;
    classId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  },
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_fee_payments")
    .select(
      `
      *,
      student:student_id (id, first_name, last_name, admission_number, student_number),
      recorded_by_staff:recorded_by (id, first_name, last_name),
      student_fee:student_fee_id (
        class_id,
        academic_year_id,
        term_id,
        class:class_id (id, name),
        academic_year:academic_year_id (id, year),
        term:term_id (id, term_number, name)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.studentId) query = query.eq("student_id", filters.studentId);
  if (filters?.classId)
    query = query.eq("student_fee.class_id", filters.classId);
  if (filters?.fromDate) query = query.gte("payment_date", filters.fromDate);
  if (filters?.toDate) query = query.lte("payment_date", filters.toDate);

  const { data: payments, error, count } = await query;
  if (error) return { error: error.message };

  return { payments: payments || [], total: count || 0 };
}

export async function getFeeStatistics(
  academicYearId?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("za_demo_student_fees").select(`
    balance,
    paid_amount,
    original_amount,
    discounted_amount,
    arrears,
    status
  `);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: fees, error } = await query;
  if (error) return { error: error.message };

  if (!fees || fees.length === 0) {
    return {
      stats: {
        totalExpected: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalArrears: 0,
        collectionRate: "0",
        fullyPaid: 0,
        partiallyPaid: 0,
        pending: 0,
        totalRecords: 0,
      },
    };
  }

  const totalExpected = fees.reduce(
    (sum, f) => sum + (f.discounted_amount || f.original_amount),
    0,
  );
  const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);
  const totalArrears = fees.reduce((sum, f) => sum + (f.arrears || 0), 0);
  const collectionRate =
    totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : "0";

  const fullyPaid = fees.filter((f) => f.status === "paid").length;
  const partiallyPaid = fees.filter((f) => f.status === "partial").length;
  const pending = fees.filter((f) => f.status === "pending").length;

  return {
    stats: {
      totalExpected,
      totalPaid,
      totalOutstanding,
      totalArrears,
      collectionRate,
      fullyPaid,
      partiallyPaid,
      pending,
      totalRecords: fees.length,
    },
  };
}

// =============================================
// DISCOUNT MANAGEMENT
// =============================================

export async function applyStudentDiscount(
  studentFeeId: number,
  discountPercentage: number,
  reason?: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: fee, error: feeError } = await supabase
      .from("za_demo_student_fees")
      .select("original_amount, paid_amount, balance, arrears")
      .eq("id", studentFeeId)
      .single();

    if (feeError) throw new Error(feeError.message);

    const newDiscountedAmount =
      fee.original_amount * (1 - discountPercentage / 100);
    const totalAmount = newDiscountedAmount + (fee.arrears || 0);
    const newBalance = totalAmount - fee.paid_amount;

    const { error } = await supabase
      .from("za_demo_student_fees")
      .update({
        discounted_amount: newDiscountedAmount,
        discount_percentage: discountPercentage,
        scholarship_type:
          discountPercentage >= 100
            ? "full"
            : discountPercentage > 0
              ? "partial"
              : "none",
        balance: newBalance,
        status:
          newBalance <= 0
            ? "paid"
            : fee.paid_amount > 0
              ? "partial"
              : "pending",
      })
      .eq("id", studentFeeId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// STUDENT STATUS MANAGEMENT
// =============================================

export async function updateStudentFeeStatus(
  studentId: number,
  status: "active" | "inactive" | "suspended",
) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_student")
    .update({ status })
    .eq("id", studentId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/fees/students/${studentId}`);
  return { success: true };
}

// =============================================
// LOOKUP DATA FETCHERS
// =============================================

export async function getClasses() {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

export async function getAcademicYears() {
  const supabase = await createSupabaseServerClient();

  const { data: years, error } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active, start_date, end_date, status")
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
}

export async function getTerms(academicYearId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_term")
    .select(
      "id, term_number, name, start_date, end_date, is_active, academic_year_id",
    )
    .eq("status", "active");

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: terms, error } = await query;
  console.log("TERMS: ", terms)
  console.log("TERM ERRORS: ", error)
  if (error) return { error: error.message };
  return { terms: terms || [] };
}

export async function getFeeTypes() {
  const supabase = await createSupabaseServerClient();

  const { data: feeTypes, error } = await supabase
    .from("za_demo_fee_type")
    .select("id, name, code, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { feeTypes: feeTypes || [] };
}

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: students, error } = await supabase
    .from("za_demo_student")
    .select(
      "id, first_name, last_name, other_names, admission_number, student_number",
    )
    .eq("current_class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };

  const formattedStudents =
    students?.map((s) => ({
      ...s,
      full_name: `${s.first_name} ${s.last_name}${s.other_names ? ` ${s.other_names}` : ""}`,
    })) || [];

  return { students: formattedStudents };
}

export async function getStudentById(studentId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: student, error } = await supabase
    .from("za_demo_student")
    .select(
      `
      *,
      guardian:guardian_id (id, first_name, last_name, email, phone),
      contact:contact_id (id, email, phone, address),
      current_class:current_class_id (id, name, level)
    `,
    )
    .eq("id", studentId)
    .single();

  if (error) return { error: error.message };
  return { student };
}

// =============================================
// EXTRA FEE STRUCTURES (Class Level)
// =============================================

export async function createExtraFeeStructure(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const data = {
      class_id: parseInt(formData.get("class_id")!.toString()),
      fee_type_id: parseInt(formData.get("fee_type_id")!.toString()),
      academic_year_id: parseInt(formData.get("academic_year_id")!.toString()),
      term_id: formData.get("term_id")
        ? parseInt(formData.get("term_id")!.toString())
        : null,
      amount: parseFloat(formData.get("amount")!.toString()),
      description: formData.get("description")?.toString() || null,
      frequency: formData.get("frequency")?.toString() || "one-time",
      due_date: formData.get("due_date") || null,
      is_mandatory: formData.get("is_mandatory") === "true",
      created_by: staffId,
    };

    const { error } = await supabase
      .from("za_demo_extra_fee_structures")
      .insert(data);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getExtraFeeStructures(
  classId?: number,
  academicYearId?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_extra_fee_structures")
    .select(
      `
      *,
      class:class_id (id, name, level, section),
      fee_type:fee_type_id (id, name, code, description),
      academic_year:academic_year_id (id, year, name),
      term:term_id (id, term_number, name)
    `,
    )
    .is("deleted_at", null)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (classId) query = query.eq("class_id", classId);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: structures, error } = await query;
  if (error) return { error: error.message };
  return { structures: structures || [] };
}

export async function getExtraFeeStructureById(id: number) {
  const supabase = await createSupabaseServerClient();

  const { data: structure, error } = await supabase
    .from("za_demo_extra_fee_structures")
    .select(
      `
      *,
      class:class_id (id, name, level, section),
      fee_type:fee_type_id (id, name, code, description),
      academic_year:academic_year_id (id, year, name),
      term:term_id (id, term_number, name)
    `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { structure };
}

export async function updateExtraFeeStructure(
  id: number,
  data: {
    amount?: number;
    description?: string;
    frequency?: string;
    due_date?: string;
    is_mandatory?: boolean;
    status?: string;
  },
) {
  const supabase = await createSupabaseServerClient();

  try {
    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.is_mandatory !== undefined)
      updateData.is_mandatory = data.is_mandatory;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
      .from("za_demo_extra_fee_structures")
      .update(updateData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteExtraFeeStructure(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_extra_fee_structures")
      .update({ deleted_at: new Date().toISOString(), status: "inactive" })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// EXTRA FEE ASSIGNMENT TO STUDENTS
// =============================================

export async function bulkAssignExtraFeeToClass(
  extraFeeStructureId: number,
  classId: number,
  academicYearId: number,
  termId: number | null,
  amount: number,
  feeTypeId: number,
  frequency: string,
  dueDate?: string,
  description?: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: students, error: studentsError } = await supabase
      .from("za_demo_student")
      .select("id, first_name, last_name")
      .eq("current_class_id", classId)
      .eq("status", "active")
      .is("deleted_at", null);

    if (studentsError) throw new Error(studentsError.message);
    if (!students || students.length === 0) {
      return { error: "No active students found in this class" };
    }

    // Check for existing extra fees to avoid duplicates
    let existingQuery = supabase
      .from("za_demo_extra_fees")
      .select("student_id")
      .eq("extra_fee_structure_id", extraFeeStructureId);

    const { data: existingFees } = await existingQuery;
    const existingStudentIds = new Set(
      existingFees?.map((f) => f.student_id) || [],
    );

    const newFees = students
      .filter((s) => !existingStudentIds.has(s.id))
      .map((student) => ({
        extra_fee_structure_id: extraFeeStructureId,
        student_id: student.id,
        class_id: classId,
        fee_type_id: feeTypeId,
        academic_year_id: academicYearId,
        term_id: termId || null,
        amount: amount,
        description: description || null,
        frequency: frequency,
        due_date: dueDate || null,
        balance: amount,
        status: "pending",
        created_by: staffId,
      }));

    if (newFees.length > 0) {
      const { error: insertError } = await supabase
        .from("za_demo_extra_fees")
        .insert(newFees);

      if (insertError) throw new Error(insertError.message);
    }

    revalidatePath("/admin/fees");
    return {
      success: true,
      assignedCount: newFees.length,
      totalStudents: students.length,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function assignExtraFeeToIndividualStudent(
  extraFeeStructureId: number,
  studentId: number,
  classId: number,
  academicYearId: number,
  termId: number | null,
  amount: number,
  feeTypeId: number,
  frequency: string,
  dueDate?: string,
  description?: string,
) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    // Check if already assigned
    const { data: existing, error: checkError } = await supabase
      .from("za_demo_extra_fees")
      .select("id")
      .eq("extra_fee_structure_id", extraFeeStructureId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);
    if (existing) {
      return { error: "This extra fee is already assigned to this student" };
    }

    const { error } = await supabase.from("za_demo_extra_fees").insert({
      extra_fee_structure_id: extraFeeStructureId,
      student_id: studentId,
      class_id: classId,
      fee_type_id: feeTypeId,
      academic_year_id: academicYearId,
      term_id: termId || null,
      amount: amount,
      description: description || null,
      frequency: frequency,
      due_date: dueDate || null,
      balance: amount,
      status: "pending",
      created_by: staffId,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// =============================================
// EXTRA FEE PAYMENTS
// =============================================

export async function recordExtraFeePayment(data: {
  extraFeeId: number;
  studentId: number;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { error: "Staff not authenticated" };

  try {
    const { data: extraFee, error: feeError } = await supabase
      .from("za_demo_extra_fees")
      .select("amount, paid_amount, balance")
      .eq("id", data.extraFeeId)
      .single();

    if (feeError) throw new Error(feeError.message);

    const newPaidAmount = (extraFee.paid_amount || 0) + data.amount;
    const newBalance = extraFee.amount - newPaidAmount;
    const newStatus =
      newBalance <= 0
        ? "paid"
        : newBalance < extraFee.amount
          ? "partial"
          : "pending";

    const receiptNumber = `EXT-${Date.now()}-${data.studentId}-${Math.floor(Math.random() * 1000)}`;

    const { error: paymentError } = await supabase
      .from("za_demo_extra_fee_payments")
      .insert({
        extra_fee_id: data.extraFeeId,
        student_id: data.studentId,
        amount: data.amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: data.paymentMethod,
        payment_reference: data.paymentReference || null,
        receipt_number: receiptNumber,
        notes: data.notes || null,
        recorded_by: staffId,
        type: "Extra Fee",
      });

    if (paymentError) throw new Error(paymentError.message);

    const { error: updateError } = await supabase
      .from("za_demo_extra_fees")
      .update({
        paid_amount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
      })
      .eq("id", data.extraFeeId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/admin/fees");
    return { success: true, receiptNumber };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getExtraFeePayments(
  extraFeeId?: number,
  studentId?: number,
  limit: number = 100,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_extra_fee_payments")
    .select(
      `
      *,
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number,
        student_number
      ),
      extra_fee:extra_fee_id (
        id,
        amount,
        description,
        frequency,
        status
      ),
      recorded_by_staff:recorded_by (
        id,
        first_name,
        last_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (extraFeeId) query = query.eq("extra_fee_id", extraFeeId);
  if (studentId) query = query.eq("student_id", studentId);

  const { data: payments, error } = await query;
  if (error) return { error: error.message };
  return { payments: payments || [] };
}

export async function getExtraFeeSummary(studentId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: fees, error } = await supabase
    .from("za_demo_extra_fees")
    .select(
      `
      *,
      fee_type:fee_type_id (
        id,
        name,
        code
      ),
      extra_fee_structure:extra_fee_structure_id (
        id,
        frequency,
        is_mandatory
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `,
    )
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const totalOwed = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0);
  const hasOutstanding = fees.some((f) => f.balance > 0);

  return {
    fees: fees || [],
    summary: {
      totalOwed,
      totalPaid,
      totalBalance,
      hasOutstanding,
      activeFees: fees.filter((f) => f.status !== "paid").length,
      paidFees: fees.filter((f) => f.status === "paid").length,
    },
  };
}

export async function getExtraFeeStatistics(
  academicYearId?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("za_demo_extra_fees").select(`
    amount,
    paid_amount,
    balance,
    status
  `);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: fees, error } = await query;
  if (error) return { error: error.message };

  if (!fees || fees.length === 0) {
    return {
      stats: {
        totalExpected: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        collectionRate: "0",
        fullyPaid: 0,
        partiallyPaid: 0,
        pending: 0,
        totalRecords: 0,
      },
    };
  }

  const totalExpected = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);
  const collectionRate =
    totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : "0";

  const fullyPaid = fees.filter((f) => f.status === "paid").length;
  const partiallyPaid = fees.filter((f) => f.status === "partial").length;
  const pending = fees.filter((f) => f.status === "pending").length;

  return {
    stats: {
      totalExpected,
      totalPaid,
      totalOutstanding,
      collectionRate,
      fullyPaid,
      partiallyPaid,
      pending,
      totalRecords: fees.length,
    },
  };
}

// =============================================
// FEE TYPE MANAGEMENT (for extra fees)
// =============================================

export async function createFeeType(data: {
  name: string;
  code: string;
  description?: string;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from("za_demo_fee_type").insert({
      name: data.name,
      code: data.code,
      description: data.description || null,
      is_active: true,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateFeeType(
  id: number,
  data: {
    name?: string;
    code?: string;
    description?: string;
    is_active?: boolean;
  },
) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_fee_type")
      .update(data)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteFeeType(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_fee_type")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteExtraFee(extraFeeId: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_extra_fees")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", extraFeeId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getExtraFees(
  studentId?: number,
  academicYearId?: number,
  termId?: number,
  status?: string,
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_extra_fees")
    .select(
      `
      *,
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number,
        student_number
      ),
      fee_type:fee_type_id (
        id,
        name,
        code,
        description
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `,
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (studentId) query = query.eq("student_id", studentId);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);
  if (status) query = query.eq("status", status);

  const { data: fees, error } = await query;
  if (error) return { error: error.message };
  return { fees: fees || [] };
}



//!
// lib/actions/admin/fees.ts - Add these new functions

// =============================================
// EXTRA FEE PAYMENT TRACKING
// =============================================

export type ExpectedPayment = {
  date: string;
  label: string;
  paid: boolean;
  paymentId?: number;
  isFuture?: boolean;
};

export type StudentPaymentStatus = {
  studentId: number;
  studentName: string;
  admissionNumber: string;
  extraFeeId: number;
  feeType: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "termly" | "one-time";
  expectedPayments: ExpectedPayment[];
  paidCount: number;
  missedCount: number;
  totalExpected: number;
  status: "paid" | "partial" | "pending";
  paymentRate: string;
};

export type ExtraFeeTrackingData = {
  classId: number;
  className: string;
  extraFeeStructureId: number;
  feeType: string;
  frequency: string;
  amount: number;
  dateRange: {
    start: string;
    end: string;
  };
  students: StudentPaymentStatus[];
  summary: {
    totalStudents: number;
    fullyPaid: number;
    partialPaid: number;
    pending: number;
    overallPaymentRate: string;
  };
};

export async function getExtraFeePaymentStatus(
  extraFeeStructureId: number,
  classId: number,
  academicYearId: number,
  termId?: number,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: ExtraFeeTrackingData; error?: string }> {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Get the extra fee structure
    const { data: structure, error: structureError } = await supabase
      .from("za_demo_extra_fee_structures")
      .select(`
        *,
        class:class_id (id, name),
        fee_type:fee_type_id (id, name, code)
      `)
      .eq("id", extraFeeStructureId)
      .single();

    if (structureError) throw new Error(structureError.message);
    if (!structure) throw new Error("Extra fee structure not found");

    // 2. Get all students in the class with this extra fee assigned
    const { data: assignedFees, error: assignedError } = await supabase
      .from("za_demo_extra_fees")
      .select(`
        id,
        student_id,
        amount,
        frequency,
        due_date,
        paid_amount,
        balance,
        status,
        student:student_id (
          id,
          first_name,
          last_name,
          other_names,
          admission_number,
          student_number
        )
      `)
      .eq("extra_fee_structure_id", extraFeeStructureId)
      .eq("class_id", classId)
      .eq("academic_year_id", academicYearId)
      .is("deleted_at", null);

    if (assignedError) throw new Error(assignedError.message);
    if (!assignedFees || assignedFees.length === 0) {
      return {
        success: true,
        data: {
          classId: classId,
          className: structure.class?.name || "Unknown",
          extraFeeStructureId: extraFeeStructureId,
          feeType: structure.fee_type?.name || "Extra Fee",
          frequency: structure.frequency,
          amount: structure.amount,
          dateRange: {
            start: startDate || new Date().toISOString().split("T")[0],
            end: endDate || new Date().toISOString().split("T")[0],
          },
          students: [],
          summary: {
            totalStudents: 0,
            fullyPaid: 0,
            partialPaid: 0,
            pending: 0,
            overallPaymentRate: "0",
          },
        },
      };
    }

    // 3. Get all payments for these extra fees
    const extraFeeIds = assignedFees.map((f: any) => f.id);
    const { data: payments, error: paymentsError } = await supabase
      .from("za_demo_extra_fee_payments")
      .select("*")
      .in("extra_fee_id", extraFeeIds)
      .order("payment_date", { ascending: true });

    if (paymentsError) throw new Error(paymentsError.message);

    // 4. Build payment map by extra_fee_id
    const paymentMap = new Map<number, any[]>();
    payments?.forEach((p: any) => {
      if (!paymentMap.has(p.extra_fee_id)) {
        paymentMap.set(p.extra_fee_id, []);
      }
      paymentMap.get(p.extra_fee_id)?.push(p);
    });

    // 5. Calculate date range based on frequency
    const range = calculateDateRange(
      structure.frequency,
      structure.due_date || new Date().toISOString().split("T")[0],
      startDate,
      endDate
    );

    // 6. Build student payment status
    const studentStatuses: StudentPaymentStatus[] = assignedFees.map((fee: any) => {
      const student = Array.isArray(fee.student) ? fee.student[0] : fee.student;
      const feePayments = paymentMap.get(fee.id) || [];

      // Generate expected payment dates based on frequency
      const expectedPayments = generateExpectedPayments(
        structure.frequency,
        range,
        fee.due_date || range.start,
        feePayments
      );

      const paidCount = expectedPayments.filter((p: ExpectedPayment) => p.paid).length;
      const totalExpected = expectedPayments.length;
      const missedCount = totalExpected - paidCount;
      const paymentRate = totalExpected > 0 ? ((paidCount / totalExpected) * 100).toFixed(1) : "0";

      let status: "paid" | "partial" | "pending" = "pending";
      if (paidCount === totalExpected && totalExpected > 0) status = "paid";
      else if (paidCount > 0) status = "partial";

      return {
        studentId: student?.id || fee.student_id,
        studentName: student ? `${student.first_name} ${student.last_name}` : "Unknown Student",
        admissionNumber: student?.admission_number || "—",
        extraFeeId: fee.id,
        feeType: structure.fee_type?.name || "Extra Fee",
        amount: fee.amount || structure.amount,
        frequency: structure.frequency,
        expectedPayments,
        paidCount,
        missedCount,
        totalExpected,
        status,
        paymentRate: `${paymentRate}%`,
      };
    });

    // 7. Calculate summary
    const totalStudents = studentStatuses.length;
    const fullyPaid = studentStatuses.filter((s) => s.status === "paid").length;
    const partialPaid = studentStatuses.filter((s) => s.status === "partial").length;
    const pending = studentStatuses.filter((s) => s.status === "pending").length;

    const totalPaymentRate = studentStatuses.reduce(
      (sum, s) => sum + parseFloat(s.paymentRate),
      0
    );
    const overallPaymentRate =
      totalStudents > 0 ? (totalPaymentRate / totalStudents).toFixed(1) : "0";

    return {
      success: true,
      data: {
        classId: classId,
        className: structure.class?.name || "Unknown",
        extraFeeStructureId: extraFeeStructureId,
        feeType: structure.fee_type?.name || "Extra Fee",
        frequency: structure.frequency,
        amount: structure.amount,
        dateRange: range,
        students: studentStatuses,
        summary: {
          totalStudents,
          fullyPaid,
          partialPaid,
          pending,
          overallPaymentRate: `${overallPaymentRate}%`,
        },
      },
    };
  } catch (err: any) {
    console.error("Error fetching extra fee payment status:", err);
    return { success: false, error: err.message };
  }
}

function calculateDateRange(
  frequency: string,
  dueDate: string,
  startDate?: string,
  endDate?: string
): { start: string; end: string } {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now);
  const end = endDate ? new Date(endDate) : new Date(now);

  switch (frequency) {
    case "daily":
      // Show current week (Mon-Fri)
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      return {
        start: monday.toISOString().split("T")[0],
        end: friday.toISOString().split("T")[0],
      };

    case "weekly":
      // Show last 3 months + current month
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return {
        start: threeMonthsAgo.toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };

    case "monthly":
      // Show last 3 months + current month
      const threeMonthsAgoM = new Date(now);
      threeMonthsAgoM.setMonth(now.getMonth() - 3);
      return {
        start: threeMonthsAgoM.toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };

    case "termly":
    case "one-time":
    default:
      return {
        start: start.toString() || new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0],
        end: end.toString() || now.toISOString().split("T")[0],
      };
  }
}

function generateExpectedPayments(
  frequency: string,
  range: { start: string; end: string },
  dueDate: string,
  payments: any[]
): ExpectedPayment[] {
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  const dueDateObj = new Date(dueDate);
  const paymentDates = new Set(payments.map((p) => p.payment_date.split("T")[0]));

  const expected: ExpectedPayment[] = [];

  switch (frequency) {
    case "daily": {
      // Show Monday to Friday
      const current = new Date(startDate);
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const dateStr = current.toISOString().split("T")[0];
          const payment = payments.find((p) => p.payment_date.split("T")[0] === dateStr);
          expected.push({
            date: dateStr,
            label: current.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
            paid: paymentDates.has(dateStr),
            paymentId: payment?.id,
            isFuture: current > new Date(),
          });
        }
        current.setDate(current.getDate() + 1);
      }
      break;
    }

    case "weekly": {
      // Show weekly on the due day (same day of week)
      const current = new Date(startDate);
      const targetDay = dueDateObj.getDay();
      // Find first occurrence of target day
      while (current.getDay() !== targetDay) {
        current.setDate(current.getDate() + 1);
      }
      while (current <= endDate) {
        const dateStr = current.toISOString().split("T")[0];
        const payment = payments.find((p) => p.payment_date.split("T")[0] === dateStr);
        expected.push({
          date: dateStr,
          label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          paid: paymentDates.has(dateStr),
          paymentId: payment?.id,
          isFuture: current > new Date(),
        });
        current.setDate(current.getDate() + 7);
      }
      break;
    }

    case "monthly": {
      // Show monthly on the due day
      const current = new Date(startDate);
      const targetDay = dueDateObj.getDate();
      current.setDate(targetDay);
      while (current <= endDate) {
        const dateStr = current.toISOString().split("T")[0];
        const payment = payments.find((p) => p.payment_date.split("T")[0] === dateStr);
        expected.push({
          date: dateStr,
          label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          paid: paymentDates.has(dateStr),
          paymentId: payment?.id,
          isFuture: current > new Date(),
        });
        current.setMonth(current.getMonth() + 1);
      }
      break;
    }

    case "termly": {
      // Show terms (3 per academic year)
      const terms = [
        { label: "Term 1", month: 0 }, // Jan-Mar
        { label: "Term 2", month: 4 }, // Apr-Jun
        { label: "Term 3", month: 8 }, // Jul-Sep
      ];
      const currentYear = startDate.getFullYear();
      terms.forEach((term, index) => {
        const termStart = new Date(currentYear, term.month, 1);
        const termEnd = new Date(currentYear, term.month + 3, 0);
        if (termStart <= endDate && termEnd >= startDate) {
          const dateStr = termStart.toISOString().split("T")[0];
          const payment = payments.find((p) => {
            const pDate = new Date(p.payment_date);
            return pDate >= termStart && pDate <= termEnd;
          });
          expected.push({
            date: dateStr,
            label: `${term.label}, ${currentYear}`,
            paid: !!payment,
            paymentId: payment?.id,
            isFuture: termStart > new Date(),
          });
        }
      });
      break;
    }

    case "one-time": {
      const dateStr = dueDateObj.toISOString().split("T")[0];
      const payment = payments.find((p) => p.payment_date.split("T")[0] === dateStr);
      expected.push({
        date: dateStr,
        label: "One-time",
        paid: !!payment || paymentDates.has(dateStr),
        paymentId: payment?.id,
        isFuture: dueDateObj > new Date(),
      });
      break;
    }

    default:
      break;
  }

  return expected;
}

export async function markExtraFeePayment(
  extraFeeId: number,
  studentId: number,
  paymentDate: string,
  amount: number,
  paymentMethod: string = "cash"
): Promise<{ success: boolean; error?: string; paymentId?: number }> {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffId(supabase);

  if (!staffId) return { success: false, error: "Staff not authenticated" };

  try {
    // Check if payment already exists for this date
    const { data: existing, error: checkError } = await supabase
      .from("za_demo_extra_fee_payments")
      .select("id")
      .eq("extra_fee_id", extraFeeId)
      .eq("payment_date", paymentDate)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);

    // If payment exists, delete it (toggle off)
    if (existing) {
      const { error: deleteError } = await supabase
        .from("za_demo_extra_fee_payments")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw new Error(deleteError.message);

      // Update extra fee balance
      const { data: fee, error: feeError } = await supabase
        .from("za_demo_extra_fees")
        .select("paid_amount, balance")
        .eq("id", extraFeeId)
        .single();

      if (feeError) throw new Error(feeError.message);

      const newPaidAmount = fee.paid_amount - amount;
      const newBalance = fee.balance + amount;
      const newStatus = newBalance <= 0 ? "paid" : newBalance < fee.balance ? "partial" : "pending";

      await supabase
        .from("za_demo_extra_fees")
        .update({
          paid_amount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
        })
        .eq("id", extraFeeId);

      return { success: true };
    }

    // Generate receipt number
    const receiptNumber = `TRK-${Date.now()}-${studentId}-${Math.floor(Math.random() * 1000)}`;

    // Insert new payment
    const { data: payment, error: insertError } = await supabase
      .from("za_demo_extra_fee_payments")
      .insert({
        extra_fee_id: extraFeeId,
        student_id: studentId,
        amount: amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        receipt_number: receiptNumber,
        recorded_by: staffId,
        type: "Extra Fee - Tracking",
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // Update extra fee balance
    const { data: fee, error: feeError } = await supabase
      .from("za_demo_extra_fees")
      .select("paid_amount, balance")
      .eq("id", extraFeeId)
      .single();

    if (feeError) throw new Error(feeError.message);

    const newPaidAmount = fee.paid_amount + amount;
    const newBalance = fee.balance - amount;
    const newStatus = newBalance <= 0 ? "paid" : newBalance < fee.balance ? "partial" : "pending";

    await supabase
      .from("za_demo_extra_fees")
      .update({
        paid_amount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
      })
      .eq("id", extraFeeId);

    return { success: true, paymentId: payment.id };
  } catch (err: any) {
    console.error("Error marking extra fee payment:", err);
    return { success: false, error: err.message };
  }
}

export async function getExtraFeeTrackingFilters(academicYearId?: number) {
  const supabase = await createSupabaseServerClient();

  try {
    // Get classes with extra fee structures
    let query = supabase
      .from("za_demo_extra_fee_structures")
      .select(`
        id,
        class_id,
        fee_type_id,
        academic_year_id,
        term_id,
        amount,
        frequency,
        due_date,
        is_mandatory,
        class:class_id (id, name, level),
        fee_type:fee_type_id (id, name, code)
      `)
      .eq("status", "active")
      .is("deleted_at", null);

    if (academicYearId) {
      query = query.eq("academic_year_id", academicYearId);
    }

    const { data: structures, error } = await query;

    if (error) throw new Error(error.message);

    // Group by class
    const classMap = new Map();
    structures?.forEach((s: any) => {
      const classData = Array.isArray(s.class) ? s.class[0] : s.class;
      if (!classMap.has(s.class_id)) {
        classMap.set(s.class_id, {
          classId: s.class_id,
          className: classData?.name || "Unknown",
          structures: [],
        });
      }
      classMap.get(s.class_id).structures.push({
        id: s.id,
        feeType: s.fee_type?.name || "Extra Fee",
        feeTypeId: s.fee_type_id,
        amount: s.amount,
        frequency: s.frequency,
      });
    });

    return {
      success: true,
      classes: Array.from(classMap.values()),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}