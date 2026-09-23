/**
 * Stock Pulse - 구글 스프레드시트 양방향 연동 Apps Script
 * 
 * [초간단 설정 방법]
 * 1. 본인의 구글 스프레드시트 주소(URL) 전체를 아래 SPREADSHEET_URL의 따옴표 안에 붙여넣으세요!
 *    (스프레드시트 주소창에 있는 https://docs.google.com/spreadsheets/d/... 전체 복사)
 * 2. 상단 메뉴 [배포] -> [새 배포] 클릭
 *    - 유형: [웹 앱] 선택
 *    - 액세스 권한: [모든 사용자(Anyone)] 선택 ★ 중요!
 * 3. [배포] 버튼을 누르고 권한 승인 후 나온 '웹 앱 URL'을 복사하여 앱에 넣으시면 끝납니다.
 */

// ★ 본인의 구글 스프레드시트 주소를 아래 따옴표 안에 붙여넣으세요!
// 예시: const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1abcXYZ.../edit";
const SPREADSHEET_URL = ""; 

const SHEET_NAME = '포트폴리오';

// 스프레드시트 객체를 안전하게 가져오는 함수
function getSpreadsheet() {
  // 1. SPREADSHEET_URL이 지정되어 있으면 해당 시트를 직접 오픈 (100% 안전)
  if (typeof SPREADSHEET_URL === 'string' && SPREADSHEET_URL.trim() !== "") {
    const raw = SPREADSHEET_URL.trim();
    const match = raw.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const id = match ? match[1] : raw;
    return SpreadsheetApp.openById(id);
  }

  // 2. 바운드 스크립트인 경우 Active Spreadsheet 자동 감지
  const active = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.getActive();
  if (active) return active;

  throw new Error("스프레드시트를 찾을 수 없습니다. Code.gs 파일 상단의 SPREADSHEET_URL 변수 따옴표 안에 본인 구글 시트 주소 전체를 붙여넣고 다시 배포해주세요!");
}

// GET 요청 처리: 시트에 저장된 주식 목록 반환
function doGet(e) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = initSheet(ss);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({
        success: true,
        message: '시트에 저장된 데이터가 없습니다.',
        positions: [],
      });
    }

    // 1행은 헤더: 종목코드, 종목명, 수량, 평균매수가, 통화, 한도비중, 투자기간, 최종수정일시
    const positions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const symbolId = String(row[0] || '').trim();
      const nameKo = String(row[1] || '').trim();
      const quantity = parseFloat(row[2]) || 0;
      const averageCost = parseFloat(row[3]) || 0;
      const currency = String(row[4] || 'USD').trim();
      const targetWeight = parseFloat(row[5]) || 20;
      const horizon = String(row[6] || 'MEDIUM').trim();
      const updatedAt = String(row[7] || '');

      if (symbolId && quantity > 0 && averageCost > 0) {
        positions.push({
          symbol_id: symbolId,
          name_ko: nameKo,
          quantity: quantity,
          average_cost: averageCost,
          currency: currency,
          target_max_weight_percent: targetWeight,
          investment_horizon: horizon,
          updated_at: updatedAt,
        });
      }
    }

    return createJsonResponse({
      success: true,
      message: `${positions.length}개 종목을 불러왔습니다.`,
      positions: positions,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: '구글 시트 읽기 실패: ' + err.toString(),
    });
  }
}

// POST 요청 처리: 앱에서 보낸 포트폴리오를 시트에 덮어쓰기 저장
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'save_portfolio';
    const payload = postData.payload || postData;

    if (action === 'load_portfolio') {
      return doGet(e);
    }

    if (action === 'save_portfolio') {
      const positions = payload.positions || [];
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        sheet = initSheet(ss);
      } else {
        sheet.clearContents();
      }

      // 1. 헤더 작성
      const headers = [
        '종목코드',
        '종목명',
        '수량',
        '평균매수가',
        '통화',
        '한도비중(%)',
        '투자기간',
        '최종저장일시',
      ];
      sheet.appendRow(headers);

      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#2563EB');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');

      // 2. 데이터 행 작성
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
      const rows = [];
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        rows.push([
          p.symbol_id,
          p.name_ko || p.symbol_id,
          p.quantity,
          p.average_cost,
          p.currency || 'USD',
          p.target_max_weight_percent || 20,
          p.investment_horizon || 'MEDIUM',
          nowStr,
        ]);
      }

      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }

      // 열 너비 자동 맞춤
      for (let col = 1; col <= headers.length; col++) {
        sheet.autoResizeColumn(col);
      }

      return createJsonResponse({
        success: true,
        message: `${positions.length}개 종목이 구글 시트에 성공적으로 저장되었습니다.`,
        saved_count: positions.length,
        saved_at: nowStr,
      });
    }

    return createJsonResponse({ success: false, error: '지원하지 않는 액션입니다: ' + action });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: '구글 시트 저장 실패: ' + err.toString(),
    });
  }
}

// 시트 초기화 헬퍼
function initSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.appendRow([
    '종목코드',
    '종목명',
    '수량',
    '평균매수가',
    '통화',
    '한도비중(%)',
    '투자기간',
    '최종저장일시',
  ]);
  const headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setBackground('#2563EB');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  return sheet;
}

// JSON 응답 생성 헬퍼
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
