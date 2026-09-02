<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Attendance.css';

  let selectedGroup = 'FN-102';
  let selectedDate = new Date().toISOString().split('T')[0];
  let lessonStartTime = '09:00';

  let students = [];
  let arrivalTimes = {};
  let isLoading = false;

  let currentTime = new Date();
  let timer;

  onMount(() => {
    timer = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    loadAttendanceData();
  });

  onDestroy(() => {
    clearInterval(timer);
  });

  // Supabase'dan tanlangan guruh o'quvchilarini va saqlangan davomatni yuklash
  async function loadAttendanceData() {
    isLoading = true;
    arrivalTimes = {};

    // 1. O'quvchilarni guruh bo'yicha olish
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('group_name', selectedGroup);

    if (studentError) {
      console.error('Oʻquvchilarni yuklashda xatolik:', studentError.message);
    } else {
      students = studentData || [];
    }

    // 2. Sana va guruh bo'yicha davomat yozuvlarini olish
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('group_name', selectedGroup)
      .eq('date', selectedDate);

    if (!attendanceError && attendanceData) {
      const fetchedTimes = {};
      attendanceData.forEach(item => {
        if (item.arrival_time) {
          fetchedTimes[item.student_id] = item.arrival_time;
        }
      });
      arrivalTimes = fetchedTimes;
    }

    isLoading = false;
  }

  // Guruh yoki sana o'zgarganda ma'lumotlarni avtomatik qayta yuklash
  $: if (selectedGroup || selectedDate) {
    loadAttendanceData();
  }

  // Status va kechikish vaqtini aniq hisoblash funksiyasi
  function calculateStatus(studentId, timesMap) {
    const timeValue = timesMap[studentId];

    if (!timeValue || timeValue.trim() === '') {
      return { status: 'absent', label: '❌ Kelmadi' };
    }

    const [startH, startM] = lessonStartTime.split(':').map(Number);
    const [arrH, arrM] = timeValue.split(':').map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const arrTotalMinutes = arrH * 60 + arrM;

    const diff = arrTotalMinutes - startTotalMinutes;

    if (diff <= 0) {
      return { status: 'present', label: '✅ Kelgan (O‘z vaqtida)' };
    } else {
      return { status: 'late', label: `⚠️ Kechikdi (${diff} daq)` };
    }
  }

  // Input orqali vaqt kiritilganda Reaktivlikni ta'minlash
  function handleTimeChange(studentId, timeValue) {
    arrivalTimes = {
      ...arrivalTimes,
      [studentId]: timeValue
    };
  }

  // Hozirgi vaqtni qo'yish
  function markPresentNow(studentId) {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    handleTimeChange(studentId, `${hours}:${minutes}`);
  }

  // Kelmagan deb belgilash (vaqtni o'chirish)
  function markAbsent(studentId) {
    const newTimes = { ...arrivalTimes };
    delete newTimes[studentId];
    arrivalTimes = newTimes;
  }

  // Davomatni Supabase-ga saqlash
  async function handleSave() {
    if (students.length === 0) {
      alert('Saqlash uchun oʻquvchilar mavjud emas!');
      return;
    }

    const records = students.map(student => {
      const timeVal = arrivalTimes[student.id] || null;
      const calc = calculateStatus(student.id, arrivalTimes);

      return {
        student_id: student.id,
        group_name: selectedGroup,
        date: selectedDate,
        arrival_time: timeVal,
        status: calc.status
      };
    });

    // Avval shu sana va guruh yozuvlarini tozalab, yangisini joylaymiz
    await supabase
      .from('attendance')
      .delete()
      .eq('group_name', selectedGroup)
      .eq('date', selectedDate);

    const { error } = await supabase.from('attendance').insert(records);

    if (error) {
      alert('Saqlashda xatolik yuz berdi: ' + error.message);
    } else {
      alert('Davomat Supabase-ga muvaffaqiyatli saqlandi!');
    }
  }
</script>

<div class="attendance-page">
  <!-- Boshqaruv Paneli -->
  <div class="attendance-control-panel">
    <div class="live-clock-card">
      <span class="clock-icon">🕒</span>
      <div class="clock-info">
        <span class="clock-label">Hozirgi vaqt:</span>
        <span class="clock-time">{currentTime.toLocaleTimeString()}</span>
      </div>
    </div>

    <div class="filter-group">
      <div class="input-field">
        <label for="group-select">Guruh:</label>
        <select id="group-select" bind:value={selectedGroup}>
          <option value="FN-102">FN-102 (Frontend)</option>
          <option value="PY-201">PY-201 (Python)</option>
          <option value="UX-301">UX-301 (UI/UX)</option>
        </select>
      </div>

      <div class="input-field">
        <label for="lesson-time">Dars boshlanishi:</label>
        <input id="lesson-time" type="time" bind:value={lessonStartTime} />
      </div>

      <div class="input-field">
        <label for="attendance-date">Sana:</label>
        <input id="attendance-date" type="date" bind:value={selectedDate} />
      </div>
    </div>

    <button class="save-btn" on:click={handleSave}>💾 Saqlash</button>
  </div>

  <!-- Davomat Jadvali -->
  <div class="table-container">
    <table class="attendance-table">
      <thead>
        <tr>
          <th>#</th>
          <th>O‘QUVCHI ISM-FAMILIYASI</th>
          <th>KELGAN VAQTI</th>
          <th>HOLATI (AVTOMATIK)</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr>
            <td colspan="5" class="empty-row">Ma'lumotlar yuklanmoqda...</td>
          </tr>
        {:else}
          {#each students as student, index (student.id)}
            {@const result = calculateStatus(student.id, arrivalTimes)}
            <tr>
              <td>{index + 1}</td>
              <td class="font-bold">{student.name}</td>
              <td>
                <input 
                  type="time" 
                  class="time-input"
                  value={arrivalTimes[student.id] || ''} 
                  on:input={(e) => handleTimeChange(student.id, e.target.value)}
                />
              </td>
              <td>
                <span class="status-badge {result.status}">
                  {result.label}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  {#if arrivalTimes[student.id]}
                    <button 
                      class="btn-action absent" 
                      on:click={() => markAbsent(student.id)}
                      title="Kelmagan deb belgilash"
                    >
                      🚫 Kelmadi (O'chirish)
                    </button>
                  {:else}
                    <button 
                      class="btn-action present" 
                      on:click={() => markPresentNow(student.id)}
                      title="Hozirgi vaqt bilan belgilash"
                    >
                      ⚡ Hozir keldi
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}

          {#if students.length === 0}
            <tr>
              <td colspan="5" class="empty-row">
                Ushbu guruhda o‘quvchilar topilmadi. Avval "O'quvchilar" bo'limida yangi o'quvchi qo'shing.
              </td>
            </tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>