import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[todo] ErrorBoundary', error, info)
  }
  handleReload = () => {
    window.location.reload()
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="tc-error-fallback" role="alert">
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <h2>문제가 발생했습니다.</h2>
          <p>잠시 후 다시 시도해 주세요. (개발자 도구로 상세 확인)</p>
          <button className="tc-btn tc-btn-primary" onClick={this.handleReload}>
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
