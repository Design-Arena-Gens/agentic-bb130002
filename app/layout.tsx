export const metadata = {
  title: "Carpenter Video Generator",
  description: "Generate an animated video of a carpenter carrying wood with a tool belt"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
