'use client'; 
// 해당 라인을 가지는 컴포넌트만이 클라이언트에서 hydration (interactive하게 변경)
// 백엔드에서 정적 페이지 먼저 렌더, 그 다음 하이드레이션

import Link from "next/link"
import { usePathname } from "next/navigation";

export default function Navigation() {
    const path = usePathname();
    return (
        <nav>
            <ul>
                <li>
                    <Link href='/'>
                        Home
                    </Link> {path === '/' ? '🎈' : ''}
                </li>
                <li>
                    <Link href='/about-us'>
                        About Us
                    </Link> {path === '/about-us' ? '🎈' : ''}
                </li>
            </ul>
        </nav>
    )
}