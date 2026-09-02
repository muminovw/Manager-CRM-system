<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Report.css';

  let isLoading = true;
  let reportMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Hisobot ko'rsatkichlari
  let totalStudents = 0;
  let totalTeachers = 0;
  let totalGroups = 0;
  let totalRevenue = 0;
  let averageAttendance = 0;
  let debtorsCount = 0;

  let recentKPIList = [];

  // Ma'lumotlarni yig'ish va hisobotni shakllantirish
  async function generateReport() {
    isLoading = true;
    try {
      // 1. O'quvchilar
      const { data: students } = await supabase.from('students').select('*');
      if (students) {
        totalStudents = students.length;
        debtorsCount = students.filter(s => s.status === 'Qarzdor').length;
        totalRevenue = students.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
        const attSum = students.reduce((sum, s) => sum + (Number(s.attendance_percentage) || 100), 0);
        averageAttendance = totalStudents ? Math.round(attSum / totalStudents) : 100;
      }

      // 2. O'qituvchilar
      const { data: teachers } = await supabase.from('teachers').select('*');
      if (teachers) totalTeachers = teachers.length;

      // 3. Guruhlar
      const { data: groups } = await supabase.from('groups').select('*');
      if (groups) totalGroups = groups.length;

      // 4. KPI natijalari
      const { data: kpi } = await supabase
        .from('educational_kpi')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(5);
      
      if (kpi) recentKPIList = kpi;

    } catch (error) {
      console.error('Hisobotni shakllantirishda xatolik:', error.message);
    } finally {
      isLoading = false;
    }
  }

  // Chop etish funksiyasi
  function printReport() {
    window.print();
  }

  onMount(() => {
    generateReport();
  });
</script>

<div class="reports-container">
  <div class="reports-header">
    <h2>📈 O'quv Markaz Yakuniy Hisobotlar Paneli</h2>
    <div class="header-actions">
      <div class="month-box">
        <span>Davr:</span>
        <input type="month" bind:value={reportMonth} on:change={generateReport} />
      </div>
      <button class="print-btn" on:click={printReport}>🖨️ Hisobotni Chop etish</button>
    </div>
  </div>

  {#if isLoading}
    <div class="loading-state">Hisobotlar tayyorlanmoqda... ⏳</div>
  {:else}
    <!-- ASOSIY STATISTIKA KARTALARI -->
    <div class="report-cards-grid">
      <div class="rep-card">
        <div class="rep-icon blue">👨‍🎓</div>
        <div class="rep-info">
          <span>Jami O'quvchilar</span>
          <h3>{totalStudents} nafar</h3>
        </div>
      </div>

      <div class="rep-card">
        <div class="rep-icon green">💰</div>
        <div class="rep-info">
          <span>Oy Tushumi (Kassa)</span>
          <h3>{totalRevenue.toLocaleString()} UZS</h3>
        </div>
      </div>

      <div class="rep-card">
        <div class="rep-icon orange">⚠️</div>
        <div class="rep-info">
          <span>Qarzdor O'quvchilar</span>
          <h3>{debtorsCount} ta</h3>
        </div>
      </div>

      <div class="rep-card">
        <div class="rep-icon purple">🎓</div>
        <div class="rep-info">
          <span>O'rtacha Davomat</span>
          <h3>{averageAttendance}%</h3>
        </div>
      </div>
    </div>

    <!-- TAFSILOTLI HISOBOT BLOKLARI -->
    <div class="report-sections-grid">
      <!-- Umumiy faoliyat xulosasi -->
      <div class="rep-box">
        <h3>📋 Markaz Resurslari Xulosasi</h3>
        <ul class="summary-list">
          <li><span>Faol o'qituvchilar soni:</span> <strong>{totalTeachers} nafar</strong></li>
          <li><span>Faol o'quv guruhlari:</span> <strong>{totalGroups} ta</strong></li>
          <li><span>Moliya holati:</span> <strong class="text-success">Barqaror</strong></li>
          <li><span>Davomat ko'rsatkichi:</span> <strong class="text-info">{averageAttendance}% (A'lo)</strong></li>
        </ul>
      </div>

      <!-- Eng yaxshi xodimlar KPI reytingi hisoboti -->
      <div class="rep-box">
        <h3>⭐ Top Xodimlar va O'qituvchilar Reytingi</h3>
        <div class="mini-kpi-list">
          {#each recentKPIList as kpi, idx}
            <div class="mini-kpi-item">
              <span>#{idx + 1} {kpi.employee_name} ({kpi.role})</span>
              <span class="badge-score">{kpi.total_score} ball</span>
            </div>
          {/each}
          {#if recentKPIList.length === 0}
            <p class="empty-text">Hozircha xodimlar KPI natijalari yo'q.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>