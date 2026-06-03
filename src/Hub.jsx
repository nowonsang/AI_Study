import { Link } from 'react-router-dom'
import { members } from './shared/members.js'

export default function Hub() {
  return (
    <div className="hub">
      <header className="hub-header">
        <h1>📅 Calendar Hub</h1>
        <p>7명이 각자 만든 캘린더 작품을 확인하세요.</p>
      </header>

      <ul className="member-grid">
        {members.map(({ name, slug, role }) => (
          <li key={slug} className="member-card">
            <Link to={`/people/${slug}`}>
              <span className="member-role">{role}</span>
              <span className="member-name">{name}</span>
              <span className="member-slug">{slug}</span>
              <span className="member-cta">캘린더 보기 →</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="hub-guide">
        <h2>각 자리에서 시작하기</h2>
        <ol>
          <li>
            본인 폴더로 이동:&nbsp;
            <code>src/people/&lt;본인슬러그&gt;_pro/Calendar.jsx</code>
            <br />
            <small>(예: 노원상 → <code>nowonsang_pro</code>)</small>
          </li>
          <li>해당 파일만 수정하면 됩니다. 다른 사람 폴더는 건드리지 마세요.</li>
          <li>
            localStorage 키는 슬러그를 포함해 사용:&nbsp;
            <code>ai-study.events.&lt;슬러그&gt;</code>
          </li>
        </ol>
      </section>
    </div>
  )
}
