<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Attendance.css';

  let teachers = [];
  let selectedDate = new Date().toISOString().split('T')[0];

  let attendanceData = {}; // Statuslar: 'Keldi', 'Kelmadi', 'Sababli'
  let arrivalTimes = {};    // O'qituvchining kelgan vaqti
  let targetTimes = {};     // Har bir o'qituvchining o'zining belgilangan (start) vaqti
  let lateDurations = {};   // Kechikkan minutlar
  let isLoading = false;
  let isSaving = false;

  let currentTime = '';
  let timer;

  // Live soat
  function updateClock() {
    const now = new Date();
    currentTime = now.toTimeString().split(' ')[0];
  }

  // O'qituvchilarni bazadan olish
  async function fetchTeachers() {
    isLoading = true;
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Xatolik:', error.message);
    } else {
      teachers = data || [];
      let initialStatus = {};
      let initialTimes = {};
      let initialTargets = {};
      let initialLate = {};
      const nowTime = new Date().toTimeString().slice(0, 5); // HH:MM

      teachers.forEach(t => {
        initialStatus[t.id] = 'Keldi';
        initialTargets[t.id] = '09:00'; // Standart boshlang'ich belgilangan vaqt
        initialTimes[t.id] = nowTime;
        initialLate[t.id] = calculateLateMinutes(nowTime, '09:00');
      });

      attendanceData = initialStatus;
      targetTimes = initialTargets;
      arrivalTimes = initialTimes;
      lateDurations = initialLate;
    }
    isLoading = false;
  }

  // Kechikishni minutda hisoblash
  function calculateLateMinutes(arrivalTime, startTime) {
    if (!arrivalTime || !startTime) return 0;
    
    const [arrH, arrM] = arrivalTime.split(':').map(Number);
    const [strH, strM] = startTime.split(':').map(Number);

    const arrTotalMinutes = arrH * 60 + arrM;
    const strTotalMinutes = strH * 60 + strM;

    const diffMinutes = arrTotalMinutes - strTotalMinutes;
    return diffMinutes > 0 ? diffMinutes : 0;
  }

  // O'qituvchining belgilangan vaqt o'zgarganda kechikishni qayta hisoblash
  function handleTargetTimeChange(teacherId, timeStr) {
    targetTimes[teacherId] = timeStr;
    targetTimes = { ...targetTimes };

    if (arrivalTimes[teacherId]) {
      updateLateDuration(teacherId, arrivalTimes[teacherId], timeStr);
    }
  }

  // O'qituvchining kelgan vaqti o'zgarganda
  function handleArrivalTimeChange(teacherId, timeStr) {
    arrivalTimes[teacherId] = timeStr;
    arrivalTimes = { ...arrivalTimes };

    updateLateDuration(teacherId, timeStr, targetTimes[teacherId]);

    if (attendanceData[teacherId] !== 'Kelmadi' && attendanceData[teacherId] !== 'Sababli') {
      attendanceData[teacherId] = 'Keldi';
    }
  }

  // Kechikishni hisoblab joylash funksiyasi
  function updateLateDuration(teacherId, arrival, target) {
    const lateMins = calculateLateMinutes(arrival, target);
    lateDurations[teacherId] = lateMins;
    lateDurations = { ...lateDurations };
  }

  // 3 ta tugma uchun statusni o'rnatish
  function setStatus(teacherId, status) {
    attendanceData[teacherId] = status;
    attendanceData = { ...attendanceData };
  }

  // Davomatni bazaga saqlash
  async function saveAttendance() {
    if (teachers.length === 0) {
      alert('Saqlash uchun o‘qituvchilar yo‘q!');
      return;
    }

    isSaving = true;
    const recordsToInsert = teachers.map(teacher => ({
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      subject: teacher.subject,
      date: selectedDate,
      status: attendanceData[teacher.id] || 'Keldi',
      arrival_time: arrivalTimes[teacher.id] || null,
      target_time: targetTimes[teacher.id] || '09:00', // Agar bazada target_time ustuni bo'lsa
      late_minutes: lateDurations[teacher.id] || 0
    }));

    const { error } = await supabase
      .from('teacher_attendance')
      .insert(recordsToInsert);

    isSaving = false;

    if (error) {
      alert('Saqlashda xatolik: ' + error.message);
    } else {
      alert('Davomat muvaffaqiyatli saqlandi! ✅');
    }
  }

  onMount(() => {
    updateClock();
    timer = setInterval(updateClock, 1000);
    fetchTeachers();
  });

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<div class="attendance-page">
  <!-- YUQORI PANEL -->
  <div class="attendance-header-panel">
    <div class="header-left">
      <!-- Live soat -->
      <div class="live-clock-box">
        <span class="clock-icon">🕒</span>
        <div class="clock-info">
          <span class="clock-label">Joriy vaqt</span>
          <span class="clock-time">{currentTime}</span>
        </div>
      </div>
      
      <!-- Sana tanlash -->
      <div class="filter-item">
        <label>Sana:</label>
        <input type="date" bind:value={selectedDate} />
      </div>
    </div>

    <button class="save-btn" on:click={saveAttendance} disabled={isSaving}>
      {isSaving ? 'Saqlanmoqda...' : '💾 Davomatni Saqlash'}
    </button>
  </div>

  <!-- JADVAL QISMI -->
  <div class="table-container">
    <table class="attendance-table">
      <thead>
        <tr>
          <th>#</th>
          <th>O‘QITUVCHI & BELGILANGAN VAQT</th>
          <th>FAN</th>
          <th>KELGAN VAQTI</th>
          <th>HOLATI & KECHIKISH</th>
          <th>STATUS (3 TA TUGMA)</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="6" class="center">Yuklanmoqda...</td></tr>
        {:else}
          {#each teachers as teacher, index}
            <tr class="table-row">
              <td class="index-cell">{index + 1}</td>
              
              <!-- O'QITUVCHI ISMI VA UNING YONIDAGI BELGILANGAN VAQTI -->
              <td>
                <div class="teacher-info-box">
                  <div class="teacher-name">{teacher.name}</div>
                  <div class="target-time-wrapper">
                    <span class="target-label">Belgilangan:</span>
                    <input 
                      type="time" 
                      class="mini-time-input"
                      value={targetTimes[teacher.id] || '09:00'} 
                      on:change={(e) => handleTargetTimeChange(teacher.id, e.target.value)}
                    />
                  </div>
                </div>
              </td>

              <td><span class="subject-badge">{teacher.subject || 'Asosiy'}</span></td>
              
              <!-- KELGAN VAQTI -->
              <td>
                <input 
                  type="time" 
                  class="arrival-time-input"
                  value={arrivalTimes[teacher.id] || ''} 
                  on:change={(e) => handleArrivalTimeChange(teacher.id, e.target.value)}
                />
              </td>

              <!-- HOLATI VA KECHIKISH -->
              <td>
                {#if attendanceData[teacher.id] === 'Keldi'}
                  {#if (lateDurations[teacher.id] || 0) > 0}
                    <span class="late-badge-warning">
                      ⚠️ {lateDurations[teacher.id]} minut kechikdi
                    </span>
                  {:else}
                    <span class="on-time-badge">
                      ✨ O'z vaqtida keldi
                    </span>
                  {/if}
                {:else if attendanceData[teacher.id] === 'Kelmadi'}
                  <span class="absent-badge-text">❌ Kelmadi</span>
                {:else if attendanceData[teacher.id] === 'Sababli'}
                  <span class="excused-badge-text">🟡 Sababli</span>
                {/if}
              </td>

              <!-- 3 TA TUGMA -->
              <td>
                <div class="status-buttons">
                  <button 
                    class="status-btn present {attendanceData[teacher.id] === 'Keldi' ? 'active' : ''}" 
                    on:click={() => setStatus(teacher.id, 'Keldi')}>
                    ✅ Keldi
                  </button>
                  
                  <button 
                    class="status-btn absent {attendanceData[teacher.id] === 'Kelmadi' ? 'active' : ''}" 
                    on:click={() => setStatus(teacher.id, 'Kelmadi')}>
                    ❌ Kelmadi
                  </button>

                  <button 
                    class="status-btn excused {attendanceData[teacher.id] === 'Sababli' ? 'active' : ''}" 
                    on:click={() => setStatus(teacher.id, 'Sababli')}>
                    🟡 Sababli
                  </button>
                </div>
              </td>
            </tr>
          {/each}
          {#if teachers.length === 0}
            <tr><td colspan="6" class="center">O‘qituvchilar topilmadi.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>