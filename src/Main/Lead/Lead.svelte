<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Lead.css';

  let leads = [];
  let isLoading = true;

  async function fetchLeads() {
    isLoading = true;

    // 1. Lead jadvalidan ma'lumot olish
    const { data: leadData, error: leadError } = await supabase
      .from('lead')
      .select('*')
      .order('id', { ascending: false });

    if (leadError) {
      console.error('Lead yuklashda xato:', leadError.message);
    }

    // 2. Agar lead bo'sh bo'lsa, students jadvalidan ham olish
    if (!leadData || leadData.length === 0) {
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: false });

      if (studentData) {
        leads = studentData.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone || '+998 90 123 45 67',
          course: s.group_name ? s.group_name.split('-')[0] : 'Frontend',
          status: 'Yangi',
          created_at: s.created_at || new Date().toISOString()
        }));
      }
    } else {
      leads = leadData;
    }

    isLoading = false;
  }

  async function deleteLead(id) {
    if (!confirm('Ushbu lidni oʻchirmoqchimisiz?')) return;

    await supabase.from('lead').delete().eq('id', id);
    leads = leads.filter(l => l.id !== id);
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Yangi': return 'badge-yangi';
      case 'Qo‘ng‘iroq qilindi': return 'badge-qongiroq';
      case 'Sinov darsida': return 'badge-sinov';
      case 'Rad etildi': return 'badge-rad';
      default: return 'badge-yangi';
    }
  }

  onMount(() => {
    fetchLeads();
  });
</script>

<div class="lead-page">
  <div class="table-container">
    <table class="lead-table">
      <thead>
        <tr>
          <th>ISM-FAMILIYA</th>
          <th>TELEFON</th>
          <th>YO'NALISH</th>
          <th>STATUS</th>
          <th>SANA</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="6" class="empty-row">Yuklanmoqda...</td></tr>
        {:else}
          {#each leads as item (item.id)}
            <tr>
              <td class="font-bold">{item.name}</td>
              <td>{item.phone}</td>
              <td><span class="course-badge">{item.course}</span></td>
              <td><span class="status-badge {getStatusClass(item.status)}">{item.status}</span></td>
              <td>{item.created_at ? item.created_at.split('T')[0] : '2026-09-02'}</td>
              <td class="actions-cell">
                <button class="icon-btn delete" on:click={() => deleteLead(item.id)}>🗑️</button>
              </td>
            </tr>
          {/each}
          {#if leads.length === 0}
            <tr><td colspan="6" class="empty-row">Lidlar topilmadi. O'quvchilar bo'limidan yangi o'quvchi qo'shing.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>