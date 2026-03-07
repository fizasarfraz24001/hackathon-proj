import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import CareerChatbot from '@/components/CareerChatbot';

export const metadata = {
  title: "Youth Career Navigator",
  description: "AI-powered platform for career recommendations, skill-gap analysis, learning roadmap, and resume guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} bg-slate-900 text-slate-100`}>
        <AuthProvider>
          {children}
          <CareerChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}