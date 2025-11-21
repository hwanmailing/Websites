# 게임 홈페이지

이 폴더에는 게임 소개 홈페이지의 모든 파일들이 포함되어 있습니다.

## 파일 구조:
```
homepage/
├── style.css          # 추가적인 CSS 스타일
├── script.js          # JavaScript 기능 (이미지 슬라이더, 폼 처리 등)
└── README.md          # 이 파일
```

## 외부 리소스:
- **비디오**: https://hwanmailing.github.io/resources/videos/jumpClaire.mp4
- **이미지들**: https://hwanmailing.github.io/resources/images/jumpClaire1.png ~ jumpClaire6.png

## 주요 기능:

### 1. 반응형 디자인
- Tailwind CSS를 사용한 모던한 디자인
- 모바일과 데스크톱 모두 지원
- 다크 테마 적용

### 2. 이미지 슬라이더
- 6장의 게임 스크린샷을 자동 슬라이드
- 좌우 화살표로 수동 조작 가능
- 하단 점 표시기로 특정 이미지로 이동
- 마우스 호버 시 자동 슬라이드 일시정지

### 3. 비디오 플레이어
- 상단에 게임 트레일러 비디오 배치
- HTML5 video 태그 사용
- 컨트롤러 포함

### 4. 다운로드 섹션
- iOS App Store 다운로드 버튼
- Android Google Play 다운로드 버튼
- PC 버전 다운로드 버튼

### 5. 연락처 폼
- 이름, 이메일, 제목, 메시지 입력 필드
- 이메일 유효성 검사
- 폼 제출 시 알림 표시

### 6. 네비게이션
- 고정된 상단 네비게이션 바
- 부드러운 스크롤 애니메이션
- 반응형 메뉴

## 사용된 기술:
- **HTML5**: 시맨틱 마크업
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **jQuery**: JavaScript 라이브러리
- **CSS3**: 애니메이션과 트랜지션
- **반응형 디자인**: 모든 디바이스 지원

## 커스터마이징:
- `style.css`에서 추가 스타일 수정
- `script.js`에서 슬라이더 속도나 애니메이션 조정
- `index.html`에서 색상, 텍스트, 링크 수정

## 주의사항:
- 이미지와 비디오 파일을 추가해야 완전히 작동합니다
- 파일 경로가 정확해야 합니다
- 브라우저 호환성을 고려해야 합니다
