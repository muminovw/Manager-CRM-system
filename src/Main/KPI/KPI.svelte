<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './KPI.css';

  let kpiList = [];
  let userName = '';
  let role = 'Menejer';
  let callsMade = 0;
  let dealsClosed = 0;
  let attendanceScore = 100;
  let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  let isLoading = false;
  let isSaving = false;

  // KPI ma'lumotlarini bazadan olish
  async function fetchKPI() {
    isLoading = true;
    const { data, error } = await supabase
      .from('kpi_records')
      .select('*')
      .order('total_score', { ascending: false });

    if (error) {
      console.error('Xatolik:', error.message);
    } else {
      kpiList = data || [];
    }
    isLoading = false;
  }

  // KPI ballini avtomatik hisoblash formulasi:
  // Masalan: Har bir qo'ng'iroq = 1 ball, Har bir sotuv = 10 ball, Davomat foizi qo'shiladi
  function calculateScore(calls, deals, attendance) {
    return (Number(calls) * 1) + (Number(deals) * 15) + (Number(attendance) * 0.5);
  }

  // Yangi KPI yozuvini qo'shish yoki yangilash
  async function saveKPI() {
    if (!userName.trim()) {
      alert('Iltimos, xodim ismini kiriting!');
      return;
    }

    isSaving = true;
    const totalScore = calculateScore(callsMade, dealsClosed, attendanceScore);

    const { error } = await supabase
      .from('kpi_records')
      .insert([{
        user_name: userName,
        role,
        calls_made: callsMade,
        deals_closed: dealsClosed,
        attendance_score: attendanceScore,
        total_score: totalScore,
        month: currentMonth
      }]);

    isSaving = false;

    if (error) {
      alert('Saqlashda xatolik: ' + error.message);
    } else {
      userName = '';
      callsMade = 0;
      dealsClosed = 0;
      attendanceScore = 100;
      fetchKPI();
    }
  }

  // O'chirish
  async function deleteKPI(id) {
    if (!confirm('Haqiqatan ham bu natijani o‘chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('kpi_records')
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

<div class="kpi-page">
  <div class="kpi-header-flex">
    <h2>🏆 Xodimlar KPI va Samaradorlik Reytingi</h2>
    <div class="month-filter">
      <span>Oy:</span>
      <input type="month" bind:value={currentMonth} />
    </div>
  </div>

  <div class="kpi-form">
    <input type="text" placeholder="Xodim F.I.O" bind:value={userName} />
    
    <select bind:value={role}>
      <option value="Menejer">💼 Menejer</option>
      <option value="O'qituvchi">🎓 O'qituvchi</option>
    </select>

    <div class="input-group">
      <label>Qo'ng'iroqlar:</label>
      <input type="number" bind:value={callsMade} min="0" />
    </div>

    <div class="input-group">
      <label>Sotuvlar:</label>
      <input type="number" bind:value={dealsClosed} min="0" />
    </div>

    <div class="input-group">
      <label>Davomat (%):</label>
      <input type="number" bind:value={attendanceScore} min="0" max="100" />
    </div>

    <button on:click={saveKPI} disabled={isSaving}>
      {isSaving ? 'Saqlanmoqda...' : '🚀 KPI Hisoblash va Qo‘shish'}
    </button>
  </div>

  {#if kpiList.length > 0}
    <div class="top-podium">
      {#each kpiList.slice(0, 3) as top, index}
        <div class="podium-card rank-{index + 1}">
          <div class="rank-badge">#{index + 1}</div>
          <div class="podium-name">{top.user_name}</div>
          <div class="podium-role">{top.role}</div>
          <div class="podium-score">⭐ {top.total_score} ball</div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>O'rin</th>
          <th>Xodim</th>
          <th>Lavozimi</th>
          <th>Qo'ng'iroqlar</th>
          <th>Sotuvlar</th>
          <th>Davomat</th>
          <th>Umumiy Ball</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="8" class="center">Ma'lumotlar yuklanmoqda...</td></tr>
        {:else}
          {#each kpiList as kpi, index}
            <tr>
              <td class="index-cell font-bold">
                {#if index === 0} 🥇 
                {:else if index === 1} 🥈 
                {:else if index === 2} 🥉 
                {:else} {index + 1} {/if}
              </td>
              <td class="bold text-white">{kpi.user_name}</td>
              <td><span class="role-badge">{kpi.role}</span></td>
              <td>📞 {kpi.calls_made} ta</td>
              <td>🔥 {kpi.deals_closed} ta</td>
              <td>✨ {kpi.attendance_score}%</td>
              <td><span class="score-highlight">{kpi.total_score} ball</span></td>
              <td>
                <button class="del-btn" on:click={() => deleteKPI(kpi.id)}>🗑️ O'chirish</button>
              </td>
            </tr>
          {/each}
          {#if kpiList.length === 0}
            <tr><td colspan="8" class="center">Hozircha KPI natijalari mavjud emas.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>