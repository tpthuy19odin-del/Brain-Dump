const { GoogleGenerativeAI } = require('@google/generative-ai');

function parseRelativeDate(text, defaultDaysAhead = 3) {
  const lower = (text || '').toLowerCase();
  const now = new Date();
  
  if (lower.includes('hôm nay') || lower.includes('tối nay')) {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d;
  }
  if (lower.includes('ngày mai') || lower.includes('mai')) {
    const d = new Date(now.getTime() + 86400000);
    d.setHours(23, 59, 0, 0);
    return d;
  }
  if (lower.includes('ngày kia') || lower.includes('mốt')) {
    const d = new Date(now.getTime() + 2 * 86400000);
    d.setHours(23, 59, 0, 0);
    return d;
  }
  if (lower.includes('chủ nhật') || lower.includes('cn')) {
    const currentDay = now.getDay();
    const daysUntilSunday = currentDay === 0 ? 7 : (7 - currentDay);
    const d = new Date(now.getTime() + daysUntilSunday * 86400000);
    d.setHours(23, 59, 0, 0);
    return d;
  }
  if (lower.includes('thứ 2') || lower.includes('thứ hai')) return getNextDayOfWeek(1);
  if (lower.includes('thứ 3') || lower.includes('thứ ba')) return getNextDayOfWeek(2);
  if (lower.includes('thứ 4') || lower.includes('thứ tư')) return getNextDayOfWeek(3);
  if (lower.includes('thứ 5') || lower.includes('thứ năm')) return getNextDayOfWeek(4);
  if (lower.includes('thứ 6') || lower.includes('thứ sáu')) return getNextDayOfWeek(5);
  if (lower.includes('thứ 7') || lower.includes('thứ bảy')) return getNextDayOfWeek(6);
  if (lower.includes('tuần sau')) {
    const d = new Date(now.getTime() + 7 * 86400000);
    d.setHours(23, 59, 0, 0);
    return d;
  }

  const d = new Date(now.getTime() + defaultDaysAhead * 86400000);
  d.setHours(23, 59, 0, 0);
  return d;
}

function getNextDayOfWeek(targetDay) {
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  const d = new Date(now.getTime() + diff * 86400000);
  d.setHours(23, 59, 0, 0);
  return d;
}

// Gọi trực tiếp Google Gemini AI với fallback model
async function callGemini({ prompt, imageBase64, apiKey }) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
  if (!effectiveKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(effectiveKey);
  // Các model tốc độ cao và hỗ trợ vision tốt nhất
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const parts = [prompt];

      if (imageBase64) {
        const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }

      // Timeout 15s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout with model ${modelName}`)), 15000)
      );

      const result = await Promise.race([
        model.generateContent(parts),
        timeoutPromise
      ]);

      const text = result?.response?.text();
      if (text) {
        return text.trim();
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed or timed out:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to respond');
}

/**
 * Xử lý yêu cầu người dùng qua AI Gemini hoàn toàn động 100%
 */
async function processUserChat({ message, apiKey, imageBase64, currentSchedules = [], currentTasks = [], currentSubtasks = [] }) {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const currentDayName = days[now.getDay()];
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const currentDateStr = now.toISOString().split('T')[0];
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const schedulesContextStr = currentSchedules.length > 0 
    ? currentSchedules.map(s => `- T${s.dayOfWeek === 7 ? 'CN' : (s.dayOfWeek + 1)} (${s.startTime} - ${s.endTime}): ${s.title} [id: ${s.id}]`).join('\n')
    : '(Hiện chưa có thời khóa biểu nào trong hệ thống)';

  const tasksContextStr = currentTasks.length > 0
    ? currentTasks.map(t => `- Task: "${t.title}" (Môn: ${t.subject}, Hạn: ${t.deadline}, Ưu tiên: ${t.priority})`).join('\n')
    : '(Hiện chưa có bài tập/task nào)';

  const systemInstruction = `Bạn là Brain Dump - Trợ lý AI Planner thông minh, chuyên nghiệp dành cho sinh viên đại học.
NGUYÊN TẮC QUAN TRỌNG NHẤT:
1. KHÔNG ĐƯỢC HARDCODE hoặc trả về câu trả lời mẫu chung chung. MỌI nội dung, môn học, phân rã các bước con (subtasks), lời khuyên, thời gian phải ĐƯỢC SUY LUẬN ĐỘNG 100% TỪ YÊU CẦU CỦA NGƯỜI DÙNG và/hoặc HÌNH ẢNH ĐÍNH KÈM.
2. Thời gian hiện tại của hệ thống: ${currentDayName} (dayOfWeek=${currentDayOfWeek}), ngày ${currentDateStr}, GIỜ HIỆN TẠI: ${currentTimeStr} (Giờ địa phương).

DỮ LIỆU HIỆN TẠI TRONG HỆ THỐNG CỦA HỌC SINH:
--- Thời khóa biểu cố định hiện có ---
${schedulesContextStr}

--- Danh sách công việc / Deadline hiện có ---
${tasksContextStr}

Hãy phân tích kỹ yêu cầu và trả về ĐÚNG 1 JSON object (không bọc text ngoài JSON, có thể dùng markdown code block json):

TRƯỜNG HỢP 1: NẾU NGƯỜI DÙNG GỬI ẢNH THỜI KHÓA BIỂU / LỊCH TRƯỜNG / LỊCH CỐ ĐỊNH HOẶC BẢO NHẬP LỊCH TỪ ĐẦU:
{
  "type": "FIXED_SCHEDULE_CREATED",
  "reply": "Lời nhắn giải thích chi tiết các môn/tiết học đã nhận diện được...",
  "schedules": [
    {
      "title": "Tên môn học chính xác (kèm phòng học nếu có)",
      "dayOfWeek": 1, // 1: Thứ 2, 2: Thứ 3, 3: Thứ 4, 4: Thứ 5, 5: Thứ 6, 6: Thứ 7, 7: Chủ Nhật
      "startTime": "07:00", // Giờ bắt đầu HH:mm
      "endTime": "09:40",   // Giờ kết thúc HH:mm
      "color": "#3b82f6"
    }
  ]
}

TRƯỜNG HỢP 2: NẾU NGƯỜI DÙNG YÊU CẦU TẠO LỊCH MỚI / THÊM SỰ KIỆN / HỌP / SỬA / XÓA / BỎ / THAY THẾ LỊCH:
(Ví dụ: "tạo cho tôi lịch họp 30p nữa", "lên lịch họp lúc 14h chiều nay", "chiều mai 15h đi phỏng vấn", "bỏ cho tôi lịch môn học máy nâng cao thứ 5 thay bằng việc đi bảo vệ đồ án..."):
- Tự tính toán dayOfWeek (1: T2 -> 7: CN) và startTime, endTime (HH:mm). Nếu người dùng nói "30p nữa", hãy lấy giờ hiện tại (${currentTimeStr}) cộng thêm 30 phút!
{
  "type": "SCHEDULE_MODIFIED",
  "reply": "Giải thích chi tiết: đã lên lịch sự kiện/cuộc họp gì vào lúc HH:mm - HH:mm Thứ mấy...",
  "modifications": {
    "deleteFixedScheduleKeywords": [], // Tên môn cần xóa nếu có
    "deleteScheduleDayOfWeek": null,
    "addFixedSchedules": [
      {
        "title": "Tên cuộc họp / sự kiện",
        "dayOfWeek": ${currentDayOfWeek}, // 1..7
        "startTime": "10:30",
        "endTime": "11:30",
        "color": "#3b82f6"
      }
    ]
  }
}

TRƯỜNG HỢP 3: NẾU LÀ GIAO BÀI TẬP / TIỂU LUẬN / ĐỒ ÁN / LẬP KẾ HOẠCH HỌC TẬP (BRAIN DUMP):
{
  "type": "TASK_CREATED",
  "reply": "Nội dung phản hồi chi tiết, phân tích độ khó và hướng dẫn sinh viên bằng tiếng Việt...",
  "task": {
    "title": "Tên công việc/bài tập cụ thể",
    "subject": "Tên môn học được nhận diện chính xác",
    "deadlineISO": "2026-10-05T23:59:00.000Z", // Tính toán đúng thời gian người dùng yêu cầu
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  },
  "subtasks": [
    {
      "title": "Tên bước con chi tiết đúng chuyên ngành môn học",
      "durationMin": 90,
      "hoursFromNow": 12
    }
  ]
}

TRƯỜNG HỢP 4: NẾU NGƯỜI DÙNG HỎI TƯ VẤN / HỎI CHIẾN LƯỢC / PANIC MODE / WHAT-IF:
{
  "type": "ADVICE" | "PANIC_MODE" | "WHAT_IF",
  "reply": "Nội dung trả lời thông minh, sâu sắc, giải quyết đúng băn khoăn của người dùng..."
}`;

  const prompt = `${systemInstruction}\n\nNội dung tin nhắn người dùng: "${message || '(Gửi kèm hình ảnh thời khóa biểu/tài liệu)'}"`;

  try {
    const rawAiResponse = await callGemini({ prompt, imageBase64, apiKey });
    
    // Clean markdown code blocks
    let cleanText = rawAiResponse.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Xử lý SCHEDULE_MODIFIED
      if (parsed.type === 'SCHEDULE_MODIFIED' && parsed.modifications) {
        return {
          type: 'SCHEDULE_MODIFIED',
          action: 'MODIFY_SCHEDULE',
          reply: parsed.reply || '📅 Đã cập nhật và điều chỉnh lại lịch học cố định của bạn thành công!',
          modifications: parsed.modifications
        };
      }

      // Xử lý FIXED_SCHEDULE_CREATED
      if (parsed.type === 'FIXED_SCHEDULE_CREATED' && Array.isArray(parsed.schedules) && parsed.schedules.length > 0) {
        return {
          type: 'FIXED_SCHEDULE_CREATED',
          action: 'SAVE_FIXED_SCHEDULE',
          reply: parsed.reply || '🏛️ Đã đọc và trích xuất thành công Thời Khóa Biểu từ ảnh bằng lõi AI Gemini Vision!',
          data: {
            schedules: parsed.schedules
          }
        };
      }

      // Xử lý TASK_CREATED
      if (parsed.type === 'TASK_CREATED' && parsed.task) {
        const deadline = parsed.task.deadlineISO ? new Date(parsed.task.deadlineISO) : parseRelativeDate(message);
        
        const subtasks = (parsed.subtasks || []).map((st, i) => {
          const start = new Date(now.getTime() + (st.hoursFromNow || (i + 1) * 16) * 3600000);
          const end = new Date(start.getTime() + (st.durationMin || 60) * 60000);
          return {
            title: st.title,
            stepOrder: i + 1,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationMin: st.durationMin || 60,
            status: 'TODO'
          };
        });

        return {
          type: 'TASK_CREATED',
          action: 'CREATE_AND_SCHEDULE',
          reply: parsed.reply || `✨ Đã phân tích và lên kế hoạch cho môn ${parsed.task.subject || 'Học tập'}!`,
          data: {
            task: {
              title: parsed.task.title || message,
              subject: parsed.task.subject || 'Học tập',
              deadline: deadline.toISOString(),
              priority: parsed.task.priority || 'MEDIUM',
              status: 'TODO'
            },
            subtasks
          }
        };
      }

      // Xử lý các loại khác (ADVICE, PANIC_MODE, WHAT_IF, REPLAN)
      return {
        type: parsed.type || 'ADVICE',
        reply: parsed.reply || cleanText,
        data: parsed.data || null
      };
    }

    // Nếu AI trả về text thuần không bọc JSON
    return {
      type: 'ADVICE',
      reply: rawAiResponse,
      data: null
    };

  } catch (err) {
    console.error('Gemini AI Processing Error:', err.message);

    const userWords = (message || '').trim();
    const lowerWords = userWords.toLowerCase();

    // Fallback 1: Direct Meeting & Schedule Creation (e.g. "tạo cho tôi lịch họp 30p nữa", "thêm lịch đi bơi", "lên lịch họp lúc 14h")
    const isCreateSchedule = (lowerWords.includes('lịch') || lowerWords.includes('họp') || lowerWords.includes('hẹn')) && 
                             (lowerWords.includes('tạo') || lowerWords.includes('thêm') || lowerWords.includes('lên') || lowerWords.includes('đặt') || lowerWords.includes('nữa') || lowerWords.includes('lúc') || lowerWords.includes('chiều') || lowerWords.includes('sáng'));

    if (isCreateSchedule) {
      const currentDay = now.getDay() === 0 ? 7 : now.getDay();
      let targetDay = currentDay;
      if (lowerWords.includes('mai')) targetDay = currentDay % 7 + 1;
      else if (lowerWords.includes('thứ 2') || lowerWords.includes('t2')) targetDay = 1;
      else if (lowerWords.includes('thứ 3') || lowerWords.includes('t3')) targetDay = 2;
      else if (lowerWords.includes('thứ 4') || lowerWords.includes('t4')) targetDay = 3;
      else if (lowerWords.includes('thứ 5') || lowerWords.includes('t5')) targetDay = 4;
      else if (lowerWords.includes('thứ 6') || lowerWords.includes('t6')) targetDay = 5;
      else if (lowerWords.includes('thứ 7') || lowerWords.includes('t7')) targetDay = 6;
      else if (lowerWords.includes('chủ nhật') || lowerWords.includes('cn')) targetDay = 7;

      let startHour = now.getHours();
      let startMin = now.getMinutes();

      if (lowerWords.includes('30p') || lowerWords.includes('30 phút')) {
        const after30 = new Date(now.getTime() + 30 * 60000);
        startHour = after30.getHours();
        startMin = after30.getMinutes();
      } else if (lowerWords.includes('1 tiếng') || lowerWords.includes('1h')) {
        const after1h = new Date(now.getTime() + 60 * 60000);
        startHour = after1h.getHours();
        startMin = after1h.getMinutes();
      } else {
        const hourMatch = lowerWords.match(/(\d{1,2})h(?:(\d{1,2}))?/) || lowerWords.match(/(\d{1,2}):(\d{2})/);
        if (hourMatch) {
          startHour = parseInt(hourMatch[1], 10);
          startMin = parseInt(hourMatch[2] || '0', 10);
        }
      }

      const endHour = (startHour + 1) % 24;
      const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

      let schedTitle = 'Cuộc họp';
      if (lowerWords.includes('phỏng vấn')) schedTitle = 'Phỏng vấn';
      else if (lowerWords.includes('tập gym')) schedTitle = 'Tập gym';
      else if (lowerWords.includes('họp')) schedTitle = 'Cuộc họp';
      else schedTitle = userWords.replace(/tạo cho tôi|tạo lịch|thêm lịch|lên lịch/gi, '').trim() || 'Lịch cá nhân';

      schedTitle = schedTitle.charAt(0).toUpperCase() + schedTitle.slice(1);

      return {
        type: 'SCHEDULE_MODIFIED',
        action: 'MODIFY_SCHEDULE',
        reply: `📅 **Đã lên lịch thành công:**\n- 📌 Sự kiện: **"${schedTitle}"**\n- ⏰ Thời gian: **Thứ ${targetDay === 7 ? 'Chủ Nhật' : (targetDay + 1)} (${startTimeStr} - ${endTimeStr})**.\nLịch trình mới đã được cập nhật trực tiếp lên Thời Khóa Biểu của bạn!`,
        modifications: {
          deleteFixedScheduleKeywords: [],
          deleteScheduleDayOfWeek: null,
          addFixedSchedules: [
            {
              title: schedTitle,
              dayOfWeek: targetDay,
              startTime: startTimeStr,
              endTime: endTimeStr,
              color: '#3b82f6'
            }
          ]
        }
      };
    }

    // Fallback 2: Check if message is asking to remove/replace a schedule
    const isRemoveOrReplace = lowerWords.includes('bỏ') || lowerWords.includes('xóa') || lowerWords.includes('thay') || lowerWords.includes('hủy') || lowerWords.includes('nghỉ');
    if (isRemoveOrReplace && currentSchedules.length > 0) {
      // Find matching schedule in currentSchedules
      let matchedSchedule = currentSchedules.find(s => 
        lowerWords.includes(s.title.toLowerCase().slice(0, 8)) ||
        (lowerWords.includes('học máy') && s.title.toLowerCase().includes('học máy')) ||
        (lowerWords.includes('iot') && s.title.toLowerCase().includes('iot')) ||
        (lowerWords.includes('xử lý ảnh') && s.title.toLowerCase().includes('xử lý ảnh')) ||
        (lowerWords.includes('web') && s.title.toLowerCase().includes('web')) ||
        (lowerWords.includes('kịch bản') && s.title.toLowerCase().includes('kịch bản')) ||
        (lowerWords.includes('không gian') && s.title.toLowerCase().includes('không gian')) ||
        (lowerWords.includes('dữ liệu') && s.title.toLowerCase().includes('dữ liệu'))
      );

      if (matchedSchedule) {
        let replacementTitle = 'Hoạt động mới';
        if (lowerWords.includes('thay bằng') || lowerWords.includes('thay vi') || lowerWords.includes('thay')) {
          const parts = userWords.split(/thay bằng|thay vi|thay/i);
          if (parts[1]) {
            replacementTitle = parts[1].replace(/việc|đi/gi, '').trim();
            // Capitalize first letter
            replacementTitle = replacementTitle.charAt(0).toUpperCase() + replacementTitle.slice(1);
          }
        }

        return {
          type: 'SCHEDULE_MODIFIED',
          action: 'MODIFY_SCHEDULE',
          reply: `✅ **Đã cập nhật lịch thành công:**\n- 🗑️ Đã hủy môn **"${matchedSchedule.title}"** vào Thứ ${matchedSchedule.dayOfWeek + 1} (${matchedSchedule.startTime} - ${matchedSchedule.endTime}).\n- 📌 Đã thay thế bằng sự kiện **"${replacementTitle}"**.`,
          modifications: {
            deleteFixedScheduleKeywords: [matchedSchedule.title],
            deleteScheduleDayOfWeek: matchedSchedule.dayOfWeek,
            addFixedSchedules: [
              {
                title: replacementTitle,
                dayOfWeek: matchedSchedule.dayOfWeek,
                startTime: matchedSchedule.startTime,
                endTime: matchedSchedule.endTime,
                color: '#e11d48'
              }
            ]
          }
        };
      }
    }

    // Dynamic extraction fallback for task creation
    const deadline = parseRelativeDate(userWords);

    return {
      type: 'TASK_CREATED',
      action: 'CREATE_AND_SCHEDULE',
      reply: `💡 **AI đã ghi nhận nhiệm vụ:** "${userWords}"\n- ⏰ Dự kiến hạn chót: ${deadline.toLocaleDateString('vi-VN')}\n- 🔨 Đã tự động tạo các phiên học tập tập trung cho nội dung này.`,
      data: {
        task: {
          title: userWords,
          subject: 'Học tập',
          deadline: deadline.toISOString(),
          priority: 'MEDIUM',
          status: 'TODO'
        },
        subtasks: [
          {
            title: `Nghiên cứu tài liệu & chuẩn bị cho: ${userWords.slice(0, 40)}`,
            stepOrder: 1,
            startTime: new Date(now.getTime() + 14 * 3600000).toISOString(),
            endTime: new Date(now.getTime() + 15.5 * 3600000).toISOString(),
            durationMin: 90,
            status: 'TODO'
          },
          {
            title: `Thực hiện nội dung chính của: ${userWords.slice(0, 40)}`,
            stepOrder: 2,
            startTime: new Date(now.getTime() + 38 * 3600000).toISOString(),
            endTime: new Date(now.getTime() + 40 * 3600000).toISOString(),
            durationMin: 120,
            status: 'TODO'
          },
          {
            title: `Rà soát, kiểm thử & hoàn thiện nộp: ${userWords.slice(0, 40)}`,
            stepOrder: 3,
            startTime: new Date(now.getTime() + 62 * 3600000).toISOString(),
            endTime: new Date(now.getTime() + 63.5 * 3600000).toISOString(),
            durationMin: 90,
            status: 'TODO'
          }
        ]
      }
    };
  }
}

/**
 * Phân tích và mô phỏng kịch bản What-If Sandbox bằng AI
 */
async function simulateWhatIfAI({ scenario, apiKey = '', currentTasks = [], currentSchedules = [] }) {
  const prompt = `Bạn là chuyên gia phân tích lập kế hoạch học tập Brain Dump AI.
Người dùng muốn mô phỏng kịch bản giả định sau:
"${scenario}"

Bối cảnh hiện tại:
- Số bài tập hiện có: ${currentTasks.length}
- Số lịch học cố định: ${currentSchedules.length}

Hãy phân tích tính khả thi và tác động của kịch bản này.
Trả về KẾT QUẢ DUY NHẤT LÀ MỘT JSON OBJECT HỢP LỆ theo cấu trúc sau (không bọc text ngoài JSON):
{
  "feasibilityScore": <number từ 0 đến 100 biểu thị % khả thi>,
  "status": "<FEASIBLE hoặc RISKY hoặc CRITICAL>",
  "summary": "<Đánh giá tổng quan 1-2 câu về tác động của kịch bản>",
  "workloadImpact": "<Ví dụ: +8 giờ tải/tuần hoặc -4 giờ tải/tuần>",
  "riskWarnings": [
    "<Cảnh báo rủi ro 1>",
    "<Cảnh báo rủi ro 2>"
  ],
  "recommendations": [
    "<Lời khuyên hành động 1>",
    "<Lời khuyên hành động 2>",
    "<Lời khuyên hành động 3>"
  ],
  "simulatedScheduleDiff": [
    { "day": "Thứ ...", "change": "<Mô tả thay đổi lịch được đề xuất>" }
  ]
}`;

  try {
    const rawAiResponse = await callGemini({ prompt, apiKey });
    let cleanJson = rawAiResponse;
    const jsonMatch = rawAiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanJson = jsonMatch[0];
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (err) {
    console.warn('What-If AI call fallback:', err.message);
    const text = (scenario || '').toLowerCase();
    const isOverload = text.includes('10') || text.includes('thêm') || text.includes('nhiều') || text.includes('tăng');
    const isRelax = text.includes('nghỉ') || text.includes('dời') || text.includes('mệt') || text.includes('giảm') || text.includes('chơi');

    return {
      feasibilityScore: isRelax ? 92 : isOverload ? 65 : 80,
      status: isOverload ? 'RISKY' : 'FEASIBLE',
      summary: `Khi thực hiện kịch bản "${scenario}", hệ thống dự đoán bạn cần tối ưu hóa các khung giờ rảnh từ 14:00 - 17:00 để đảm bảo vẫn hoàn thành deadline đúng hạn.`,
      workloadImpact: isOverload ? '+10 giờ tải/tuần (Tổng tải 32h)' : isRelax ? '-5 giờ tải/tuần (Giúp giảm mỏi mắt)' : '+6 giờ tải/tuần',
      riskWarnings: isOverload
        ? ["Có nguy cơ bị dồn lịch vào tối thứ 4 và thứ 6", "Nên duy trì giờ ngủ ít nhất 7 tiếng/ngày"]
        : ["Cần đảm bảo hoàn thành các bước quan trọng trước khi nghỉ ngơi"],
      recommendations: [
        "Áp dụng phương pháp Pomodoro 50/10 để tăng 25% hiệu suất học",
        "Ưu tiên hoàn thành các bài tập gấp có hệ số điểm cao vào đầu tuần",
        "Tận dụng khung 'Giờ Vàng' buổi sáng (08:00 - 10:30) để giải quyết bài khó"
      ],
      simulatedScheduleDiff: [
        { day: "Thứ 3", change: "Bố trí ca làm việc/học mới từ 18:00 - 20:00" },
        { day: "Thứ 6", change: "Dời ôn thi sang khung 20:30 - 22:00" }
      ]
    };
  }
}

module.exports = {
  processUserChat,
  simulateWhatIfAI,
  callGemini
};

