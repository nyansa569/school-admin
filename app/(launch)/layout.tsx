import './launch_global.css'
export default function LaunchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
       <>{children}</>
  );
}
