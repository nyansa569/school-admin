// lib/actions/admin/staff.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage/uploadFile";

export type Staff = {
  id: number;
  staff_number: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  user_id: string | null;
  status: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  qualification: string | null;
  specialization: string | null;
  role: string;
  employment_type: string;  // Fixed typo
  employment_status: string;
  hire_date: string | null;
  termination_date: string | null;
  salary: number | null;
  contact_id: number | null;
  department_id: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  user?: {
    profile_picture: string | null;
  };
  contact?: {
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    town: string | null;
  };
  department?: {
    id: number;
    name: string;
    dep_code: string;
  };
};

// Generate unique staff number
async function generateStaffNumber(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("za_demo_staff")
    .select("id", { count: "exact", head: true });
  
  const sequence = ((count || 0) + 1).toString().padStart(4, "0");
  return `STF-${year}-${sequence}`;
}

export async function createStaff(formData: FormData): Promise<{ error?: string; success?: boolean; staffId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const firstName = formData.get("first_name")?.toString();
    const lastName = formData.get("last_name")?.toString();
    const otherNames = formData.get("other_names")?.toString() || null;
    const role = formData.get("role")?.toString() || "teacher";
    const phone = formData.get("phone")?.toString() || null;
    const gender = formData.get("gender")?.toString() || null;
    const dateOfBirth = formData.get("date_of_birth")?.toString() || null;
    const qualification = formData.get("qualification")?.toString() || null;
    const specialization = formData.get("specialization")?.toString() || null;
    const employmentType = formData.get("employment_type")?.toString() || "full-time";
    const employmentStatus = formData.get("employment_status")?.toString() || "active";
    const hireDate = formData.get("hire_date")?.toString() || new Date().toISOString().split('T')[0];
    const salary = formData.get("salary") ? parseFloat(formData.get("salary")!.toString()) : null;
    const emergencyContactName = formData.get("emergency_contact_name")?.toString() || null;
    const emergencyContactPhone = formData.get("emergency_contact_phone")?.toString() || null;
    const departmentId = formData.get("department_id") ? parseInt(formData.get("department_id")!.toString()) : null;
    const createUserAccount = formData.get("create_user_account") === "true";

    // Validate required fields
    if (!firstName || !lastName) {
      throw new Error("First name and last name are required");
    }

    let userId = null;
    let profilePictureUrl = null;

    // Only create user account if requested and email/password provided
    if (createUserAccount) {
      if (!email) {
        throw new Error("Email is required to create a user account");
      }
      if (!password) {
        throw new Error("Password is required to create a user account");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if user already exists in za_demo_user
      const { data: existingUser, error: checkError } = await supabase
        .from("za_demo_user")
        .select("email, role")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        throw new Error("Error checking existing user: " + checkError.message);
      }

      if (existingUser) {
        throw new Error(`User with email ${email} already exists. User role: ${existingUser.role}`);
      }

      // Check if user already exists in auth.users (Supabase Auth)
      const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers();
      
      if (!authCheckError && authUsers) {
        const existingAuthUser = authUsers.users.find(
          (user) => user.email?.toLowerCase() === email.toLowerCase()
        );
        
        if (existingAuthUser) {
          throw new Error(`Email ${email} is already registered in the system. Please use a different email.`);
        }
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !authData.user) {
        throw new Error(signUpError?.message || "Signup failed");
      }

      userId = authData.user.id;

      // Upload profile picture if provided
      const imageFile = formData.get("profile_picture") as File;
      if (imageFile && imageFile.size > 0) {
        const uploadResult = await uploadFile(imageFile, {
          bucket: "staff-images",
          folder: "staff",
          upsert: false,
        });
        profilePictureUrl = uploadResult.publicUrl;
      }

      // Create user record in za_demo_user
      const { error: userError } = await supabase
        .from("za_demo_user")
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
          profile_picture: profilePictureUrl,
          has_password_changed: false,
          status: "active",
        });

      if (userError) {
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`User creation failed: ${userError.message}`);
      }
    }

    // Create contact record for staff
    let contactId = null;
    const contactEmail = formData.get("contact_email")?.toString() || email || null;
    const contactPhone = formData.get("contact_phone")?.toString() || phone || null;
    const contactAddress = formData.get("contact_address")?.toString() || null;
    const contactCity = formData.get("contact_city")?.toString() || null;
    const contactTown = formData.get("contact_town")?.toString() || null;

    if (contactEmail || contactPhone || contactAddress) {
      const { data: contact, error: contactError } = await supabase
        .from("za_demo_contact")
        .insert({
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
          city: contactCity,
          town: contactTown,
          country: "Ghana",
          status: "active",
        })
        .select()
        .single();

      if (contactError) {
        console.error("Contact creation warning:", contactError.message);
      } else if (contact) {
        contactId = contact.id;
      }
    }

    // Generate staff number
    const staffNumber = await generateStaffNumber();

    // Create staff record
    const { data: staff, error: staffError } = await supabase
      .from("za_demo_staff")
      .insert({
        staff_number: staffNumber,
        first_name: firstName,
        last_name: lastName,
        other_names: otherNames,
        user_id: userId,
        email: email || null,
        phone: phone,
        gender: gender,
        date_of_birth: dateOfBirth,
        qualification: qualification,
        specialization: specialization,
        role: role,
        employment_type: employmentType,
        employment_status: employmentStatus,
        hire_date: hireDate,
        termination_date: null,
        salary: salary,
        contact_id: contactId,
        department_id: departmentId,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        status: "active",
      })
      .select()
      .single();

    if (staffError) {
      // Rollback user creation if staff creation fails
      if (userId) {
        await supabase.from("za_demo_user").delete().eq("user_id", userId);
        await supabase.auth.admin.deleteUser(userId);
      }
      throw new Error(`Staff creation failed: ${staffError.message}`);
    }

    revalidatePath("/admin/staff");
    return { success: true, staffId: staff.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getStaff(): Promise<{ error?: string; staff?: Staff[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: staff, error } = await supabase
    .from("za_demo_staff")
    .select(`
      *,
      user:user_id (profile_picture),
      contact:contact_id (email, phone, address, city, town),
      department:department_id (id, name, dep_code)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
    console.log("Staff data fetched:", staff);
    console.log("Error fetching staff data:", error);

  if (error) return { error: error.message };
  return { staff: staff || [] };
}

export async function getStaffById(id: number): Promise<{ error?: string; staff?: Staff }> {
  const supabase = await createSupabaseServerClient();

  const { data: staff, error } = await supabase
    .from("za_demo_staff")
    .select(`
      *,
      user:user_id (profile_picture),
      contact:contact_id (email, phone, address, city, town),
      department:department_id (id, name, dep_code)
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { staff };
}

export async function updateStaff(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { staff: existingStaff } = await getStaffById(id);
    if (!existingStaff) throw new Error("Staff not found");

    const firstName = formData.get("first_name")?.toString();
    const lastName = formData.get("last_name")?.toString();
    const otherNames = formData.get("other_names")?.toString() || null;
    const email = formData.get("email")?.toString();
    const phone = formData.get("phone")?.toString() || null;
    const gender = formData.get("gender")?.toString() || null;
    const dateOfBirth = formData.get("date_of_birth")?.toString() || null;
    const qualification = formData.get("qualification")?.toString() || null;
    const specialization = formData.get("specialization")?.toString() || null;
    const role = formData.get("role")?.toString();
    const employmentType = formData.get("employment_type")?.toString();
    const employmentStatus = formData.get("employment_status")?.toString();
    const hireDate = formData.get("hire_date")?.toString();
    const terminationDate = formData.get("termination_date")?.toString() || null;
    const salary = formData.get("salary") ? parseFloat(formData.get("salary")!.toString()) : null;
    const emergencyContactName = formData.get("emergency_contact_name")?.toString() || null;
    const emergencyContactPhone = formData.get("emergency_contact_phone")?.toString() || null;
    const departmentId = formData.get("department_id") ? parseInt(formData.get("department_id")!.toString()) : null;
    const status = formData.get("status")?.toString();

    // Update contact if exists
    const contactEmail = formData.get("contact_email")?.toString() || email || null;
    const contactPhone = formData.get("contact_phone")?.toString() || phone || null;
    const contactAddress = formData.get("contact_address")?.toString() || null;
    const contactCity = formData.get("contact_city")?.toString() || null;
    const contactTown = formData.get("contact_town")?.toString() || null;

    if (existingStaff.contact_id) {
      await supabase
        .from("za_demo_contact")
        .update({
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
          city: contactCity,
          town: contactTown,
        })
        .eq("id", existingStaff.contact_id);
    } else if (contactEmail || contactPhone || contactAddress) {
      const { data: contact } = await supabase
        .from("za_demo_contact")
        .insert({
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
          city: contactCity,
          town: contactTown,
          country: "Ghana",
          status: "active",
        })
        .select()
        .single();
      
      if (contact) {
        await supabase
          .from("za_demo_staff")
          .update({ contact_id: contact.id })
          .eq("id", id);
      }
    }

    // Update profile picture if provided
    let profilePictureUrl = existingStaff.user?.profile_picture;
    const imageFile = formData.get("profile_picture") as File;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadFile(imageFile, {
        bucket: "staff-images",
        folder: "staff",
        upsert: true,
        filename: `staff_${id}`,
      });
      profilePictureUrl = uploadResult.publicUrl;
    }

    // Update user record if exists
    if (existingStaff.user_id) {
      const userUpdateData: any = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
      };
      if (profilePictureUrl) userUpdateData.profile_picture = profilePictureUrl;

      const { error: userError } = await supabase
        .from("za_demo_user")
        .update(userUpdateData)
        .eq("user_id", existingStaff.user_id);

      if (userError) throw new Error(`User update failed: ${userError.message}`);
    }

    // Update staff record
    const { error: staffError } = await supabase
      .from("za_demo_staff")
      .update({
        first_name: firstName,
        last_name: lastName,
        other_names: otherNames,
        email: email,
        phone: phone,
        gender: gender,
        date_of_birth: dateOfBirth,
        qualification: qualification,
        specialization: specialization,
        role: role,
        employment_type: employmentType,
        employment_status: employmentStatus,
        hire_date: hireDate,
        termination_date: terminationDate,
        salary: salary,
        department_id: departmentId,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        status: status,
      })
      .eq("id", id);

    if (staffError) throw new Error(`Staff update failed: ${staffError.message}`);

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteStaff(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  // Soft delete - update status and set deleted_at
  const { error } = await supabase
    .from("za_demo_staff")
    .update({ 
      status: "deleted",
      deleted_at: new Date().toISOString(),
      employment_status: "terminated",
      termination_date: new Date().toISOString().split('T')[0]
    })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function getStaffRoles(): Promise<{ error?: string; roles?: string[] }> {
  return { 
    roles: [
      "teacher", 
      "admin", 
      "accountant", 
      "librarian", 
      "support",
      "cleaner",
      "driver",
      "security",
      "cook",
      "assistant",
      "nurse",
      "principal"
    ] 
  };
}

export async function getEmploymentTypes(): Promise<{ error?: string; types?: string[] }> {
  return { 
    types: ["full-time", "part-time", "contract", "temporary", "volunteer"] 
  };
}

export async function getEmploymentStatuses(): Promise<{ error?: string; statuses?: string[] }> {
  return { 
    statuses: ["active", "on_leave", "suspended", "terminated", "retired"] 
  };
}

export async function getGenders(): Promise<{ error?: string; genders?: string[] }> {
  return { genders: ["male", "female", "other"] };
}

// Get departments for dropdown
export async function getDepartments(): Promise<{ error?: string; departments?: { id: number; name: string; dep_code: string }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: departments, error } = await supabase
    .from("za_demo_department")
    .select("id, name, dep_code")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { departments: departments || [] };
}

// Get staff by role
export async function getStaffByRole(role: string): Promise<{ error?: string; staff?: Staff[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: staff, error } = await supabase
    .from("za_demo_staff")
    .select(`
      *,
      user:user_id (profile_picture),
      contact:contact_id (email, phone, address, city, town),
      department:department_id (id, name, dep_code)
    `)
    .eq("role", role)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };
  return { staff: staff || [] };
}

// Get teachers only (for dropdowns)
export async function getTeachers(): Promise<{ error?: string; teachers?: { id: number; first_name: string; last_name: string; email: string | null }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: teachers, error } = await supabase
    .from("za_demo_staff")
    .select("id, first_name, last_name, email")
    .eq("role", "teacher")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };
  return { teachers: teachers || [] };
}

// Get staff statistics
export async function getStaffStats(): Promise<{ error?: string; stats?: { total: number; byRole: Record<string, number>; byEmploymentType: Record<string, number>; byStatus: Record<string, number> } }> {
  const supabase = await createSupabaseServerClient();

  const { data: staff, error } = await supabase
    .from("za_demo_staff")
    .select("role, employment_type, employment_status")
    .is("deleted_at", null);

  if (error) return { error: error.message };

  const total = staff?.length || 0;
  const byRole: Record<string, number> = {};
  const byEmploymentType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  staff?.forEach((s) => {
    byRole[s.role] = (byRole[s.role] || 0) + 1;
    byEmploymentType[s.employment_type] = (byEmploymentType[s.employment_type] || 0) + 1;
    byStatus[s.employment_status] = (byStatus[s.employment_status] || 0) + 1;
  });

  return {
    stats: {
      total,
      byRole,
      byEmploymentType,
      byStatus,
    },
  };
}