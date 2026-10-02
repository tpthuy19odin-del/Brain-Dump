--
-- PostgreSQL database dump
--

\restrict 0BbAmINgS1afCfJT2JChNqrxzGIeoZYyZ5MeRehuCed8srgcUtZJtdnBgPfgBW8

-- Dumped from database version 18.6 (6569466)
-- Dumped by pg_dump version 18.3

-- Started on 2026-10-02 20:35:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24621)
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userEmail" text,
    "userId" text
);


ALTER TABLE public."ChatMessage" OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 24576)
-- Name: FixedSchedule; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FixedSchedule" (
    id text NOT NULL,
    title text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    color text DEFAULT '#3b82f6'::character varying NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userEmail" text,
    "userId" text
);


ALTER TABLE public."FixedSchedule" OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 24600)
-- Name: Subtask; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Subtask" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    title text NOT NULL,
    "stepOrder" integer DEFAULT 1 NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "durationMin" integer DEFAULT 45 NOT NULL,
    "actualMin" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'TODO'::character varying NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subtask" OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 24588)
-- Name: Task; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    subject text,
    deadline timestamp(3) without time zone NOT NULL,
    priority text DEFAULT 'MEDIUM'::character varying NOT NULL,
    status text DEFAULT 'TODO'::character varying NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userEmail" text,
    "userId" text
);


ALTER TABLE public."Task" OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 24645)
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    avatar text DEFAULT '🧑‍💻'::character varying NOT NULL,
    "streakDays" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- TOC entry 3466 (class 0 OID 24621)
-- Dependencies: 222
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ChatMessage" (id, role, content, metadata, "createdAt", "userEmail", "userId") FROM stdin;
7df73e52-620e-4ac4-8855-10ca7e7be0c7	assistant	Chào bạn! Hiện tại hệ thống chưa nhận được thông tin cụ thể về việc bạn muốn thay đổi lịch học nào. Bạn hãy cho mình biết rõ hơn bạn muốn sửa, xóa hay thêm lịch học/sự kiện gì nhé, ví dụ: 'đổi lịch môn X sang thứ 6' hoặc 'thêm lịch đi làm thêm sáng thứ 7'.	{"type":"ADVICE","reply":"Chào bạn! Hiện tại hệ thống chưa nhận được thông tin cụ thể về việc bạn muốn thay đổi lịch học nào. Bạn hãy cho mình biết rõ hơn bạn muốn sửa, xóa hay thêm lịch học/sự kiện gì nhé, ví dụ: 'đổi lịch môn X sang thứ 6' hoặc 'thêm lịch đi làm thêm sáng thứ 7'.","data":null}	2026-09-30 02:28:35.473	thuthuy2552004@gmail.com	\N
1cb94a1d-401c-4fec-9891-8305df7e44db	user	thêm cho tôi lịch họp vào thứ 7 14h	\N	2026-09-30 02:29:06.894	linh@student.edu.vn	\N
706710b6-517f-4b6c-8dcf-822dbcfc5eb4	assistant	Chào bạn, hệ thống đã ghi nhận yêu cầu và thêm lịch họp mới vào danh sách thời khóa biểu cố định của bạn vào Thứ 7 từ 14:00 đến 15:30.	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Chào bạn, hệ thống đã ghi nhận yêu cầu và thêm lịch họp mới vào danh sách thời khóa biểu cố định của bạn vào Thứ 7 từ 14:00 đến 15:30.","modifications":{"deleteFixedScheduleKeywords":[],"deleteScheduleDayOfWeek":null,"addFixedSchedules":[{"title":"Lịch họp","dayOfWeek":6,"startTime":"14:00","endTime":"15:30","color":"#3b82f6"}]}}	2026-09-30 02:29:10.592	linh@student.edu.vn	\N
2a0c1cc9-1275-4b1a-94cf-303c0f305af8	user	[Ảnh: Screenshot 2026-09-29 225319.png] Hãy phân tích thời khóa biểu / đề bài từ ảnh này và cập nhật vào hệ thống giúp mình!	\N	2026-09-30 02:29:27.163	linh@student.edu.vn	\N
d5cc1722-2bd2-4318-90ec-c5c083ec6273	assistant	Brain Dump đã phân tích xong thời khóa biểu từ ảnh của bạn! Hệ thống đã ghi nhận các môn học trong tuần gồm: Thứ 2 có Hệ thống IoT và ứng dụng; Thứ 3 có Phân tích và trực quan hóa dữ liệu, Hệ thống thông tin không gian; Thứ 4 có Nhập môn xử lý ảnh; Thứ 5 có Học máy nâng cao và Ngôn ngữ kịch bản; Thứ 6 có Hệ thống IoT và ứng dụng, Phát triển phần mềm web an toàn. Tất cả đã được cập nhật chính xác thời gian và phòng học vào hệ thống!	{"type":"FIXED_SCHEDULE_CREATED","action":"SAVE_FIXED_SCHEDULE","reply":"Brain Dump đã phân tích xong thời khóa biểu từ ảnh của bạn! Hệ thống đã ghi nhận các môn học trong tuần gồm: Thứ 2 có Hệ thống IoT và ứng dụng; Thứ 3 có Phân tích và trực quan hóa dữ liệu, Hệ thống thông tin không gian; Thứ 4 có Nhập môn xử lý ảnh; Thứ 5 có Học máy nâng cao và Ngôn ngữ kịch bản; Thứ 6 có Hệ thống IoT và ứng dụng, Phát triển phần mềm web an toàn. Tất cả đã được cập nhật chính xác thời gian và phòng học vào hệ thống!","data":{"schedules":[{"title":"Hệ thống IoT và ứng dụng - CS1.E402","dayOfWeek":1,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Phân tích và trực quan hóa dữ liệu - CS1.A113","dayOfWeek":2,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Hệ thống thông tin không gian - CS1.A411","dayOfWeek":2,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Nhập môn xử lý ảnh - CS1.A212","dayOfWeek":3,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Học máy nâng cao - CS1.A307","dayOfWeek":4,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Ngôn ngữ kịch bản - CS1.A409","dayOfWeek":4,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT","dayOfWeek":5,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Phát triển phần mềm web an toàn - CS1.A111","dayOfWeek":5,"startTime":"09:50","endTime":"11:35","color":"#3b82f6"}]}}	2026-09-30 02:29:35.999	linh@student.edu.vn	\N
05434d64-edc2-4896-9b62-8e1d55bed3c3	user	tôi cần tạo lịch gấp vào 14h hôm nay có lịch họp	\N	2026-09-30 02:31:20.854	thuynt.22810310074@epu.edu.vn	\N
8cdce856-f60f-463e-9bd2-f69abfe353eb	assistant	Đã ghi nhận yêu cầu của bạn! Hệ thống đã thêm lịch họp vào khung giờ 14:00 - 15:30 chiều nay (Thứ Tư, 30/09/2026).	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Đã ghi nhận yêu cầu của bạn! Hệ thống đã thêm lịch họp vào khung giờ 14:00 - 15:30 chiều nay (Thứ Tư, 30/09/2026).","modifications":{"deleteFixedScheduleKeywords":[],"deleteScheduleDayOfWeek":null,"addFixedSchedules":[{"title":"Họp","dayOfWeek":3,"startTime":"14:00","endTime":"15:30","color":"#f59e0b"}]}}	2026-09-30 02:31:24.892	thuynt.22810310074@epu.edu.vn	\N
6954184a-a435-4209-b0e0-d60f358ffe0a	user	[Ảnh: Screenshot 2026-09-29 225319.png] Hãy phân tích thời khóa biểu / đề bài từ ảnh này và cập nhật vào hệ thống giúp mình!	\N	2026-09-30 01:37:51.666	\N	\N
286b855c-d954-4eab-91eb-03126a9dc709	assistant	Chào bạn! Mình đã phân tích thành công thời khóa biểu từ hình ảnh của bạn. Dưới đây là các lớp học cố định đã được ghi nhận:\n- Thứ 2: Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng: CS1.E402)\n- Thứ 3: Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng: CS1.A113) và Hệ thống thông tin không gian (08:50 - 11:35, Phòng: CS1.A411)\n- Thứ 4: Nhập môn xử lý ảnh (07:00 - 09:40, Phòng: CS1.A212)\n- Thứ 5: Học máy nâng cao (07:00 - 08:45, Phòng: CS1.A307) và Ngôn ngữ kịch bản (08:50 - 11:35, Phòng: CS1.A409)\n- Thứ 6: Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng: CS1.B1201_Khoa CNTT) và Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng: CS1.A111)\n\nTất cả đã được cập nhật vào lịch biểu của bạn!	{"type":"FIXED_SCHEDULE_CREATED","action":"SAVE_FIXED_SCHEDULE","reply":"Chào bạn! Mình đã phân tích thành công thời khóa biểu từ hình ảnh của bạn. Dưới đây là các lớp học cố định đã được ghi nhận:\\n- Thứ 2: Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng: CS1.E402)\\n- Thứ 3: Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng: CS1.A113) và Hệ thống thông tin không gian (08:50 - 11:35, Phòng: CS1.A411)\\n- Thứ 4: Nhập môn xử lý ảnh (07:00 - 09:40, Phòng: CS1.A212)\\n- Thứ 5: Học máy nâng cao (07:00 - 08:45, Phòng: CS1.A307) và Ngôn ngữ kịch bản (08:50 - 11:35, Phòng: CS1.A409)\\n- Thứ 6: Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng: CS1.B1201_Khoa CNTT) và Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng: CS1.A111)\\n\\nTất cả đã được cập nhật vào lịch biểu của bạn!","data":{"schedules":[{"title":"Hệ thống IoT và ứng dụng (Phòng: CS1.E402)","dayOfWeek":1,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Phân tích và trực quan hóa dữ liệu (Phòng: CS1.A113)","dayOfWeek":2,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Hệ thống thông tin không gian (Phòng: CS1.A411)","dayOfWeek":2,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Nhập môn xử lý ảnh (Phòng: CS1.A212)","dayOfWeek":3,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Học máy nâng cao (Phòng: CS1.A307)","dayOfWeek":4,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Ngôn ngữ kịch bản (Phòng: CS1.A409)","dayOfWeek":4,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Hệ thống IoT và ứng dụng (Phòng: CS1.B1201_Khoa CNTT)","dayOfWeek":5,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Phát triển phần mềm web an toàn (Phòng: CS1.A111)","dayOfWeek":5,"startTime":"09:50","endTime":"11:35","color":"#3b82f6"}]}}	2026-09-30 01:37:59.891	\N	\N
ee405b59-c1c6-48c1-83d7-a4538642af63	user	Chấp nhận thay đổi lịch này!	\N	2026-09-30 01:38:06.865	\N	\N
fa4f06d5-2faf-40fb-972f-f311d1fc35ec	assistant	Tuyệt vời! Lịch trình của bạn đã được cập nhật thành công. Hãy giữ vững tinh thần này nhé. Nếu bạn có thêm bài tập, đồ án cần phân rã hoặc muốn điều chỉnh thời gian biểu, cứ gửi ngay cho mình để mình sắp xếp giúp bạn!	{"type":"ADVICE","reply":"Tuyệt vời! Lịch trình của bạn đã được cập nhật thành công. Hãy giữ vững tinh thần này nhé. Nếu bạn có thêm bài tập, đồ án cần phân rã hoặc muốn điều chỉnh thời gian biểu, cứ gửi ngay cho mình để mình sắp xếp giúp bạn!","data":null}	2026-09-30 01:38:08.462	\N	\N
61729012-b157-4d55-bd06-956a05c7b62f	user	sắp xếp cho tôi 2 buổi ôn luyên vào chiều t7 và sáng chủ nhật	\N	2026-09-30 01:38:41.282	\N	\N
8bdf9885-094a-4ec3-829c-0961e8e48343	assistant	Chào bạn! Tôi đã ghi nhận yêu cầu sắp xếp 2 buổi ôn luyện vào chiều Thứ 7 và sáng Chủ Nhật của bạn. Vì đây là lịch ôn tập tự do chưa gắn với một môn học cụ thể nào trong hệ thống, bạn hãy cho tôi biết cụ thể môn học hoặc nội dung bạn cần ôn luyện (ví dụ: Giải tích, Lập trình C++, Triết học Mác-Lênin...) để tôi có thể phân rã thành các bước ôn tập chi tiết và chuẩn xác nhất cho bạn nhé!	{"type":"ADVICE","reply":"Chào bạn! Tôi đã ghi nhận yêu cầu sắp xếp 2 buổi ôn luyện vào chiều Thứ 7 và sáng Chủ Nhật của bạn. Vì đây là lịch ôn tập tự do chưa gắn với một môn học cụ thể nào trong hệ thống, bạn hãy cho tôi biết cụ thể môn học hoặc nội dung bạn cần ôn luyện (ví dụ: Giải tích, Lập trình C++, Triết học Mác-Lênin...) để tôi có thể phân rã thành các bước ôn tập chi tiết và chuẩn xác nhất cho bạn nhé!","data":null}	2026-09-30 01:38:43.062	\N	\N
4495f8e6-8d00-4897-9cd4-4a00680f6601	user	môn ngôn ngữ kịch bản	\N	2026-09-30 01:38:55.45	\N	\N
53de74c3-31db-4aee-9ec2-6a19ff149a9e	assistant	Chào bạn! Với môn 'Ngôn ngữ kịch bản' (thường liên quan đến việc viết kịch bản phim, sân khấu, game hoặc viết script xử lý tự động hóa/web), để mình có thể hỗ trợ bạn lên kế hoạch học tập, giao bài tập hoặc phân rã các bước thực hiện tiểu luận/đồ án một cách chính xác nhất, bạn vui lòng cung cấp thêm chi tiết nhé:\n\n1. Bạn đang cần làm bài tập, đồ án cụ thể nào của môn này (Ví dụ: Viết kịch bản ngắn, phân tích cấu trúc phim, dựng script...)?\n2. Deadline của bài tập/đồ án là khi nào?\n3. Hoặc bạn có muốn gửi ảnh thời khóa biểu/đề bài của môn này lên đây không?\n\nHãy cho mình biết yêu cầu cụ thể của bạn nha!	{"type":"ADVICE","reply":"Chào bạn! Với môn 'Ngôn ngữ kịch bản' (thường liên quan đến việc viết kịch bản phim, sân khấu, game hoặc viết script xử lý tự động hóa/web), để mình có thể hỗ trợ bạn lên kế hoạch học tập, giao bài tập hoặc phân rã các bước thực hiện tiểu luận/đồ án một cách chính xác nhất, bạn vui lòng cung cấp thêm chi tiết nhé:\\n\\n1. Bạn đang cần làm bài tập, đồ án cụ thể nào của môn này (Ví dụ: Viết kịch bản ngắn, phân tích cấu trúc phim, dựng script...)?\\n2. Deadline của bài tập/đồ án là khi nào?\\n3. Hoặc bạn có muốn gửi ảnh thời khóa biểu/đề bài của môn này lên đây không?\\n\\nHãy cho mình biết yêu cầu cụ thể của bạn nha!","data":null}	2026-09-30 01:38:57.4	\N	\N
73f7445a-17d1-4fc9-ac0d-bc3b378fde03	user	tôi cần làm nốt hoàn thiện web để có lịch thi vào thứ 3 tuần sau	\N	2026-09-30 01:39:46.506	\N	\N
3cd402fc-acc7-4d97-b833-f8ea32e56a8f	assistant	Chào bạn, mình là Brain Dump đây! Mình đã ghi nhận yêu cầu hoàn thiện dự án Web của bạn để chuẩn bị cho kỳ thi vào thứ 3 tuần sau (ngày 06/10/2026). Vì đây là một đồ án web, mình đã phân rã tiến độ thành các bước kỹ thuật chuyên môn rõ ràng: từ xử lý Backend/API, hoàn thiện giao diện Frontend, tích hợp Cơ sở dữ liệu cho đến khâu kiểm thử (Testing) cuối cùng. Hãy bám sát kế hoạch này để tự tin bước vào phòng thi nhé!\n\n🚨 **Lưu ý:** Nhiệm vụ này ở mức **RẤT GẤP (URGENT)** nên hệ thống đã **tự động gửi email cảnh báo** về hộp thư `thuthuy2552004@gmail.com` cho bạn! 📧	{"type":"TASK_CREATED","action":"CREATE_AND_SCHEDULE","reply":"Chào bạn, mình là Brain Dump đây! Mình đã ghi nhận yêu cầu hoàn thiện dự án Web của bạn để chuẩn bị cho kỳ thi vào thứ 3 tuần sau (ngày 06/10/2026). Vì đây là một đồ án web, mình đã phân rã tiến độ thành các bước kỹ thuật chuyên môn rõ ràng: từ xử lý Backend/API, hoàn thiện giao diện Frontend, tích hợp Cơ sở dữ liệu cho đến khâu kiểm thử (Testing) cuối cùng. Hãy bám sát kế hoạch này để tự tin bước vào phòng thi nhé!\\n\\n🚨 **Lưu ý:** Nhiệm vụ này ở mức **RẤT GẤP (URGENT)** nên hệ thống đã **tự động gửi email cảnh báo** về hộp thư `thuthuy2552004@gmail.com` cho bạn! 📧","data":{"task":{"title":"Hoàn thiện đồ án Web cho lịch thi","subject":"Lập trình Web","deadline":"2026-10-06T23:59:00.000Z","priority":"URGENT","status":"TODO"},"subtasks":[{"title":"Kiểm tra và hoàn thiện Cơ sở dữ liệu (Database Schema & Queries)","stepOrder":1,"startTime":"2026-09-30T03:39:46.968Z","endTime":"2026-09-30T05:39:46.968Z","durationMin":120,"status":"TODO"},{"title":"Viết và kiểm thử các API Backend chính","stepOrder":2,"startTime":"2026-09-30T07:39:46.968Z","endTime":"2026-09-30T10:39:46.968Z","durationMin":180,"status":"TODO"},{"title":"Hoàn thiện giao diện Frontend và kết nối API","stepOrder":3,"startTime":"2026-10-01T01:39:46.968Z","endTime":"2026-10-01T05:39:46.968Z","durationMin":240,"status":"TODO"},{"title":"Chạy thử toàn hệ thống (End-to-End Testing) và sửa lỗi (Bug fixing)","stepOrder":4,"startTime":"2026-10-02T01:39:46.968Z","endTime":"2026-10-02T03:39:46.968Z","durationMin":120,"status":"TODO"},{"title":"Ôn tập lại code, cấu trúc dự án và chuẩn bị slides/báo cáo","stepOrder":5,"startTime":"2026-10-03T01:39:46.968Z","endTime":"2026-10-03T03:39:46.968Z","durationMin":120,"status":"TODO"}]}}	2026-09-30 01:39:51.264	\N	\N
e31e6e1d-1524-458d-a577-2de5325f03f9	user	Chấp nhận thay đổi lịch này!	\N	2026-09-30 01:40:10.901	\N	\N
d7c229ba-e393-4bea-b15a-0cd2d37d3223	assistant	Tuyệt vời! Tôi đã ghi nhận sự thay đổi lịch của bạn. Hãy tiếp tục cho tôi biết nếu bạn cần cập nhật thêm thời khóa biểu cố định hay phân rã các bài tập, đồ án mới để chúng ta tối ưu hóa kế hoạch học tập nhé!	{"type":"ADVICE","reply":"Tuyệt vời! Tôi đã ghi nhận sự thay đổi lịch của bạn. Hãy tiếp tục cho tôi biết nếu bạn cần cập nhật thêm thời khóa biểu cố định hay phân rã các bài tập, đồ án mới để chúng ta tối ưu hóa kế hoạch học tập nhé!","data":null}	2026-09-30 01:40:12.448	\N	\N
47044c38-0f73-459c-97d0-8c06df6cf5f4	user	giúp tôi tạo công việc chuyển lớp để thi vào 8h43 hôm nay	\N	2026-09-30 01:41:38.339	\N	\N
9b720cf5-1e89-4bce-ba50-d0aa77b1af83	assistant	Chào bạn, tôi đã ghi nhận công việc 'Chuyển lớp để thi' của bạn. Vì hạn chót là 8:43 sáng nay (20/09/2026) - một mốc thời gian rất gần, hệ thống đã đặt độ ưu tiên cao nhất để bạn kịp thời gian chuẩn bị.\n\n🚨 **Lưu ý:** Nhiệm vụ này ở mức **RẤT GẤP (URGENT)** nên hệ thống đã **tự động gửi email cảnh báo** về hộp thư `thuthuy2552004@gmail.com` cho bạn! 📧	{"type":"TASK_CREATED","action":"CREATE_AND_SCHEDULE","reply":"Chào bạn, tôi đã ghi nhận công việc 'Chuyển lớp để thi' của bạn. Vì hạn chót là 8:43 sáng nay (20/09/2026) - một mốc thời gian rất gần, hệ thống đã đặt độ ưu tiên cao nhất để bạn kịp thời gian chuẩn bị.\\n\\n🚨 **Lưu ý:** Nhiệm vụ này ở mức **RẤT GẤP (URGENT)** nên hệ thống đã **tự động gửi email cảnh báo** về hộp thư `thuthuy2552004@gmail.com` cho bạn! 📧","data":{"task":{"title":"Chuyển lớp để thi","subject":"Thủ tục hành chính / Thi cử","deadline":"2026-09-30T08:43:00.000Z","priority":"URGENT","status":"TODO"},"subtasks":[{"title":"Kiểm tra lại thông tin phòng thi và giấy tờ liên quan","stepOrder":1,"startTime":"2026-09-30T17:41:40.500Z","endTime":"2026-09-30T17:51:40.500Z","durationMin":10,"status":"TODO"},{"title":"Di chuyển đến khu vực văn phòng khoa/phòng đào tạo hoặc phòng thi mới","stepOrder":2,"startTime":"2026-09-30T01:47:40.500Z","endTime":"2026-09-30T02:02:40.500Z","durationMin":15,"status":"TODO"},{"title":"Liên hệ giảng viên/cán bộ giám thị để hoàn tất thủ tục chuyển lớp","stepOrder":3,"startTime":"2026-09-30T01:59:40.500Z","endTime":"2026-09-30T02:14:40.500Z","durationMin":15,"status":"TODO"}]}}	2026-09-30 01:41:43.906	\N	\N
9d29751e-2535-44f8-b263-cba3f9c7770d	user	bỏ cho tôi lịch môn học máy nâng cao thứ 5 thay bằng việc đi bảo vệ đồ án nghiên cứu khoa học	\N	2026-09-30 01:43:36.594	\N	\N
9f009320-9002-4bf8-b46b-2cccfeb60b6e	assistant	Chào bạn! Tôi đã ghi nhận việc cập nhật lịch trình của bạn vào Thứ 5 (ngày 01/10/2026): hủy lịch học môn 'Học máy nâng cao' và thay thế bằng sự kiện 'Bảo vệ đồ án nghiên cứu khoa học'. Hệ thống sẽ tự động điều chỉnh lại kế hoạch học tập để bạn có sự chuẩn bị tốt nhất cho buổi bảo vệ quan trọng này.	{"type":"REPLAN","reply":"Chào bạn! Tôi đã ghi nhận việc cập nhật lịch trình của bạn vào Thứ 5 (ngày 01/10/2026): hủy lịch học môn 'Học máy nâng cao' và thay thế bằng sự kiện 'Bảo vệ đồ án nghiên cứu khoa học'. Hệ thống sẽ tự động điều chỉnh lại kế hoạch học tập để bạn có sự chuẩn bị tốt nhất cho buổi bảo vệ quan trọng này.","data":null}	2026-09-30 01:43:38.463	\N	\N
1bf73dab-b5a1-4c42-9fe4-416b5385a96f	user	Chấp nhận thay đổi lịch này!	\N	2026-09-30 01:43:50.06	\N	\N
94fda57f-3068-4cd7-8ff9-d37f79843e29	assistant	Tuyệt vời! Tôi đã ghi nhận việc bạn chấp nhận thay đổi lịch. Nếu đây là lịch học cố định mới hoặc lịch trình cần điều chỉnh, hãy gửi cho tôi hình ảnh thời khóa biểu hoặc mô tả chi tiết các thay đổi để tôi cập nhật lại toàn bộ kế hoạch học tập và danh sách công việc của bạn nhé!	{"type":"ADVICE","reply":"Tuyệt vời! Tôi đã ghi nhận việc bạn chấp nhận thay đổi lịch. Nếu đây là lịch học cố định mới hoặc lịch trình cần điều chỉnh, hãy gửi cho tôi hình ảnh thời khóa biểu hoặc mô tả chi tiết các thay đổi để tôi cập nhật lại toàn bộ kế hoạch học tập và danh sách công việc của bạn nhé!","data":null}	2026-09-30 01:43:51.628	\N	\N
47742bc7-091d-49c6-893c-01b66c920646	user	bỏ cho tôi lịch môn học máy nâng cao thứ 5 thay bằng việc đi bảo vệ đồ án nghiên cứu khoa học	\N	2026-09-30 01:49:45.201	\N	\N
317f8193-f180-4f02-b049-aaca02f6e8c8	assistant	Chào bạn, tôi đã cập nhật lại lịch trình theo yêu cầu: đã xóa lịch học môn 'Học máy nâng cao' vào thứ 5 (ngày 2026-10-01) và thay thế vào khung giờ 07:00 - 08:45 thành sự kiện 'Đi bảo vệ đồ án nghiên cứu khoa học'. Chúc bạn buổi bảo vệ diễn ra thật suôn sẻ!	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Chào bạn, tôi đã cập nhật lại lịch trình theo yêu cầu: đã xóa lịch học môn 'Học máy nâng cao' vào thứ 5 (ngày 2026-10-01) và thay thế vào khung giờ 07:00 - 08:45 thành sự kiện 'Đi bảo vệ đồ án nghiên cứu khoa học'. Chúc bạn buổi bảo vệ diễn ra thật suôn sẻ!","modifications":{"deleteFixedScheduleKeywords":["Học máy nâng cao"],"deleteScheduleDayOfWeek":4,"addFixedSchedules":[{"title":"Đi bảo vệ đồ án nghiên cứu khoa học","dayOfWeek":4,"startTime":"07:00","endTime":"08:45","color":"#e11d48"}]}}	2026-09-30 01:49:50.282	\N	\N
049dac25-c91b-45c4-a7ff-fbbaa7ebffdf	user	[Ảnh: Screenshot 2026-09-29 225319.png] Hãy phân tích thời khóa biểu / đề bài từ ảnh này và cập nhật vào hệ thống giúp mình!	\N	2026-09-30 02:28:15.781	thuthuy2552004@gmail.com	\N
e04fd2be-7b21-4f17-b49d-4879c5d3fd73	assistant	Brain Dump đã phân tích thành công thời khóa biểu từ hình ảnh của bạn! Hệ thống đã ghi nhận các môn học cố định trong tuần bao gồm: \n- Thứ 2: Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng CS1.E402).\n- Thứ 3: Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng CS1.A113) và Hệ thống thông tin không gian (08:50 - 11:35, Phòng CS1.A411).\n- Thứ 4: Nhập môn xử lý ảnh (07:00 - 09:40, Phòng CS1.A212).\n- Thứ 5: Học máy nâng cao (07:00 - 08:45, Phòng CS1.A307) và Ngôn ngữ kịch bản (08:50 - 11:35, Phòng CS1.A409).\n- Thứ 6: Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng CS1.B1201_Khoa CNTT) và Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng CS1.A111).\nTất cả đã được lưu vào hệ thống lịch trình của bạn!	{"type":"FIXED_SCHEDULE_CREATED","action":"SAVE_FIXED_SCHEDULE","reply":"Brain Dump đã phân tích thành công thời khóa biểu từ hình ảnh của bạn! Hệ thống đã ghi nhận các môn học cố định trong tuần bao gồm: \\n- Thứ 2: Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng CS1.E402).\\n- Thứ 3: Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng CS1.A113) và Hệ thống thông tin không gian (08:50 - 11:35, Phòng CS1.A411).\\n- Thứ 4: Nhập môn xử lý ảnh (07:00 - 09:40, Phòng CS1.A212).\\n- Thứ 5: Học máy nâng cao (07:00 - 08:45, Phòng CS1.A307) và Ngôn ngữ kịch bản (08:50 - 11:35, Phòng CS1.A409).\\n- Thứ 6: Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng CS1.B1201_Khoa CNTT) và Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng CS1.A111).\\nTất cả đã được lưu vào hệ thống lịch trình của bạn!","data":{"schedules":[{"title":"Hệ thống IoT và ứng dụng - CS1.E402","dayOfWeek":1,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Phân tích và trực quan hóa dữ liệu - CS1.A113","dayOfWeek":2,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Hệ thống thông tin không gian - CS1.A411","dayOfWeek":2,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Nhập môn xử lý ảnh - CS1.A212","dayOfWeek":3,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Học máy nâng cao - CS1.A307","dayOfWeek":4,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Ngôn ngữ kịch bản - CS1.A409","dayOfWeek":4,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT","dayOfWeek":5,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Phát triển phần mềm web an toàn - CS1.A111","dayOfWeek":5,"startTime":"09:50","endTime":"11:35","color":"#3b82f6"}]}}	2026-09-30 02:28:25.392	thuthuy2552004@gmail.com	\N
d80d15d6-c402-421a-a249-d03a31dfecab	user	Chấp nhận thay đổi lịch này!	\N	2026-09-30 02:28:32.32	thuthuy2552004@gmail.com	\N
bc596d8e-38bf-4033-a87b-d297221568ef	user	tạo cho tôi lịch họp 30p nữa	\N	2026-09-30 02:49:44.823	khoaivu2k3@gmail.com	\N
4e0291b9-eb9c-42d6-a552-0e552a1297bf	assistant	Chào bạn! Hiện tại hệ thống chưa ghi nhận thời khóa biểu cố định hoặc danh sách công việc nào của bạn, đồng thời bạn chưa đính kèm hình ảnh lịch học hay chi tiết về cuộc họp. Vì vậy, tôi chưa thể xác định chính xác thời gian và ngữ cảnh cho cuộc họp sau 30 phút nữa. Bạn vui lòng cung cấp thêm thông tin chi tiết (ví dụ: nội dung cuộc họp, thời gian cụ thể hoặc tải lên thời khóa biểu) để tôi có thể hỗ trợ bạn lên lịch chuẩn xác nhất nhé!	{"type":"ADVICE","reply":"Chào bạn! Hiện tại hệ thống chưa ghi nhận thời khóa biểu cố định hoặc danh sách công việc nào của bạn, đồng thời bạn chưa đính kèm hình ảnh lịch học hay chi tiết về cuộc họp. Vì vậy, tôi chưa thể xác định chính xác thời gian và ngữ cảnh cho cuộc họp sau 30 phút nữa. Bạn vui lòng cung cấp thêm thông tin chi tiết (ví dụ: nội dung cuộc họp, thời gian cụ thể hoặc tải lên thời khóa biểu) để tôi có thể hỗ trợ bạn lên lịch chuẩn xác nhất nhé!","data":null}	2026-09-30 02:49:48.3	khoaivu2k3@gmail.com	\N
a98e1d72-ccc6-4f0f-b902-ee34be8badc3	user	Chấp nhận thay đổi lịch này!	\N	2026-09-30 02:52:21.767	khoaivu2k3@gmail.com	\N
de268a7e-c273-40c7-9dcd-8b55fdbbf207	assistant	Chào bạn! Hiện tại trong hệ thống chưa ghi nhận lịch học cũ hoặc thay đổi nào cụ thể để tôi thực hiện cập nhật. Bạn vui lòng cung cấp thêm thông tin chi tiết về lịch cần thay đổi (ví dụ: tên môn học, ngày trong tuần, giờ học mới) hoặc gửi ảnh lịch học để tôi hỗ trợ bạn chính xác nhất nhé!	{"type":"ADVICE","reply":"Chào bạn! Hiện tại trong hệ thống chưa ghi nhận lịch học cũ hoặc thay đổi nào cụ thể để tôi thực hiện cập nhật. Bạn vui lòng cung cấp thêm thông tin chi tiết về lịch cần thay đổi (ví dụ: tên môn học, ngày trong tuần, giờ học mới) hoặc gửi ảnh lịch học để tôi hỗ trợ bạn chính xác nhất nhé!","data":null}	2026-09-30 02:52:24.16	khoaivu2k3@gmail.com	\N
02b9aa58-7e1a-4278-bda9-5a626bdaebbf	user	tạo cho tôi lịch họp 10p nữa	\N	2026-09-30 02:54:55.572	khoaivu2k3@gmail.com	\N
6a8e466d-2a9d-430a-96be-5aab265ec3a0	assistant	Chào bạn! Tôi đã phân tích thời gian hiện tại là 09:54 và tính toán lịch họp diễn ra sau 10 phút nữa (từ 10:04 đến 11:04) vào hôm nay, Thứ Tư (2026-09-30). Lịch họp đã được cập nhật thành công vào hệ thống của bạn!	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Chào bạn! Tôi đã phân tích thời gian hiện tại là 09:54 và tính toán lịch họp diễn ra sau 10 phút nữa (từ 10:04 đến 11:04) vào hôm nay, Thứ Tư (2026-09-30). Lịch họp đã được cập nhật thành công vào hệ thống của bạn!","modifications":{"deleteFixedScheduleKeywords":[],"deleteScheduleDayOfWeek":null,"addFixedSchedules":[{"title":"Lịch họp","dayOfWeek":3,"startTime":"10:04","endTime":"11:04","color":"#3b82f6"}]}}	2026-09-30 02:54:59.226	khoaivu2k3@gmail.com	\N
30e66bf5-8b8c-4bab-8b82-9954056c262c	user	Liệt kê danh sách tất cả deadline gấp sắp tới	\N	2026-09-30 02:58:27.636	khoaivu2k3@gmail.com	\N
aa731e0a-a70f-45e5-8c24-f4bd245f774f	assistant	Chào bạn! Hiện tại trong hệ thống của bạn chưa có deadline hoặc bài tập nào được ghi nhận. Bạn có thể gửi cho mình danh sách các bài tập, đồ án hoặc thông tin deadline cần hoàn thành để mình hỗ trợ bạn lập kế hoạch chi tiết và sắp xếp thời gian hợp lý nhé!	{"type":"ADVICE","reply":"Chào bạn! Hiện tại trong hệ thống của bạn chưa có deadline hoặc bài tập nào được ghi nhận. Bạn có thể gửi cho mình danh sách các bài tập, đồ án hoặc thông tin deadline cần hoàn thành để mình hỗ trợ bạn lập kế hoạch chi tiết và sắp xếp thời gian hợp lý nhé!","data":null}	2026-09-30 02:58:30.752	khoaivu2k3@gmail.com	\N
30abd4be-2570-42f8-9664-c845d3e1c7df	user	[Ảnh: Screenshot 2026-09-29 225319.png] Hãy phân tích thời khóa biểu / đề bài từ ảnh này và cập nhật vào hệ thống giúp mình!	\N	2026-09-30 03:44:02.184	khoaivu2k3@gmail.com	\N
0a6f0a90-eb96-449b-9872-a82d34362a0e	assistant	Chào bạn! Mình đã phân tích thành công thời khóa biểu từ hình ảnh của bạn. Các lớp học phần và phòng học đã được cập nhật chính xác vào hệ thống:\n- **Thứ 2:** Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng CS1.E402)\n- **Thứ 3:** Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng CS1.A113) & Hệ thống thông tin không gian (08:50 - 11:35, Phòng CS1.A411)\n- **Thứ 4:** Nhập môn xử lý ảnh (07:00 - 09:40, Phòng CS1.A212)\n- **Thứ 5:** Học máy nâng cao (07:00 - 08:45, Phòng CS1.A307) & Ngôn ngữ kịch bản (08:50 - 11:35, Phòng CS1.A409)\n- **Thứ 6:** Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng CS1.B1201_Khoa CNTT) & Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng CS1.A111)\nLịch cố định của bạn đã sẵn sàng!	{"type":"FIXED_SCHEDULE_CREATED","action":"SAVE_FIXED_SCHEDULE","reply":"Chào bạn! Mình đã phân tích thành công thời khóa biểu từ hình ảnh của bạn. Các lớp học phần và phòng học đã được cập nhật chính xác vào hệ thống:\\n- **Thứ 2:** Hệ thống IoT và ứng dụng (07:00 - 08:45, Phòng CS1.E402)\\n- **Thứ 3:** Phân tích và trực quan hóa dữ liệu (07:00 - 08:45, Phòng CS1.A113) & Hệ thống thông tin không gian (08:50 - 11:35, Phòng CS1.A411)\\n- **Thứ 4:** Nhập môn xử lý ảnh (07:00 - 09:40, Phòng CS1.A212)\\n- **Thứ 5:** Học máy nâng cao (07:00 - 08:45, Phòng CS1.A307) & Ngôn ngữ kịch bản (08:50 - 11:35, Phòng CS1.A409)\\n- **Thứ 6:** Hệ thống IoT và ứng dụng (07:00 - 09:40, Phòng CS1.B1201_Khoa CNTT) & Phát triển phần mềm web an toàn (09:50 - 11:35, Phòng CS1.A111)\\nLịch cố định của bạn đã sẵn sàng!","data":{"schedules":[{"title":"Hệ thống IoT và ứng dụng - CS1.E402","dayOfWeek":1,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Phân tích và trực quan hóa dữ liệu - CS1.A113","dayOfWeek":2,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Hệ thống thông tin không gian - CS1.A411","dayOfWeek":2,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Nhập môn xử lý ảnh - CS1.A212","dayOfWeek":3,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Học máy nâng cao - CS1.A307","dayOfWeek":4,"startTime":"07:00","endTime":"08:45","color":"#3b82f6"},{"title":"Ngôn ngữ kịch bản - CS1.A409","dayOfWeek":4,"startTime":"08:50","endTime":"11:35","color":"#3b82f6"},{"title":"Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT","dayOfWeek":5,"startTime":"07:00","endTime":"09:40","color":"#3b82f6"},{"title":"Phát triển phần mềm web an toàn - CS1.A111","dayOfWeek":5,"startTime":"09:50","endTime":"11:35","color":"#3b82f6"}]}}	2026-09-30 03:44:12.64	khoaivu2k3@gmail.com	\N
05363b21-5d97-4068-b980-69cbca34e052	user	tôi có bài thi vào tuần sau cho tôi lịch vào thứ 7 chủ nhật để ôn ngôn ngữ kịch bản	\N	2026-09-30 03:44:57.641	khoaivu2k3@gmail.com	\N
3ab1145d-dcf2-4c63-9172-88273efb42aa	assistant	Chào bạn! Tôi đã phân tích yêu cầu của bạn và thiết lập lịch ôn tập môn Ngôn ngữ kịch bản cho ngày Thứ 7 và Chủ nhật tuần tới (ngày 03/10 và 04/10/2026). Mỗi ngày tôi sắp xếp một khung giờ 3 tiếng (từ 09:00 đến 12:00) để bạn có thời gian tập trung ôn luyện hiệu quả mà không bị quá tải. Chúc bạn ôn tập thật tốt cho kỳ thi sắp tới nhé!	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Chào bạn! Tôi đã phân tích yêu cầu của bạn và thiết lập lịch ôn tập môn Ngôn ngữ kịch bản cho ngày Thứ 7 và Chủ nhật tuần tới (ngày 03/10 và 04/10/2026). Mỗi ngày tôi sắp xếp một khung giờ 3 tiếng (từ 09:00 đến 12:00) để bạn có thời gian tập trung ôn luyện hiệu quả mà không bị quá tải. Chúc bạn ôn tập thật tốt cho kỳ thi sắp tới nhé!","modifications":{"deleteFixedScheduleKeywords":[],"deleteScheduleDayOfWeek":null,"addFixedSchedules":[{"title":"Ôn thi Ngôn ngữ kịch bản","dayOfWeek":6,"startTime":"09:00","endTime":"12:00","color":"#8b5cf6"},{"title":"Ôn thi Ngôn ngữ kịch bản","dayOfWeek":7,"startTime":"09:00","endTime":"12:00","color":"#8b5cf6"}]}}	2026-09-30 03:45:03.384	khoaivu2k3@gmail.com	\N
31d0f9ff-28cf-467b-aa7e-0b6e53b44ec6	user	tối chủ nhật tôi có 2 việc là có hẹn sinh nhật và phải họp vào 10h tối	\N	2026-09-30 03:46:43.273	khoaivu2k3@gmail.com	\N
51f3971b-063a-46ff-9eb9-dc3d52aa5c9b	assistant	Chào bạn, tôi đã ghi nhận thêm 2 sự kiện vào tối Chủ Nhật (ngày 04/10/2026): Hẹn sinh nhật từ 19:00 - 21:00 và Cuộc họp từ 22:00 - 23:00. Tôi đã sắp xếp lịch vào khung giờ này giúp bạn.	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Chào bạn, tôi đã ghi nhận thêm 2 sự kiện vào tối Chủ Nhật (ngày 04/10/2026): Hẹn sinh nhật từ 19:00 - 21:00 và Cuộc họp từ 22:00 - 23:00. Tôi đã sắp xếp lịch vào khung giờ này giúp bạn.","modifications":{"deleteFixedScheduleKeywords":[],"deleteScheduleDayOfWeek":null,"addFixedSchedules":[{"title":"Hẹn sinh nhật","dayOfWeek":7,"startTime":"19:00","endTime":"21:00","color":"#ec4899"},{"title":"Họp","dayOfWeek":7,"startTime":"22:00","endTime":"23:00","color":"#3b82f6"}]}}	2026-09-30 03:46:50.803	khoaivu2k3@gmail.com	\N
33159ad6-027c-4d1b-a15e-cf46068f760c	user	Nhận xét tiến độ học tập và đề xuất phương án cải thiện cho tuần tới	\N	2026-09-30 03:56:56.569	khoaivu2k3@gmail.com	\N
3828c1a4-1dd0-49e1-8f13-bdffc3837777	assistant	Chào bạn! Dựa vào hệ thống hiện tại của bạn trong tuần này (từ ngày 30/09/2026), bạn đang phải đối mặt với một lịch trình khá căng thẳng, đặc biệt là việc chuẩn bị cho kỳ thi môn **Ngôn ngữ kịch bản** vào cuối tuần này (Thứ 7 và Chủ Nhật, từ 09:00 - 12:00) kèm theo lịch hẹn sinh nhật và cuộc họp gấp vào Chủ Nhật.\n\n**Nhận xét tiến độ & Tình hình hiện tại:**\n- **Mật độ môn học:** Bạn có các môn chuyên ngành khá nặng như *Hệ thống IoT*, *Phân tích và trực quan hóa dữ liệu*, *Hệ thống thông tin không gian*, *Nhập môn xử lý ảnh*, *Học máy nâng cao*, *Ngôn ngữ kịch bản*, *Phát triển phần mềm web an toàn*.\n- **Điểm nghẽn:** Sự kiện cấp bách nhất hiện tại là **Ôn thi Ngôn ngữ kịch bản** (2 buổi thi sát nhau vào T7 và CN ngày 03-04/10/2026) được đánh giá mức độ **URGENT**.\n\n**Đề xuất phương án cải thiện cho tuần tới:**\n1. **Chiến lược tập trung cao độ (Sprint) cho 3 ngày tới:** Toàn bộ thời gian trống ngoài giờ lên lớp từ nay đến hết Thứ Sáu cần ưu tiên tuyệt đối cho việc luyện tập code và ôn tập lý thuyết *Ngôn ngữ kịch bản*. Hãy chia nhỏ các chủ đề (ví dụ: cú pháp cơ bản, xử lý tệp, lập trình kịch bản tự động, thao tác với CSDL) thay vì học dồn.\n2. **Quản lý quỹ thời gian cuối tuần:** Bạn có lịch Ôn thi Ngôn ngữ kịch bản vào sáng T7 và CN. Buổi chiều và tối cần cân bằng hợp lý giữa nghỉ ngơi, tham gia *Hẹn sinh nhật* (TCN 19:00) và chuẩn bị cho *Họp* (TCN 22:00) để tránh trạng thái kiệt sức (burnout).\n3. **Lên kế hoạch chủ động cho tuần tới (Tuần từ 05/10):** Ngay sau khi hoàn thành kỳ thi Ngôn ngữ kịch bản vào Chủ Nhật, hãy rà soát lại các bài tập lớn hoặc đồ án của các môn *Hệ thống IoT*, *Học máy nâng cao* và *Phát triển phần mềm web an toàn* để phân bổ thời gian đều đặn mỗi ngày (1.5 - 2 giờ/ngày), tránh tình trạng nước đến chân mới nhảy.	{"type":"ADVICE","reply":"Chào bạn! Dựa vào hệ thống hiện tại của bạn trong tuần này (từ ngày 30/09/2026), bạn đang phải đối mặt với một lịch trình khá căng thẳng, đặc biệt là việc chuẩn bị cho kỳ thi môn **Ngôn ngữ kịch bản** vào cuối tuần này (Thứ 7 và Chủ Nhật, từ 09:00 - 12:00) kèm theo lịch hẹn sinh nhật và cuộc họp gấp vào Chủ Nhật.\\n\\n**Nhận xét tiến độ & Tình hình hiện tại:**\\n- **Mật độ môn học:** Bạn có các môn chuyên ngành khá nặng như *Hệ thống IoT*, *Phân tích và trực quan hóa dữ liệu*, *Hệ thống thông tin không gian*, *Nhập môn xử lý ảnh*, *Học máy nâng cao*, *Ngôn ngữ kịch bản*, *Phát triển phần mềm web an toàn*.\\n- **Điểm nghẽn:** Sự kiện cấp bách nhất hiện tại là **Ôn thi Ngôn ngữ kịch bản** (2 buổi thi sát nhau vào T7 và CN ngày 03-04/10/2026) được đánh giá mức độ **URGENT**.\\n\\n**Đề xuất phương án cải thiện cho tuần tới:**\\n1. **Chiến lược tập trung cao độ (Sprint) cho 3 ngày tới:** Toàn bộ thời gian trống ngoài giờ lên lớp từ nay đến hết Thứ Sáu cần ưu tiên tuyệt đối cho việc luyện tập code và ôn tập lý thuyết *Ngôn ngữ kịch bản*. Hãy chia nhỏ các chủ đề (ví dụ: cú pháp cơ bản, xử lý tệp, lập trình kịch bản tự động, thao tác với CSDL) thay vì học dồn.\\n2. **Quản lý quỹ thời gian cuối tuần:** Bạn có lịch Ôn thi Ngôn ngữ kịch bản vào sáng T7 và CN. Buổi chiều và tối cần cân bằng hợp lý giữa nghỉ ngơi, tham gia *Hẹn sinh nhật* (TCN 19:00) và chuẩn bị cho *Họp* (TCN 22:00) để tránh trạng thái kiệt sức (burnout).\\n3. **Lên kế hoạch chủ động cho tuần tới (Tuần từ 05/10):** Ngay sau khi hoàn thành kỳ thi Ngôn ngữ kịch bản vào Chủ Nhật, hãy rà soát lại các bài tập lớn hoặc đồ án của các môn *Hệ thống IoT*, *Học máy nâng cao* và *Phát triển phần mềm web an toàn* để phân bổ thời gian đều đặn mỗi ngày (1.5 - 2 giờ/ngày), tránh tình trạng nước đến chân mới nhảy.","data":null}	2026-09-30 03:57:01.865	khoaivu2k3@gmail.com	\N
21df9e94-0d87-4ec2-8420-d5f8b3bdfe2d	user	tôi đã hủy lịch họp nên bỏ cho tôi lịch họp tối chủ nhật	\N	2026-09-30 04:01:25.098	khoaivu2k3@gmail.com	\N
efb96014-bc03-4e78-8b9e-aba2bfad9fd3	assistant	Tôi đã ghi nhận và xóa lịch họp vào tối Chủ Nhật (22:00 - 23:00) ra khỏi hệ thống cho bạn.	{"type":"SCHEDULE_MODIFIED","action":"MODIFY_SCHEDULE","reply":"Tôi đã ghi nhận và xóa lịch họp vào tối Chủ Nhật (22:00 - 23:00) ra khỏi hệ thống cho bạn.","modifications":{"deleteFixedScheduleKeywords":["Họp"],"deleteScheduleDayOfWeek":7,"addFixedSchedules":[]}}	2026-09-30 04:01:30.464	khoaivu2k3@gmail.com	\N
1485b97b-3f49-47a8-b3b1-03f2c4e04b0f	user	muốn cái của tài liệu còn lại	\N	2026-09-30 04:08:06.527	khoaivu2k3@gmail.com	\N
24ce6374-82c7-4b30-8e33-a3de0a406b07	assistant	Chào bạn! Hiện tại bạn có các tài liệu và lịch ôn thi 'Ngôn ngữ kịch bản' rất gấp vào cuối tuần này (Thứ 7 ngày 03/10 và Chủ Nhật ngày 04/10 từ 09:00 - 12:00). Nếu bạn muốn xử lý nốt phần tài liệu còn lại, hãy cho mình biết cụ thể đó là tài liệu của môn nào (Ví dụ: Hệ thống IoT, Xử lý ảnh, Ngôn ngữ kịch bản...) hoặc nội dung cụ thể bạn cần hoàn thành để mình có thể lên kế hoạch chi tiết và sắp xếp thời gian hợp lý nhất cho bạn nhé!	{"type":"ADVICE","reply":"Chào bạn! Hiện tại bạn có các tài liệu và lịch ôn thi 'Ngôn ngữ kịch bản' rất gấp vào cuối tuần này (Thứ 7 ngày 03/10 và Chủ Nhật ngày 04/10 từ 09:00 - 12:00). Nếu bạn muốn xử lý nốt phần tài liệu còn lại, hãy cho mình biết cụ thể đó là tài liệu của môn nào (Ví dụ: Hệ thống IoT, Xử lý ảnh, Ngôn ngữ kịch bản...) hoặc nội dung cụ thể bạn cần hoàn thành để mình có thể lên kế hoạch chi tiết và sắp xếp thời gian hợp lý nhất cho bạn nhé!","data":null}	2026-09-30 04:08:12.419	khoaivu2k3@gmail.com	\N
\.


--
-- TOC entry 3463 (class 0 OID 24576)
-- Dependencies: 219
-- Data for Name: FixedSchedule; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FixedSchedule" (id, title, "dayOfWeek", "startTime", "endTime", color, "createdAt", "userEmail", "userId") FROM stdin;
5d986a56-c74a-4911-a742-8c2afc7ddbfd	Hệ thống IoT và ứng dụng (Phòng: CS1.E402)	1	07:00	08:45	#3b82f6	2026-09-30 01:37:56.143	\N	\N
b2ceec15-3d72-4d11-b2ec-3dc45d5f4a83	Phân tích và trực quan hóa dữ liệu (Phòng: CS1.A113)	2	07:00	08:45	#3b82f6	2026-09-30 01:37:56.833	\N	\N
3335a970-13a0-47dc-b204-f7dc6dfb06a5	Hệ thống thông tin không gian (Phòng: CS1.A411)	2	08:50	11:35	#3b82f6	2026-09-30 01:37:57.294	\N	\N
a29e397c-06d7-4e4d-873a-36c02f5fe900	Nhập môn xử lý ảnh (Phòng: CS1.A212)	3	07:00	09:40	#3b82f6	2026-09-30 01:37:57.759	\N	\N
ec99eb01-ccc9-4ab0-a9dd-c69d0e9c5efd	Ngôn ngữ kịch bản (Phòng: CS1.A409)	4	08:50	11:35	#3b82f6	2026-09-30 01:37:58.706	\N	\N
0f4ce8ed-9446-440b-8739-f6d394897ef8	Hệ thống IoT và ứng dụng (Phòng: CS1.B1201_Khoa CNTT)	5	07:00	09:40	#3b82f6	2026-09-30 01:37:59.198	\N	\N
318ab586-3d5c-4447-9c9b-f8b7a3f21ea6	Phát triển phần mềm web an toàn (Phòng: CS1.A111)	5	09:50	11:35	#3b82f6	2026-09-30 01:37:59.659	\N	\N
b262eda5-9a93-49ce-9bcc-9a51ac4d7436	Đi bảo vệ đồ án nghiên cứu khoa học	4	07:00	08:45	#e11d48	2026-09-30 01:49:49.82	\N	\N
5bea9c46-3c47-405f-a0a5-b310ef8aca31	Hệ thống IoT và ứng dụng - CS1.E402	1	07:00	08:45	#3b82f6	2026-09-30 02:28:21.536	thuthuy2552004@gmail.com	\N
22d38eae-4aac-4725-89da-979209d8a4c0	Phân tích và trực quan hóa dữ liệu - CS1.A113	2	07:00	08:45	#3b82f6	2026-09-30 02:28:22.256	thuthuy2552004@gmail.com	\N
c3c95781-1d50-4799-bb16-c93b6b98b444	Hệ thống thông tin không gian - CS1.A411	2	08:50	11:35	#3b82f6	2026-09-30 02:28:22.733	thuthuy2552004@gmail.com	\N
9c62c4a6-2190-47b1-b3ec-d7910b0de5e9	Nhập môn xử lý ảnh - CS1.A212	3	07:00	09:40	#3b82f6	2026-09-30 02:28:23.214	thuthuy2552004@gmail.com	\N
f6240acc-24a3-48a9-a433-fc4d36482a15	Học máy nâng cao - CS1.A307	4	07:00	08:45	#3b82f6	2026-09-30 02:28:23.692	thuthuy2552004@gmail.com	\N
a0442f49-6b2e-4cc4-936a-a0f773711cfc	Ngôn ngữ kịch bản - CS1.A409	4	08:50	11:35	#3b82f6	2026-09-30 02:28:24.173	thuthuy2552004@gmail.com	\N
acc84a73-fe40-4a1e-9b59-7f36f5e06130	Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT	5	07:00	09:40	#3b82f6	2026-09-30 02:28:24.655	thuthuy2552004@gmail.com	\N
614d2fbf-7188-4f24-a3b4-b612763fd6e4	Phát triển phần mềm web an toàn - CS1.A111	5	09:50	11:35	#3b82f6	2026-09-30 02:28:25.14	thuthuy2552004@gmail.com	\N
3904873e-b554-4fb2-b9dd-572ec4008717	Lịch họp	6	14:00	15:30	#3b82f6	2026-09-30 02:29:10.136	linh@student.edu.vn	\N
a5f45db1-44f4-4a22-8081-b0fe4ad93e07	Hệ thống IoT và ứng dụng - CS1.E402	1	07:00	08:45	#3b82f6	2026-09-30 02:29:32.139	linh@student.edu.vn	\N
42573516-0167-42d2-bcc8-5f8af7597bc9	Phân tích và trực quan hóa dữ liệu - CS1.A113	2	07:00	08:45	#3b82f6	2026-09-30 02:29:32.86	linh@student.edu.vn	\N
d5d778c8-ad6e-449d-a3d2-8228aebb818a	Hệ thống thông tin không gian - CS1.A411	2	08:50	11:35	#3b82f6	2026-09-30 02:29:33.342	linh@student.edu.vn	\N
3af22804-7b37-4ce1-a6d1-f7f29bcab2df	Nhập môn xử lý ảnh - CS1.A212	3	07:00	09:40	#3b82f6	2026-09-30 02:29:33.823	linh@student.edu.vn	\N
5f4ee1ad-de87-4875-bac0-798bea529b2b	Học máy nâng cao - CS1.A307	4	07:00	08:45	#3b82f6	2026-09-30 02:29:34.304	linh@student.edu.vn	\N
797079b7-860b-4b40-8d90-42d3e9a002ef	Ngôn ngữ kịch bản - CS1.A409	4	08:50	11:35	#3b82f6	2026-09-30 02:29:34.79	linh@student.edu.vn	\N
037c305c-dc9e-49b2-8f81-f254b2f72262	Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT	5	07:00	09:40	#3b82f6	2026-09-30 02:29:35.272	linh@student.edu.vn	\N
ecf5259c-53d9-46df-91f7-5c6d4ddf139e	Phát triển phần mềm web an toàn - CS1.A111	5	09:50	11:35	#3b82f6	2026-09-30 02:29:35.758	linh@student.edu.vn	\N
5665f7cd-3e87-4b9d-a0bb-8909b2626bc9	Họp	3	14:00	15:30	#f59e0b	2026-09-30 02:31:24.419	thuynt.22810310074@epu.edu.vn	\N
18c52133-0b5e-4fb9-9c06-2cfdf443ab2d	Lịch họp	3	10:04	11:04	#3b82f6	2026-09-30 02:54:58.758	khoaivu2k3@gmail.com	\N
2c75d4b1-8a1f-45ad-9851-3d414811ae20	Hệ thống IoT và ứng dụng - CS1.E402	1	07:00	08:45	#3b82f6	2026-09-30 03:44:08.562	khoaivu2k3@gmail.com	\N
49694425-0012-419f-b021-43fde14b2db0	Phân tích và trực quan hóa dữ liệu - CS1.A113	2	07:00	08:45	#3b82f6	2026-09-30 03:44:09.57	khoaivu2k3@gmail.com	\N
73498ee3-1263-4b18-9b1d-3a64e14c2b80	Hệ thống thông tin không gian - CS1.A411	2	08:50	11:35	#3b82f6	2026-09-30 03:44:10.038	khoaivu2k3@gmail.com	\N
0731ac86-ff58-4b6a-9fe4-a30bd7f3afd8	Nhập môn xử lý ảnh - CS1.A212	3	07:00	09:40	#3b82f6	2026-09-30 03:44:10.522	khoaivu2k3@gmail.com	\N
9d6427a5-c888-4ea0-810f-103414ab291a	Học máy nâng cao - CS1.A307	4	07:00	08:45	#3b82f6	2026-09-30 03:44:10.993	khoaivu2k3@gmail.com	\N
ca43b70d-bb5d-44b1-8e63-9eb1f23c34cf	Ngôn ngữ kịch bản - CS1.A409	4	08:50	11:35	#3b82f6	2026-09-30 03:44:11.463	khoaivu2k3@gmail.com	\N
b97c8da5-e7db-4e2d-9745-ca646052305e	Hệ thống IoT và ứng dụng - CS1.B1201_Khoa CNTT	5	07:00	09:40	#3b82f6	2026-09-30 03:44:11.933	khoaivu2k3@gmail.com	\N
d488b1e6-bc89-4cf4-8743-eb17f14078a0	Phát triển phần mềm web an toàn - CS1.A111	5	09:50	11:35	#3b82f6	2026-09-30 03:44:12.405	khoaivu2k3@gmail.com	\N
a635d5f4-4f7f-43d3-a9b8-3214ec5312f9	Ôn thi Ngôn ngữ kịch bản	6	09:00	12:00	#8b5cf6	2026-09-30 03:45:01.327	khoaivu2k3@gmail.com	\N
60c57103-b9c2-4aa2-94a5-46b043c2cc62	Ôn thi Ngôn ngữ kịch bản	7	09:00	12:00	#8b5cf6	2026-09-30 03:45:02.706	khoaivu2k3@gmail.com	\N
6df1151c-ead6-4e2e-9725-353e642e7ce1	Hẹn sinh nhật	7	19:00	21:00	#ec4899	2026-09-30 03:46:48.605	khoaivu2k3@gmail.com	\N
\.


--
-- TOC entry 3465 (class 0 OID 24600)
-- Dependencies: 221
-- Data for Name: Subtask; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Subtask" (id, "taskId", title, "stepOrder", "startTime", "endTime", "durationMin", "actualMin", status, "createdAt", "updatedAt") FROM stdin;
68bb844a-d184-44ae-b7b4-b2e5f0bf3c5f	23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Kiểm tra và hoàn thiện Cơ sở dữ liệu (Database Schema & Queries)	1	2026-09-30 03:39:46.968	2026-09-30 05:39:46.968	120	0	TODO	2026-09-30 01:39:49.816	2026-09-30 01:39:49.816
edf2d1af-c0f6-4520-92d7-1a07f9c21407	23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Viết và kiểm thử các API Backend chính	2	2026-09-30 07:39:46.968	2026-09-30 10:39:46.968	180	0	TODO	2026-09-30 01:39:50.33	2026-09-30 01:39:50.33
b4677f15-56aa-4d33-9160-c06897dabb6f	23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Hoàn thiện giao diện Frontend và kết nối API	3	2026-10-01 01:39:46.968	2026-10-01 05:39:46.968	240	0	TODO	2026-09-30 01:39:50.562	2026-09-30 01:39:50.562
26a236d7-bd16-4a77-91f6-bc9df04e764d	23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Chạy thử toàn hệ thống (End-to-End Testing) và sửa lỗi (Bug fixing)	4	2026-10-02 01:39:46.968	2026-10-02 03:39:46.968	120	0	TODO	2026-09-30 01:39:50.794	2026-09-30 01:39:50.794
b9c41ee7-37e4-485a-8a28-1c05a2cf08ec	23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Ôn tập lại code, cấu trúc dự án và chuẩn bị slides/báo cáo	5	2026-10-03 01:39:46.968	2026-10-03 03:39:46.968	120	0	TODO	2026-09-30 01:39:51.026	2026-09-30 01:39:51.026
9fbc69f4-1964-4ca7-8f7f-80aa51c93bcf	c61ad3f5-6de0-4a35-8f22-854a8495ad2e	Kiểm tra lại thông tin phòng thi và giấy tờ liên quan	1	2026-09-30 17:41:40.5	2026-09-30 17:51:40.5	10	0	TODO	2026-09-30 01:41:42.947	2026-09-30 01:41:42.947
66dd7548-e63f-4785-8d0b-d7174a3f5a0b	c61ad3f5-6de0-4a35-8f22-854a8495ad2e	Di chuyển đến khu vực văn phòng khoa/phòng đào tạo hoặc phòng thi mới	2	2026-09-30 01:47:40.5	2026-09-30 02:02:40.5	15	0	TODO	2026-09-30 01:41:43.423	2026-09-30 01:41:43.423
383e4bad-db7f-4b06-bcb1-4ccb998fb026	c61ad3f5-6de0-4a35-8f22-854a8495ad2e	Liên hệ giảng viên/cán bộ giám thị để hoàn tất thủ tục chuyển lớp	3	2026-09-30 01:59:40.5	2026-09-30 02:14:40.5	15	0	TODO	2026-09-30 01:41:43.663	2026-09-30 01:41:43.663
e528b676-2698-4678-8e64-0698e4a94f38	bdbaf9b0-246f-4c7c-829f-b2a29d8ee9cf	Tham gia: Ôn thi Ngôn ngữ kịch bản (09:00 - 12:00)	1	2026-10-03 02:00:00	2026-10-03 03:00:00	60	0	TODO	2026-09-30 03:45:02.246	2026-09-30 03:45:02.246
b7790b0b-40b1-433d-96f4-4796dda78012	1af76a9a-7751-4545-95ce-69906c9895ed	Tham gia: Ôn thi Ngôn ngữ kịch bản (09:00 - 12:00)	1	2026-10-04 02:00:00	2026-10-04 03:00:00	60	0	TODO	2026-09-30 03:45:03.156	2026-09-30 03:45:03.156
3d905696-439e-4f23-9cf3-71c90d16c75c	3e5b2286-a8ee-44ac-bfce-de5510948410	Tham gia: Hẹn sinh nhật (19:00 - 21:00)	1	2026-10-04 12:00:00	2026-10-04 13:00:00	60	0	DONE	2026-09-30 03:46:49.575	2026-09-30 03:54:06.021
\.


--
-- TOC entry 3464 (class 0 OID 24588)
-- Dependencies: 220
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Task" (id, title, subject, deadline, priority, status, "createdAt", "updatedAt", "userEmail", "userId") FROM stdin;
23de71f4-39aa-4eaa-9d7c-c00c6a69da0e	Hoàn thiện đồ án Web cho lịch thi	Lập trình Web	2026-10-06 23:59:00	URGENT	TODO	2026-09-30 01:39:49.354	2026-09-30 01:39:49.354	\N	\N
c61ad3f5-6de0-4a35-8f22-854a8495ad2e	Chuyển lớp để thi	Thủ tục hành chính / Thi cử	2026-09-30 08:43:00	URGENT	TODO	2026-09-30 01:41:42.475	2026-09-30 01:41:42.475	\N	\N
bdbaf9b0-246f-4c7c-829f-b2a29d8ee9cf	Ôn thi Ngôn ngữ kịch bản	Lịch Thi	2026-10-03 02:00:00	URGENT	TODO	2026-09-30 03:45:01.793	2026-09-30 03:45:01.793	khoaivu2k3@gmail.com	\N
1af76a9a-7751-4545-95ce-69906c9895ed	Ôn thi Ngôn ngữ kịch bản	Lịch Thi	2026-10-04 02:00:00	URGENT	TODO	2026-09-30 03:45:02.932	2026-09-30 03:45:02.932	khoaivu2k3@gmail.com	\N
3e5b2286-a8ee-44ac-bfce-de5510948410	Hẹn sinh nhật	Lịch Trình	2026-10-04 12:00:00	HIGH	TODO	2026-09-30 03:46:49.098	2026-09-30 03:46:49.098	khoaivu2k3@gmail.com	\N
\.


--
-- TOC entry 3467 (class 0 OID 24645)
-- Dependencies: 223
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, email, password, name, avatar, "streakDays", "createdAt", "updatedAt") FROM stdin;
c9e1807d-7169-4650-98f7-1b820c0aaef7	thuthuy2552004@gmail.com	$2b$10$40RN5mJoRxG/p9SIwWBFk.QZ1UVFtpmgYTFJlXrqot65Lx/Upb1za	Thu thủy	🧑‍💻	1	2026-09-30 01:35:54.497	2026-09-30 01:35:54.497
f49c2583-bd68-4ad4-b677-eb95f7c936fc	thuynt.22810310074@epu.edu.vn	$2b$10$AIB7ywYOMZLrPzmDs4zQpuO0E5Hy29ty9F/tsreRbGHPmdccWmQni	Thủy Thu	🧑‍💻	1	2026-09-30 02:10:06.814	2026-09-30 02:10:06.814
199af9eb-a02e-4a53-acb8-94d3409a660e	khoaivu2k3@gmail.com	$2b$10$g.XGU35iMV/RUv92c10/hutOa/7BbhlcufdfIFkeuf1bJn57Miar2	Khoái Vũ	🧑‍💻	1	2026-09-30 02:49:32.257	2026-09-30 02:49:32.257
\.


--
-- TOC entry 3307 (class 2606 OID 24667)
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3301 (class 2606 OID 24683)
-- Name: FixedSchedule FixedSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FixedSchedule"
    ADD CONSTRAINT "FixedSchedule_pkey" PRIMARY KEY (id);


--
-- TOC entry 3305 (class 2606 OID 24706)
-- Name: Subtask Subtask_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Subtask"
    ADD CONSTRAINT "Subtask_pkey" PRIMARY KEY (id);


--
-- TOC entry 3303 (class 2606 OID 24726)
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- TOC entry 3309 (class 2606 OID 24738)
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- TOC entry 3311 (class 2606 OID 24748)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3315 (class 2606 OID 57354)
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3312 (class 2606 OID 57344)
-- Name: FixedSchedule FixedSchedule_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FixedSchedule"
    ADD CONSTRAINT "FixedSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3314 (class 2606 OID 24756)
-- Name: Subtask Subtask_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Subtask"
    ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3313 (class 2606 OID 57349)
-- Name: Task Task_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2068 (class 826 OID 16399)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2067 (class 826 OID 16398)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-10-02 20:37:46

--
-- PostgreSQL database dump complete
--

\unrestrict 0BbAmINgS1afCfJT2JChNqrxzGIeoZYyZ5MeRehuCed8srgcUtZJtdnBgPfgBW8

