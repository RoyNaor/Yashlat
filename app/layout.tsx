// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'ישל"ט',
  description: 'מערכת ניהול בקשות יציאה ולוחמים',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
