export default function Calendar() {
  const name = '김진주'
  const slug = 'kimjinju_pro'
  const role = '개발자'

  return (
    <div className="person-page">
      <h1>📅 {name}의 캘린더</h1>
      <p className="meta">
        {role} · <code>{slug}</code>
      </p>

      <div className="hint">
        <strong>시작하기</strong>
        <br />
        이 파일은 <code>src/people/{slug}/Calendar.jsx</code> 입니다.
        <br />
        여기서부터 자유롭게 캘린더를 구현하세요.
        <br />
        localStorage 키: <code>ai-study.events.{slug}</code> (다른 멤버와 충돌 X)
      </div>

      <p>👉 아직 비어 있어요. 코드를 수정해 캘린더를 만들어 보세요!</p>

      <p>git 설정이 잘 되었는지 테스트 해 봅시당</p> 
    </div>
  )
}
