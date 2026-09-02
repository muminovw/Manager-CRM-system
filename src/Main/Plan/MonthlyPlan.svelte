<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './MonthlyPlan.css';

  let isLoading = true;
  let isSaving = false;
  let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Reja ma'lumotlari
  let targetRevenue = 50000000; // Standart reja: 50 mln
  let actualRevenue = 0;
  let targetStudents = 100;
  let actualStudents = 0;
  let planNotes = '';
  let planId = null;

  // Hisoblangan ko'rsatkichlar
  let revenuePercentage = 0;
  let studentsPercentage = 0;
  let remainingRevenue = 0;

  // Bazadan ma'lumotlarni tortish va avtomatik hisob-kitob
  async function fetchMonthlyPlan() {
    isLoading = true;
    try {
      // 1. Joriy oy uchun tushum va o'quvchilar sonini students jadvalidan hisoblab olamiz
      const { data: studentsData } = await supabase.from('students').select('*');
      if (studentsData) {
        actualStudents = studentsData.length;
        actualRevenue = studentsData.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
      }

      // 2. Oylik reja jadvalidan shu oygi reja ma'lumotlarini olish
      const { data: planData, error } = await supabase
        .from('monthly_plans')
        .select('*')
        .eq('month_name', currentMonth)
        .single();

      if (planData) {
        planId = planData.id;
        targetRevenue = Number(planData.target_revenue) || 50000000;
        targetStudents = Number(planData.target_students) || 100;
        planNotes = planData.notes || '';
      } else {
        // Agar bu oy uchun reja hali kiritilmagan bo'lsa, avtomatik standart qo'yamiz
        planId = null;
      }

      // Foizlarni hisoblash
      revenuePercentage = targetRevenue > 0 ? Math.min(Math.round((actualRevenue / targetRevenue) * 100), 100) : 0;
      studentsPercentage = targetStudents > 0 ? Math.min(Math.round((actualStudents / targetStudents) * 100), 100) : 0;
      remainingRevenue = Math.max(targetRevenue - actualRevenue, 0);

    } catch (error) {
      console.error('Xatolik:', error.message);
    } finally {
      isLoading = false;
    }
  }

  // Rejani saqlash yoki yangilash
  async function savePlan() {
    isSaving = true;
    try {
      const payload = {
        month_name: currentMonth,
        target_revenue: targetRevenue,
        actual_revenue: actualRevenue,
        target_students: targetStudents,
        actual_students: actualStudents,
        notes: planNotes
      };

      if (planId) {
        // Yangilash
        const { error } = await supabase
          .from('monthly_plans')
          .update(payload)
          .eq('id', planId);
        if (error) throw error;
      } else {
        // Yangi qo'shish
        const { error } = await supabase
          .from('monthly_plans')
          .insert([payload]);
        if (error) throw error;
      }

      alert('Oylik reja muvaffaqiyatli saqlandi! ✅');
      fetchMonthlyPlan();
    } catch (error) {
      alert('Saqlashda xatolik: ' + error.message);
    } finally {
      isSaving = false;
    }
  }

  onMount(() => {
    fetchMonthlyPlan();
  });
</script>

<div class="plan-container">
  <div class="plan-header">
    <h2>🎯 O'quv Markaz Oylik Reja va Moliyaviy Maqsadlar</h2>
    <div class="month-box">
      <span>Tanlangan oy:</span>
      <input type="month" bind:value={currentMonth} on:change={fetchMonthlyPlan} />
    </div>
  </div>

  {#if isLoading}
    <div class="loading-state">Ma'lumotlar yuklanmoqda... ⏳</div>
  {:else}
    <!-- ASOSIY PROGRESS KARTALARI -->
    <div class="plan-grid">
      <!-- Moliya / Tushum rejasi -->
      <div class="plan-card">
        <div class="card-top">
          <h3>💰 Moliya va Tushum Rejasi</h3>
          <span class="badge {revenuePercentage >= 100 ? 'success' : 'warning'}">{revenuePercentage}% Bajarildi</span>
        </div>
        <div class="amounts-row">
          <div>
            <span class="label">Amaldagi Tushum:</span>
            <h4 class="text-green">{actualRevenue.toLocaleString()} UZS</h4>
          </div>
          <div>
            <span class="label">Oylik Reja (Target):</span>
            <h4>{targetRevenue.toLocaleString()} UZS</h4>
          </div>
        </div>
        <div class="progress-box">
          <div class="progress-bg">
            <div class="progress-fg" style="width: {revenuePercentage}%; background: {revenuePercentage >= 100 ? '#28c76f' : '#3699ff'};"></div>
          </div>
          <span class="remaining-text">Qolgan summa: <strong>{remainingRevenue.toLocaleString()} UZS</strong></span>
        </div>
      </div>

      <!-- O'quvchilar soni rejasi -->
      <div class="plan-card">
        <div class="card-top">
          <h3>🎓 O'quvchilar Qamrovi Rejasi</h3>
          <span class="badge {studentsPercentage >= 100 ? 'success' : 'warning'}">{studentsPercentage}% Bajarildi</span>
        </div>
        <div class="amounts-row">
          <div>
            <span class="label">Hozirgi O'quvchilar:</span>
            <h4 class="text-blue">{actualStudents} nafar</h4>
          </div>
          <div>
            <span class="label">Rejadagi Maqsad:</span>
            <h4>{targetStudents} nafar</h4>
          </div>
        </div>
        <div class="progress-box">
          <div class="progress-bg">
            <div class="progress-fg" style="width: {studentsPercentage}%; background: #8950fc;"></div>
          </div>
          <span class="remaining-text">Yetishmayotgan: <strong>{Math.max(targetStudents - actualStudents, 0)} nafar o'quvchi</strong></span>
        </div>
      </div>
    </div>

    <!-- REJANI TAHRIRLASH VA SOZLASH FORMASI -->
    <div class="edit-plan-section">
      <h3>⚙️ Ushbu Oy Uchun Rejani Belgilash</h3>
      <div class="form-grid">
        <div class="input-group">
          <label>Oylik Tushum Rejasi (UZS):</label>
          <input type="number" bind:value={targetRevenue} step="1000000" />
        </div>
        <div class="input-group">
          <label>O'quvchilar Soni Rejasi (Nafar):</label>
          <input type="number" bind:value={targetStudents} />
        </div>
        <div class="input-group full-width">
          <label>Maqsad va Izohlar (Masalan: Marketing aksiyasi, chegirmalar):</label>
          <textarea bind:value={planNotes} placeholder="Oylik strategiya va eslatmalar..."></textarea>
        </div>
        <button class="save-btn" on:click={savePlan} disabled={isSaving}>
          {isSaving ? 'Saqlanmoqda...' : '💾 Rejani Saqlash va Yangilash'}
        </button>
      </div>
    </div>
  {/if}
</div>