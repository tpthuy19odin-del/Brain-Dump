const nodemailer = require('nodemailer');

// Create test account or use configured SMTP
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // If user configured SMTP in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const cleanUser = process.env.SMTP_USER.trim();
    const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '').trim();

    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });
    console.log('📧 Configured real Gmail SMTP Transporter with:', cleanUser);
    return transporter;
  }

  // Otherwise, create an automated Ethereal test inbox for instant demo
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📬 Ethereal Test Email Transporter initialized:', testAccount.user);
  } catch (e) {
    console.warn('Ethereal test account failed, using mock transport:', e.message);
    transporter = {
      sendMail: async (opts) => {
        console.log('📧 Mock Email Sent to:', opts.to, 'Subject:', opts.subject);
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  return transporter;
}

// Generate HTML email template
function createUrgentEmailTemplate({ userName, urgentTasks = [], meetingEvents = [], examEvents = [], todayEvents = [] }) {
  const meetingRows = meetingEvents.map((e, idx) => `
    <div style="background: #ffffff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 13px; font-weight: 800; color: #1e40af;">👥 #${idx + 1}. ${e.title}</span>
        <span style="background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">LỊCH HỌP</span>
      </div>
      <div style="font-size: 12px; color: #475569;">
        <strong>⏰ Thời gian:</strong> Thứ ${e.dayOfWeek === 7 ? 'Chủ Nhật' : (e.dayOfWeek + 1)} (${e.startTime} - ${e.endTime})
      </div>
    </div>
  `).join('');

  const examRows = examEvents.map((e, idx) => `
    <div style="background: #ffffff; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 13px; font-weight: 800; color: #9f1239;">🎓 #${idx + 1}. ${e.title}</span>
        <span style="background: #ffe4e6; color: #9f1239; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">LỊCH THI / BẢO VỆ</span>
      </div>
      <div style="font-size: 12px; color: #475569;">
        <strong>⏰ Thời gian:</strong> Thứ ${e.dayOfWeek === 7 ? 'Chủ Nhật' : (e.dayOfWeek + 1)} (${e.startTime} - ${e.endTime})
      </div>
    </div>
  `).join('');

  const todayRows = todayEvents.map((e, idx) => `
    <div style="background: #ffffff; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 13px; font-weight: 800; color: #166534;">📅 #${idx + 1}. ${e.title}</span>
        <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">HÔM NAY</span>
      </div>
      <div style="font-size: 12px; color: #475569;">
        <strong>⏰ Khung giờ:</strong> ${e.startTime} - ${e.endTime}
      </div>
    </div>
  `).join('');

  const taskRows = urgentTasks.map((t, idx) => `
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 13px; font-weight: 800; color: #9a3412;">🚨 #${idx + 1}. ${t.title}</span>
        <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">HẠN GẤP</span>
      </div>
      <div style="font-size: 12px; color: #475569; line-height: 1.5;">
        <div><strong>📚 Môn:</strong> ${t.subject || 'Học tập'} • <strong>⏰ Hạn chót:</strong> <span style="color: #dc2626; font-weight: bold;">${new Date(t.deadline).toLocaleString('vi-VN')}</span></div>
        ${t.subtasks && t.subtasks.length > 0 ? `<div style="margin-top: 4px;"><strong>🔨 Các bước:</strong> ${t.subtasks.map(st => st.title).join(' ➔ ')}</div>` : ''}
      </div>
    </div>
  `).join('');

  const totalCount = meetingEvents.length + examEvents.length + todayEvents.length + urgentTasks.length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Brain Dump - Tổng Hợp Lịch Trình & Việc Gấp</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1b4d3e 0%, #226e57 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">🧠 BRAIN DUMP - AI PLANNER</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #dcfce7;">Báo cáo tổng hợp Lịch họp, Lịch thi & Nhiệm vụ quan trọng</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          <p style="font-size: 14px; margin-top: 0;">Chào <strong>${userName || 'bạn'}</strong>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Hệ thống AI vừa quét toàn bộ lịch của bạn và tổng hợp <strong style="color: #1b4d3e;">${totalCount} sự kiện & nhiệm vụ quan trọng</strong> bạn cần chú ý:
          </p>

          <!-- 1. Lịch Họp / Gặp gỡ -->
          ${meetingEvents.length > 0 ? `
            <div style="margin: 16px 0 8px 0;">
              <h3 style="font-size: 12px; color: #1e40af; margin: 0 0 8px 0; text-transform: uppercase;">👥 Lịch Họp & Gặp Gỡ (${meetingEvents.length}):</h3>
              ${meetingRows}
            </div>
          ` : ''}

          <!-- 2. Lịch Thi / Bảo Vệ Đồ Án -->
          ${examEvents.length > 0 ? `
            <div style="margin: 16px 0 8px 0;">
              <h3 style="font-size: 12px; color: #9f1239; margin: 0 0 8px 0; text-transform: uppercase;">🎓 Lịch Thi & Bảo Vệ Đồ Án (${examEvents.length}):</h3>
              ${examRows}
            </div>
          ` : ''}

          <!-- 3. Lịch Trình Trong Ngày Hôm Nay -->
          ${todayEvents.length > 0 ? `
            <div style="margin: 16px 0 8px 0;">
              <h3 style="font-size: 12px; color: #166534; margin: 0 0 8px 0; text-transform: uppercase;">📅 Lịch Trình Hôm Nay (${todayEvents.length}):</h3>
              ${todayRows}
            </div>
          ` : ''}

          <!-- 4. Hạn Chót & Bài Tập Rất Gấp -->
          ${urgentTasks.length > 0 ? `
            <div style="margin: 16px 0 8px 0;">
              <h3 style="font-size: 12px; color: #9a3412; margin: 0 0 8px 0; text-transform: uppercase;">🚨 Hạn Chót & Nhiệm Vụ Gấp (${urgentTasks.length}):</h3>
              ${taskRows}
            </div>
          ` : ''}

          <!-- Call to action button -->
          <div style="text-align: center; margin-top: 25px; margin-bottom: 20px;">
            <a href="http://localhost:5173" style="display: inline-block; background: #1b4d3e; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(27,77,62,0.3);">
              🚀 Mở Ứng Dụng Brain Dump Planner
            </a>
          </div>

          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">
            Email tự động từ Trợ lý AI Brain Dump • Chúc bạn một ngày học tập & làm việc hiệu quả!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send Urgent Reminder Email
async function sendUrgentReminderEmail({ toEmail, userName, urgentTasks = [], meetingEvents = [], examEvents = [], todayEvents = [] }) {
  const totalCount = urgentTasks.length + meetingEvents.length + examEvents.length + todayEvents.length;
  if (totalCount === 0) {
    return { success: false, message: 'Không có nhiệm vụ, lịch họp hoặc sự kiện nào để gửi email.' };
  }

  const mailTransporter = await getTransporter();
  const htmlContent = createUrgentEmailTemplate({ userName, urgentTasks, meetingEvents, examEvents, todayEvents });

  const senderEmail = (process.env.SMTP_USER || 'no-reply@braindump.ai').trim();
  const mailOptions = {
    from: `"Brain Dump AI Planner" <${senderEmail}>`,
    to: toEmail || senderEmail,
    subject: `[Brain Dump] Tổng hợp ${totalCount} lịch trình quan trọng & nhiệm vụ gấp - ${userName || 'Sinh viên'}`,
    html: htmlContent,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };

  const info = await mailTransporter.sendMail(mailOptions);
  let previewUrl = null;
  if (nodemailer.getTestMessageUrl) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Preview Email Remind URL:', previewUrl);
    }
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
    count: totalCount,
    to: toEmail
  };
}

module.exports = {
  sendUrgentReminderEmail
};
