import { Metadata } from "next"
import Navigation from "../components/navigation"

// 메타데이터는 레이아웃, 페이지에서만 / 서버 컴포넌트에서만 생성 가능
// 아래 
export const metadata: Metadata = {
  title: {
    template: '%s | Next Movies',
    default: 'Loading...'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
