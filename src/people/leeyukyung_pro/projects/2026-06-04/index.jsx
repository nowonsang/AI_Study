export default function Project_20260604() {
  const slug = 'leeyukyung_pro'
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">📅 캘린더</h1>
      <p className="text-sm text-gray-500 mb-6">
        2026.06.04 · 첫 회차 작품
      </p>

      <div className="rounded-lg border-l-4 border-brand-500 bg-brand-50 p-5 text-sm leading-6 text-gray-700">
        <strong className="block mb-1">시작하기</strong>
        이 파일은{' '}
        <code className="text-xs">
          src/people/{slug}/projects/2026-06-04/index.jsx
        </code>{' '}
        입니다.
        <br />
        여기서부터 자유롭게 캘린더를 구현하세요.
        <br />
        localStorage 키 예시:{' '}
        <code className="text-xs">ai-study.events.{slug}.2026-06-04</code>{' '}
        (회차별로 분리하면 안전)
      </div>

      <p className="mt-6 text-gray-500">
        👉 아직 비어 있어요. 코드를 수정해 캘린더를 만들어 보세요!
      </p>
    </div>
  )
}
