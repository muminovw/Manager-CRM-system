<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './EducationalKPI.css';

  let kpiList = [];
  let employeeName = '';
  let role = 'O\'qituvchi';
  let classesHeld = 0;
  let studentsAttendance = 100;
  let tasksCompleted = 0;
  let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  let isLoading = false;
  let isSaving = false;

  // Bazadan KPI ma'lumotlarini olish va ball bo'yicha tartiblash
  async function fetchKPI() {
    isLoading = true;
    const { data, error } = await supabase
      .from('educational_kpi')
      .select('*')
      .order('total_score', { ascending: false });

    if (error) {
      console.error('Xatolik:', error.message);
    } else {
      kpiList = data || [];
    }
    isLoading = false;
  }

  // O'quv markaz uchun KPI ballini avtomatik hisoblash formulasi:
  // Darslar soni * 2 + Davomat foizi * 0.4 + Vazifalar * 5
  function calculateScore(classes, attendance, tasks) {
    return (Number(classes) * 2) + (Number(attendance) * 0.4) + (Number(tasks) * 5);
  }

  // Yangi KPI yozuvini qo'shish
  async function saveKPI() {
    if (!employeeName.trim()) {
      alert('Iltimos, xodimning F.I.O. sini kiriting!');
      return;
    }

    isSaving = true;
    const totalScore = calculateScore(classesHeld, studentsAttendance, tasksCompleted);

    const { error } = await supabase
      .from('educational_kpi')
      .insert([{
        employee_name: employeeName,
        role,
        classes_held: classesHeld,
        students_attendance: studentsAttendance,
        tasks_completed: tasksCompleted,
        total_score: Number(totalScore.toFixed(1)),
        month: currentMonth
      }]);

    isSaving = false;

    if (error) {
      alert('Saqlashda xatolik: ' + error.message);
    } else {
      employeeName = '';
      classesHeld = 0;
      studentsAttendance = 100;
      tasksCompleted = 0;
      fetchKPI();
    }
  }

  // O'chirish
  async function deleteKPI(id) {
    if (!confirm('Haqiqatan ham bu yozuvni o‘chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('educational_kpi')
      .delete()
      .eq('id', id);

    if (error) {
      alert('O‘chirishda xatolik: ' + error.message);
    } else {
      fetchKPI();
    }
  }

  onMount(() => {
    fetchKPI();
  });
</script>

<div class="kpi-container">
  <div class="kpi-header">
    <h2>🎯 O'quv Markaz Xodimlari KPI Reytingi</h2>
    <div class="month-box">
      <span>Davr:</span>
      <input type="month" bind:value={currentMonth} />
    </div>
  </div>

  <!-- KPI KIRITISH FORMASI -->
  <div class="kpi-form-grid">
    <input type="text" placeholder="Xodim F.I.O (Masalan: Anvar Rahimov)" bind:value={employeeName} />
    
    <select bind:value={role}>
      <option value="O'qituvchi">🎓 O'qituvchi</option>
      <option value="Menejer">💼 Menejer / Admin</option>
    </select>

    <div class="mini-input">
      <label>O'tilgan darslar:</label>
      <input type="number" bind:value={classesHeld} min="0" />
    </div>

    <div class="mini-input">
      <label>O'quvchilar davomati (%):</label>
      <input type="number" bind:value={studentsAttendance} min="0" max="100" />
    </div>

    <div class="mini-input">
      <label>Bajarilgan vazifalar:</label>
      <input type="number" bind:value={tasksCompleted} min="0" />
    </div>

    <button on:click={saveKPI} disabled={isSaving}>
      {isSaving ? 'Hisoblanmoqda...' : '⚡ KPI Hisoblash va Saqlash'}
    </button>
  </div>

  <!-- TOP 3 LIDERLAR (PODIUM) -->
  {#if kpiList.length > 0}
    <div class="podium-section">
      {#each kpiList.slice(0, 3) as top, index}
        <div class="podium-card rank-{index + 1}">
          <div class="podium-rank">
            {#if index === 0} 🥇 1-O'rin 
            {:else if index === 1} 🥈 2-O'rin 
            {:else} 🥉 3-O'rin {/if}
          </div>
          <div class="podium-name">{top.employee_name}</div>
          <div class="podium-role">{top.role}</div>
          <div class="podium-score">⭐ {top.total_score} ball</div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- BARCHA XODIMLAR JADVALI -->
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>O'rin</th>
          <th>Xodim F.I.O</th>
          <th>Lavozimi</th>
          <th>Darslar</th>
          <th>Davomat</th>
          <th>Vazifalar</th>
          <th>Umumiy Ball</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="8" class="center-text">Ma'lumotlar yuklanmoqda...</td></tr>
        {:else}
          {#each kpiList as item, index}
            <tr>
              <td class="rank-num">#{index + 1}</td>
              <td class="font-bold text-white">{item.employee_name}</td>
              <td><span class="role-badge">{item.role}</span></td>
              <td>📚 {item.classes_held} ta</td>
              <td>📊 {item.students_attendance}%</td>
              <td>✅ {item.tasks_completed} ta</td>
              <td><span class="score-badge">{item.total_score} ball</span></td>
              <td>
                <button class="delete-btn" on:click={() => deleteKPI(item.id)}>🗑️ O'chirish</button>
              </td>
            </tr>
          {/each}
          {#if kpiList.length === 0}
            <tr><td colspan="8" class="center-text">Hozircha KPI natijalari kiritilmagan.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>