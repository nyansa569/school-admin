// app/(teacher)/teacher/profile/page.tsx
import { getTeacherProfile } from "@/lib/action/teacher/profile";
import TeacherProfileClient from "./TeacherProfileClient";

export default async function TeacherProfilePage() {
  const result = await getTeacherProfile();

  if (result.error) {
    return (
      <div className="error-container">
        <p>Error loading profile: {result.error}</p>
      </div>
    );
  }

  return <TeacherProfileClient profile={result.profile} />;
}