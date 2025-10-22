# Convex 문서

이 웹사이트는 현대적인 정적 웹사이트 생성기인 [Docusaurus 2](https://docusaurus.io/)를 사용하여 구축되었습니다.

## 로컬 개발

```sh
just rush install
npm run dev
```

이 명령은 로컬 개발 서버를 시작하고 브라우저 창을 엽니다. 대부분의 변경사항은 서버를 재시작할 필요 없이 실시간으로 반영됩니다.

`convex` NPM 패키지를 변경하고 API 문서에 반영하려면 `just rush build -t convex`를 실행하고 서버를 재시작하세요.

이 명령은 `npm run dev`를 실행하며, 프리서브밋의 모든 검사를 실행하지는 않습니다. 예를 들어, 깨진 링크는 확인되지 않습니다. 모든 오류를 확인하려면 빌드 및 테스트를 시도하세요:

```sh
npm run test
npm run build
```

## llms.txt

이 파일은 Firecrawl을 사용하여 수동으로 생성되었습니다:
https://www.firecrawl.dev/blog/How-to-Create-an-llms-txt-File-for-Any-Website

Firecrawl에서 API 키를 받아 위 블로그 게시물의 지침을 따르면 됩니다.

그런 다음 몇 가지 수동 편집을 했습니다:

- 모든 Google Analytics 참조를 제거했습니다 (간단한 정규식 찾기 및 바꾸기)
- 홈페이지 텍스트를 맨 위에 배치했습니다
- YouTube 임베드 출력을 정리했습니다. 매우 지저분했습니다.

그 외에는 상당히 괜찮은 출력을 생성했습니다. 결국 게시할 때마다 더 자동화해야 합니다.

전체 배경은 [여기](https://linear.app/convex/issue/DX-1412/create-an-llmstxt-file-for-the-website-and-docs-page)를 참조하세요.

## VS Code에서 맞춤법 검사

VS Code에서 맞춤법 검사를 활성화하려면 [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)를 설치하세요.

## 빌드

```sh
npm run build
```

이 명령은 정적 콘텐츠를 `build` 디렉토리에 생성하며, 모든 정적 콘텐츠 호스팅 서비스를 사용하여 제공할 수 있습니다.

## 프로덕션 배포

[여기](/ops/services/docs/release.md)를 참조하세요.

## 프리뷰 배포

[여기](/ops/services/docs/release.md#preview-deployment)를 참조하세요.

## 컴포넌트 문서 업데이트

컴포넌트 문서는 우리가 동기화하는 컴포넌트의 /docs 폴더에 있습니다. 예를 들어, https://github.com/get-convex/component/tree/main/docs 업데이트하려면 이 디렉토리에서 다음 명령을 실행하세요:

```sh
node scripts/pull-component-docs.js
```

이 명령은 `main` 브랜치에서 최신 문서를 가져와서 docs 디렉토리를 업데이트하며, 코드 스니펫을 위해 원본 저장소로의 상대 링크를 일부 교체합니다.

이것은 수동 프로세스이며 일반적으로 컴포넌트 문서가 변경되고 컴포넌트 패키지의 새 릴리스가 있을 때만 수행하면 됩니다.

# 종속성 참고사항

Typedoc 플러그인은 Rush를 사용하는 우리 모노레포에서 작동하지 않는 것 같습니다: npm에서 설치할 때만 작동합니다.

몇 가지를 업데이트해야 했기 때문에 https://github.com/get-convex/typedoc-plugin-markdown 에서 포크했습니다.

typedoc 플러그인을 반복하는 것은 어렵습니다. typedoc은 자체 모듈 해결을 구현하여 rush/pnpm 솔루션이 작동하지 않습니다. 따라서 반복하려면 다음과 같이 했습니다:

1. typedoc-plugin-markdown 포크를 복제하고 rush/pnpm-config.json에 globalOverride를 설정했습니다
2. 거기서 변경하고 yarn run build로 빌드했습니다
3. dashboard의 package.json에서 종속성을 제거했습니다
4. just rush update
5. dashboard의 package.json에 종속성을 다시 추가했습니다
6. just rush update
7. 2번부터 반복했습니다
8. globalOverride를 제거하고, typedoc-plugin-markdown 버전 번호를 증가시켜 게시하고, docs package.json deps를 업데이트했습니다
