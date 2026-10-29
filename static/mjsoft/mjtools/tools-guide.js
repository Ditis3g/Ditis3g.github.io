'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const guides = {
    background: {
      name: '배경 제거', english: 'BACKGROUND REMOVAL', title: '필요한 피사체만,<br>배경 없이 깔끔하게.',
      description: '상품 사진, 프로필, 발표 자료에 쓸 이미지를 준비해 보세요. AI가 사진 속 피사체를 찾아 배경을 투명하게 만듭니다.',
      benefits: ['피사체를 남기고 배경을 투명하게', '제거한 배경은 PNG로 그대로 보존', '편집·크기 조절까지 이어서 작업'],
      limit: '머리카락, 투명한 물체, 복잡한 배경은 경계가 고르지 않을 수 있습니다.',
      steps: [['사진 선택', '배경과 피사체가 구분되는 사진을 열어 주세요. PNG, JPG, WebP를 지원합니다.'], ['배경 제거', '배경 제거하기를 누르고 결과를 확인하세요. 첫 사용에는 모델 준비 시간이 필요합니다.'], ['투명하게 저장', 'PNG 형식으로 다운로드하면 투명한 배경을 유지할 수 있습니다.']],
      faq: [['어떤 사진에서 결과가 좋은가요?', '피사체가 선명하고 배경과 색이 구분되는 사진에 적합합니다. 머리카락, 유리, 여러 피사체가 겹친 장면에서는 일부 영역이 함께 지워질 수 있으니 결과를 확인해 주세요.'], ['배경이 다시 흰색으로 보이는 이유는 무엇인가요?', 'JPG는 투명 배경을 지원하지 않아 흰색으로 저장됩니다. 투명도를 유지하려면 PNG 또는 WebP를 선택하세요. 미리보기의 체크무늬는 투명한 영역을 뜻합니다.'], ['사진은 서버에 올라가나요?', '사진은 서버에 업로드되지 않습니다. 처음 사용할 때 약 5 MB의 AI 모델을 내려받은 뒤 브라우저에서 처리합니다.'], ['결과가 마음에 들지 않으면 되돌릴 수 있나요?', '되돌리기로 직전 작업을 한 번 취소할 수 있습니다. 원본으로를 누르면 처음 연 사진으로 돌아갑니다. 기기에 있는 원본 파일은 변경되지 않습니다.']]
    },
    upscale: {
      name: 'AI 2배 확대', english: 'AI IMAGE UPSCALING', title: '작게 담긴 사진을,<br>더 넉넉한 크기로.',
      description: '자료에 넣기엔 작은 사진을 가로·세로 각각 2배로 확대하세요. AI가 주변 픽셀을 참고해 확대된 이미지를 만듭니다.',
      benefits: ['가로·세로 각각 2배, 전체 픽셀은 4배', '작은 사진을 자료와 웹 콘텐츠에 활용', '투명도가 있는 이미지도 이어서 작업'],
      limit: '입력은 200만 픽셀까지 지원합니다. 사라진 디테일이나 글자를 정확히 복원하는 기능은 아닙니다.',
      steps: [['크기 확인', '200만 픽셀 이하의 사진을 선택하세요. 큰 사진은 이미지 편집에서 먼저 줄일 수 있습니다.'], ['2배로 확대', '2배로 확대하기를 누르세요. 사진 크기와 기기 성능에 따라 처리 시간이 달라집니다.'], ['확인하고 저장', '확대된 이미지의 크기와 디테일을 확인한 뒤 원하는 형식으로 다운로드하세요.']],
      faq: [['흐린 얼굴이나 작은 글자도 정확히 복원되나요?', 'AI 확대는 주변 픽셀을 참고해 새 픽셀을 만드는 기능입니다. 실제로 없어진 디테일, 얼굴 특징, 읽을 수 없는 글자를 정확히 복원한다고 보장할 수 없습니다.'], ['얼마나 큰 사진까지 확대할 수 있나요?', '입력은 200만 픽셀까지 지원합니다. 결과의 가로와 세로는 각각 최대 12,000 px입니다. 예를 들어 1,000 × 1,000 px 사진은 2,000 × 2,000 px로 확대됩니다.'], ['처리가 오래 걸리면 취소할 수 있나요?', '처리 화면의 취소 버튼으로 중단할 수 있습니다. 취소하면 사진에 결과를 적용하지 않으며, 다른 도구를 이어서 사용할 수 있습니다.'], ['투명한 배경도 유지되나요?', '확대 과정에서 원본의 투명도를 함께 확대합니다. 저장할 때 PNG 또는 WebP를 선택해야 투명도를 유지할 수 있습니다. JPG는 투명한 부분을 흰색으로 저장합니다.']]
    },
    mosaic: {
      name: '얼굴 모자이크', english: 'FACE MOSAIC', title: '사진을 공유하기 전,<br>가려야 할 얼굴을 확인하세요.',
      description: '단체 사진이나 일상 사진 속 얼굴을 자동으로 찾아 모자이크를 적용합니다. 놓친 얼굴과 추가로 가릴 부분은 직접 선택할 수 있습니다.',
      benefits: ['자동 얼굴 감지로 빠르게 시작', '사각형을 선택해 수동으로 추가 가리기', '사진에 맞게 모자이크 크기 조절'],
      limit: '얼굴 감지는 완벽하지 않습니다. 저장하기 전에 모든 얼굴이 가려졌는지 직접 확인해 주세요.',
      steps: [['사진과 크기 선택', '사진을 열고 모자이크 크기를 정하세요. 숫자가 클수록 더 굵은 블록으로 가립니다.'], ['자동 감지·수동 보완', '얼굴 자동 감지를 실행하세요. 놓친 부분은 드래그해 선택한 뒤 선택 영역 가리기를 누르세요.'], ['꼼꼼히 확인', '작은 얼굴, 옆얼굴, 화면 가장자리를 확인하고 결과를 다운로드하세요.']],
      faq: [['자동 감지하면 모든 얼굴이 가려지나요?', '모든 얼굴을 감지한다고 보장할 수 없습니다. 작은 얼굴, 옆얼굴, 어두운 사진, 가려진 얼굴은 놓칠 수 있습니다. 결과를 직접 확인하고 필요한 부분을 수동으로 가려 주세요.'], ['얼굴 외의 부분도 가릴 수 있나요?', '사진 위에서 사각형을 드래그한 뒤 선택 영역 가리기를 누르면 됩니다. 키보드로는 미리보기에 초점을 두고 방향키로 선택·이동, Shift와 방향키로 크기를 조절할 수 있습니다.'], ['모자이크 크기는 언제 바꾸나요?', '적용하기 전에 모자이크 크기를 조절하세요. 이미 적용한 블록 크기를 바꾸려면 되돌리기를 누른 뒤 다시 적용해야 합니다.'], ['얼굴 감지의 결과 취소는 어떻게 동작하나요?', '결과 취소를 누르면 진행 중인 감지 결과를 사진에 적용하지 않습니다. 브라우저에서 이미 실행 중인 계산은 잠시 계속될 수 있습니다.']]
    },
    erase: {
      name: '물체 지우기', english: 'OBJECT REMOVAL', title: '시선을 빼앗는 물체는 덜고,<br>장면은 자연스럽게.',
      description: '사진 속 작은 소품이나 불필요한 물체를 사각형으로 선택하세요. AI가 주변 배경을 참고해 선택한 부분을 채웁니다.',
      benefits: ['사각형을 선택해 원하는 부분만 처리', '주변 장면을 참고해 빈자리 채우기', '결과를 확인하고 되돌리기로 다시 시도'],
      limit: '복잡한 패턴, 글자, 얼굴에서는 어색한 무늬가 생길 수 있습니다. 작은 영역부터 시도해 보세요.',
      steps: [['지울 영역 선택', '물체와 가장자리를 함께 포함하도록 드래그하세요. 주변 배경이 충분히 남아 있어야 합니다.'], ['선택 영역 지우기', '실행 후 잠시 기다려 주세요. 첫 사용 시 약 208 MB의 모델을 내려받습니다.'], ['결과 확인', '경계와 무늬를 확인하세요. 마음에 들지 않으면 되돌린 뒤 선택 영역을 바꿔 시도해 보세요.']],
      faq: [['영역을 얼마나 크게 선택할 수 있나요?', '선택 영역은 가로·세로 최소 2 px이며 사진 전체 면적의 75% 이하여야 합니다. 주변 배경을 참고하므로 가능한 한 필요한 물체와 가장자리만 선택해 주세요.'], ['처음 실행할 때 오래 걸리는 이유는 무엇인가요?', '첫 사용 시 약 208 MB의 AI 모델을 내려받아 실행합니다. 네트워크와 기기 성능에 따라 준비와 처리 시간이 달라집니다. 진행 중에는 취소할 수 있습니다.'], ['복잡한 배경도 원래 모습으로 복구되나요?', '가려져 있던 실제 배경을 복원하는 기능은 아닙니다. 주변 장면을 참고해 새 내용을 생성하므로 패턴, 글자, 얼굴, 큰 영역에서는 어색한 결과가 나올 수 있습니다.'], ['선택하지 않은 부분도 바뀌나요?', '최종 결과는 선택한 사각형 안에만 합성되며, 원본의 투명도는 유지됩니다. 경계를 자연스럽게 연결하기 위해 선택 영역 안쪽 가장자리를 섞어 처리합니다.']]
    },
    edit: {
      name: '이미지 편집', english: 'IMAGE EDITING', title: '구도부터 색감까지,<br>쓰임에 맞게 다듬으세요.',
      description: '사진을 자르고 돌리고, 크기와 색감을 조절하세요. 복잡한 편집 프로그램 없이 필요한 작업을 한 곳에서 이어갈 수 있습니다.',
      benefits: ['자르기·90도 회전·좌우·상하 반전', '밝기·대비·채도 조절', '가로 크기를 입력하면 비율에 맞게 변경'],
      limit: '자르기·회전·반전은 바로 적용됩니다. 밝기·대비·채도·크기는 편집 적용하기로 확정하세요.',
      steps: [['구도 정리', '사진을 드래그해 자를 영역을 선택하거나 회전·반전 버튼으로 방향을 맞추세요.'], ['색감과 크기 조절', '밝기·대비·채도와 가로 크기를 설정하고 편집 적용하기를 누르세요.'], ['다음 작업 또는 저장', '다른 도구로 이어서 작업하거나 PNG, JPG, WebP 중 원하는 형식으로 다운로드하세요.']],
      faq: [['편집하면 원본 파일도 바뀌나요?', '기기에 저장된 원본 파일은 변경되지 않습니다. 브라우저 안의 작업 결과에만 반영되며, 다운로드할 때 별도의 파일로 저장합니다.'], ['이미지 크기를 바꾸면 비율이 유지되나요?', '가로 크기를 입력하면 현재 이미지의 가로·세로 비율에 맞춰 높이를 자동으로 계산합니다. 결과는 전체 1,200만 픽셀, 가로·세로 각각 최대 12,000 px까지 지원합니다.'], ['적용 버튼은 언제 눌러야 하나요?', '밝기·대비·채도·크기 설정은 편집 적용하기를 눌러야 반영됩니다. 자르기·회전·반전 버튼은 즉시 반영되며 대기 중인 색감 설정은 초기화됩니다.'], ['실수했을 때 어디까지 돌아갈 수 있나요?', '되돌리기는 직전 작업을 한 번 취소합니다. 처음부터 다시 시작하려면 원본으로를 누르세요. 원본으로 돌아가는 작업도 직후 한 번 되돌릴 수 있습니다.']]
    },
    convert: {
      name: '형식 변환', english: 'IMAGE FORMAT CONVERSION', title: '올릴 곳에 맞는 형식으로,<br>간편하게 바꿔 저장하세요.',
      description: '투명도가 필요한 이미지, 사진 파일, 웹 콘텐츠까지. PNG, JPG, WebP 중 쓰임에 맞는 형식을 선택하고 바로 저장하세요.',
      benefits: ['PNG · JPG · WebP로 변환', 'JPG·WebP의 저장 품질 조절', '편집한 결과도 선택한 형식으로 저장'],
      limit: '애니메이션은 첫 장면만 저장됩니다. 파일 용량은 사진과 선택한 형식·품질에 따라 달라집니다.',
      steps: [['이미지 열기', '20 MB 이하의 PNG, JPG, WebP 이미지를 선택하세요. 전체 1,200만 픽셀까지 지원합니다.'], ['형식과 품질 선택', '투명도가 필요하면 PNG 또는 WebP를 선택하세요. JPG와 WebP는 품질을 조절할 수 있습니다.'], ['변환해 다운로드', '다운로드 버튼을 누르면 선택한 형식의 새 파일로 저장됩니다. 원본 파일은 유지됩니다.']],
      faq: [['PNG, JPG, WebP 중 무엇을 선택하면 좋을까요?', 'PNG는 투명도와 픽셀을 손실 없이 저장할 때 적합합니다. JPG는 일반 사진을 널리 공유할 때 편리합니다. WebP는 투명도를 지원하며 웹에서 사용할 이미지에 활용할 수 있습니다.'], ['품질을 높이면 원본 화질도 좋아지나요?', '저장 품질은 JPG·WebP를 압축하는 정도를 조절합니다. 원본에서 사라진 디테일이 복원되지는 않습니다. PNG는 무손실 저장이므로 품질 슬라이더를 사용하지 않습니다.'], ['투명한 이미지와 애니메이션도 변환되나요?', '투명도는 PNG와 WebP로 저장할 때 유지됩니다. JPG에서는 흰색으로 바뀝니다. 애니메이션 WebP 등은 움직임 전체가 아니라 첫 장면만 저장됩니다.'], ['촬영 정보와 원본 파일 이름도 유지되나요?', '브라우저에서 픽셀을 새로 저장하므로 EXIF 등 원본 메타데이터는 유지되지 않습니다. 저장 파일 이름에는 원래 이름 뒤에 -mjtools가 붙으며 원본 파일은 변경되지 않습니다.']]
    }
  };
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const card = (x, content, background = '#e8f0f8') => '<g transform="translate(' + x + ' 38)"><rect width="220" height="176" rx="11" fill="' + background + '"/>' + content + '</g>';
  const landscape = '<path d="M0 123 65 64l51 47 33-34 71 63v36H0Z" fill="#91b6a5"/><path d="m76 114 38-44 55 58 25-19 26 30v37H0Z" fill="#6f9d8a"/><circle cx="172" cy="41" r="17" fill="#f4d5a6"/><path d="M0 145q60-27 115-5t105-2v38H0Z" fill="#c5d8c8"/>';
  const vase = '<path d="M94 98C72 77 74 55 60 41c35 0 42 23 44 51M112 99c4-41 11-61 38-73-1 34-12 50-36 66" fill="#7aa895"/><path d="M104 100V47m9 53 13-49" fill="none" stroke="#53826e" stroke-width="3"/><path d="M78 93h66l-7 61a9 9 0 0 1-9 8H94a9 9 0 0 1-9-8Z" fill="#e8bb95"/><path d="M82 107h58" stroke="#d59f79" stroke-width="2" fill="none"/>';
  const portrait = '<path d="M46 176v-34c0-28 25-48 64-48s64 20 64 48v34Z" fill="#7394bd"/><path d="M95 96h30v22c-8 9-22 9-30 0Z" fill="#edc7a9"/><ellipse cx="110" cy="65" rx="35" ry="42" fill="#f0ceb3"/><path d="M75 65c-6-45 13-53 36-53 29 0 42 20 34 53l-11-34c-16 15-33 18-59 18Z" fill="#56677d"/><path d="M96 66h1m26 0h1m-20 22q6 4 12 0" stroke="#8d6f62" stroke-width="2" fill="none"/>';
  function visual(kind) {
    let left = '', right = '', labels = ['원본', '작업 후 · 개념 예시'];
    if (kind === 'background') {
      left = card(14, '<path d="M0 132h220v44H0Z" fill="#d7e2e8"/><path d="M24 0v132M52 0v132M168 0v132M196 0v132" stroke="#d8e4ec" stroke-width="1"/>' + vase);
      right = card(282, vase, 'url(#guide-checker)');
    } else if (kind === 'upscale') {
      left = card(14, '<g transform="translate(44 34) scale(.6)"><rect width="220" height="176" rx="8" fill="#e4edf6"/>' + landscape + '</g>');
      right = card(282, landscape);
      labels = ['작은 이미지', '가로·세로 각각 2배'];
    } else if (kind === 'mosaic') {
      left = card(14, portrait);
      let blocks = '';
      ['#a1a5ad','#b6aa9e','#d2b7a5','#9da9b4','#c5b3a4','#879bac','#b5b5af','#d0b6a0'].forEach((color,i) => { blocks += '<rect x="' + (72 + i%4*20) + '" y="' + (43 + Math.floor(i/4)*21) + '" width="20" height="21" fill="' + color + '"/>'; });
      right = card(282, portrait + blocks + '<rect x="71" y="42" width="82" height="44" rx="2" stroke="#5485c2" stroke-width="1.5" fill="none"/>');
      labels = ['공유할 사진', '얼굴을 선택해 가리기'];
    } else if (kind === 'erase') {
      left = card(14, landscape + '<path d="M61 112h20l7 40H54Z" fill="#d39879"/><path d="M64 107h14v9H64Z" fill="#e5b592"/><rect x="45" y="96" width="53" height="65" rx="5" stroke="#588bc8" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/>');
      right = card(282, landscape);
      labels = ['지울 영역 선택', '주변 배경을 참고해 채우기'];
    } else if (kind === 'edit') {
      left = card(14, landscape + '<rect x="45" y="29" width="140" height="111" fill="#ffffff0a" stroke="#fff" stroke-width="2"/><path d="M91 29v111m47-111v111M45 66h140m-140 37h140" stroke="#ffffff90" stroke-width="1" fill="none"/>');
      right = card(282, '<g transform="translate(-40 -25) scale(1.35)">' + landscape + '</g>');
      labels = ['구도와 영역 선택', '필요한 모습으로 편집'];
    } else {
      const file = (x,y,label,color) => '<g transform="translate(' + x + ' ' + y + ')"><rect width="77" height="105" rx="8" fill="#fff" stroke="#d2deeb" stroke-width="1"/><path d="M14 23h36M14 33h47M14 43h30" stroke="#d8e3ef" stroke-width="3" fill="none"/><rect x="11" y="66" width="55" height="24" rx="5" fill="' + color + '"/><text x="38.5" y="82" text-anchor="middle" font-size="10" fill="#547391" font-weight="650">' + label + '</text></g>';
      left = card(14, file(71,34,'IMAGE','#ecf2f8'));
      right = card(282, file(15,48,'PNG','#e9f3ee') + file(72,28,'JPG','#eaf1fd') + file(129,48,'WebP','#f7eee5'));
      labels = ['내 이미지', '쓰임에 맞는 저장 형식'];
    }
    return '<svg viewBox="0 0 520 258" role="img" aria-label="' + escape(guides[kind].name + ' 기능 설명용 일러스트') + '"><defs><pattern id="guide-checker" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#fff"/><path d="M0 0h9v9H0ZM9 9h9v9H9Z" fill="#e0e7ef"/></pattern><clipPath id="guide-left-clip"><rect x="14" y="38" width="220" height="176" rx="11"/></clipPath><clipPath id="guide-right-clip"><rect x="282" y="38" width="220" height="176" rx="11"/></clipPath></defs><text x="14" y="20" fill="#8b9eb2" font-size="9" font-weight="600">' + labels[0] + '</text><text x="282" y="20" fill="#6889b1" font-size="9" font-weight="600">' + labels[1] + '</text><g clip-path="url(#guide-left-clip)">' + left + '</g><g clip-path="url(#guide-right-clip)">' + right + '</g><circle cx="258" cy="126" r="14" fill="#fff" stroke="#dce6f1" stroke-width="1"/><path d="M252 126h12m-4-4 4 4-4 4" fill="none" stroke="#82a0c2" stroke-width="1.5"/><text x="258" y="243" text-anchor="middle" font-size="8" fill="#a0afbf">MjTools · 내 브라우저에서 이어가는 사진 작업</text></svg>';
  }
  function update(kind) {
    const guide = guides[kind];
    if (!guide || !byId('guide-title')) return;
    byId('guide-eyebrow').textContent = guide.name;
    byId('guide-title').innerHTML = guide.title;
    byId('guide-description').textContent = guide.description;
    byId('guide-benefits').innerHTML = guide.benefits.map(text => '<li>' + escape(text) + '</li>').join('');
    byId('guide-limit').textContent = guide.limit;
    byId('guide-visual-label').textContent = guide.english;
    byId('guide-visual').innerHTML = visual(kind);
    byId('howto-description').textContent = guide.name + ', 이렇게 사용해 보세요.';
    byId('guide-steps').innerHTML = guide.steps.map((step,index) => '<li><span class="step-number" aria-hidden="true">0' + (index+1) + '</span><h3>' + escape(step[0]) + '</h3><p>' + escape(step[1]) + '</p></li>').join('');
    byId('faq-description').textContent = guide.name + ' 사용 전에 궁금한 점을 확인해 보세요.';
    byId('guide-faq').innerHTML = guide.faq.map((item,index) => '<details><summary id="faq-' + kind + '-' + index + '">' + escape(item[0]) + '</summary><div>' + escape(item[1]) + '</div></details>').join('');
    byId('guide-start').setAttribute('aria-label', guide.name + '에 사용할 사진 선택하기');
  }
  document.addEventListener('mjtools:toolchange', event => update(event.detail.tool));
  byId('guide-start').onclick = () => {
    if (byId('replace').disabled) return;
    byId('image-workspace').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
    byId('replace').click();
  };
  byId('guide-workspace').onclick = () => {
    const target = byId('apply').disabled ? byId('replace') : byId('apply');
    setTimeout(() => target.focus({preventScroll:true}), 0);
  };
  const selected = document.querySelector('[data-tool][aria-selected="true"]');
  update(selected ? selected.dataset.tool : 'background');
})();
