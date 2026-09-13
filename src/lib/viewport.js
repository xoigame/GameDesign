/**
 * Một chỗ duy nhất biết "màn hình này có hẹp không".
 *
 * Breakpoint phải TRÙNG với `@media (max-width: 900px)` trong styles.css — CSS lo
 * phần bố cục, JS lo phần bố cục mindmap (khoảng cách node, chế độ mặc định, mức
 * zoom tối thiểu). Hai con số lệch nhau là kiểu lỗi chỉ hiện ra đúng ở vài chiều
 * rộng màn hình, rất khó thấy.
 */
import { useEffect, useState } from 'react'

export const MOBILE_MQ = '(max-width: 900px)'

/** Đọc ngay, dùng cho giá trị khởi tạo của useState. */
export const isMobileNow = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_MQ).matches
    : false

export function useIsMobile() {
  const [mobile, setMobile] = useState(isMobileNow)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = (e) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}
