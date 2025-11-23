// import { useEffect, useRef } from 'react'

// export default function useDebouncedSearch(
//   saveFunction: (data: any) => void,
//   delay: number,
// ) {
//   const timerRef = useRef<NodeJS.Timeout | null>(null)

//   const debouncedSave = (data: any) => {
//     if (timerRef.current) {
//       clearTimeout(timerRef.current)
//     }
//     timerRef.current = setTimeout(() => {
//       saveFunction(data)
//     }, delay)
//   }

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current)
//       }
//     }
//   }, [])

//   return debouncedSave
// }
