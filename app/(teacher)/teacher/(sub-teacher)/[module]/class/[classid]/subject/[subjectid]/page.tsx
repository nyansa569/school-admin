// app/(teacher)/teacher/(sub-teacher)/[module]/class/[classid]/subject/[subjectid]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AttendanceView from "./components/AttendanceView";
import GradeView from "./components/GradeView";
// import ExamView from "./components/ExamView";
import AssessmentView from "./components/AssessmentView";

const TeacherModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const module = params?.module as string;
  const classId = params?.classid as string;
  const subjectId = params?.subjectid as string;

  useEffect(() => {
    // Check if module is valid
    const validModules = ["attendance", "grade", "exam", "assessment"];
    if (!validModules.includes(module)) {
      router.push("/teacher/dashboard");
    } else {
      setLoading(false);
    }
  }, [module, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render component based on module
  const renderComponent = () => {
    switch (module) {
      case "attendance":
        return <AttendanceView classId={parseInt(classId)} subjectId={parseInt(subjectId)} />;
      case "grade":
        return <GradeView classId={parseInt(classId)} subjectId={parseInt(subjectId)} />;
      // case "exam":
      //   return <ExamView classId={parseInt(classId)} subjectId={parseInt(subjectId)} />;
      case "assessment":
        return <AssessmentView classId={parseInt(classId)} subjectId={parseInt(subjectId)} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {renderComponent()}
    </div>
  );
};

export default TeacherModulePage;