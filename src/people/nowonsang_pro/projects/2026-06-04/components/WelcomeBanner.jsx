import { useDispatch, useSelector } from 'react-redux'
import {
  selectAllTodos,
  selectEverHadTodos,
  selectStorageBlocked,
  selectWelcomeBannerDismissed,
} from '../store/selectors'
import { uiActions } from '../store/slices/uiSlice'

export default function WelcomeBanner() {
  const dispatch = useDispatch()
  const todos = useSelector(selectAllTodos)
  const dismissed = useSelector(selectWelcomeBannerDismissed)
  const storageBlocked = useSelector(selectStorageBlocked)
  // M-04 fix: 한 번이라도 todo가 존재했던 세션이면 빈 상태로 돌아가도 배너 재출현 차단
  const everHadTodos = useSelector(selectEverHadTodos)

  const showWelcome = todos.length === 0 && !dismissed && !everHadTodos

  return (
    <>
      {storageBlocked && (
        <div className="tc-storage-banner" role="alert">
          ⚠ 이번 세션의 변경 사항은 저장되지 않습니다. 브라우저 저장소가
          비활성화되었거나 가득 찼습니다.
        </div>
      )}
      {showWelcome && (
        <div className="tc-banner" role="status">
          <span aria-hidden="true">✨</span>
          <span>환영합니다! 일자 셀을 클릭해 첫 일정을 추가해 보세요.</span>
          <button
            type="button"
            onClick={() => dispatch(uiActions.dismissWelcomeBanner())}
            aria-label="환영 배너 닫기"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
