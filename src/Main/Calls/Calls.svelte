<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Calls.css';

  let calls = [];
  let clientName = '';
  let phone = '';
  let status = 'Muvaffaqiyatli';
  let notes = '';
  let isLoading = false;
  let isSaving = false;

  // Qo'ng'iroqlarni bazadan olish
  async function fetchCalls() {
    isLoading = true;
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Xatolik:', error.message);
    } else {
      calls = data || [];
    }
    isLoading = false;
  }

  // Yangi qo'ng'iroqni qo'shish
  async function addCall() {
    if (!clientName.trim()) {
      alert('Iltimos, mijoz ismini kiriting!');
      return;
    }

    isSaving = true;
    const { error } = await supabase
      .from('calls')
      .insert([{ 
        client_name: clientName, 
        phone: phone || '-', 
        status, 
        notes 
      }]);

    isSaving = false;

    if (error) {
      alert('Qo‘shishda xatolik: ' + error.message);
    } else {
      clientName = '';
      phone = '';
      status = 'Muvaffaqiyatli';
      notes = '';
      fetchCalls(); // Ro'yxatni yangilash
    }
  }

  // Qo'ng'iroqni o'chirish
  async function deleteCall(id) {
    if (!confirm('Haqiqatan ham bu yozuvni o‘chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', id);

    if (error) {
      alert('O‘chirishda xatolik: ' + error.message);
    } else {
      fetchCalls();
    }
  }

  onMount(() => {
    fetchCalls();
  });
</script>

<div class="calls-page">
  <h2>📞 Qo'ng'iroqlar tarixi va boshqaruvi</h2>

  <!-- Yangi qo'ng'iroq qo'shish formasi -->
  <div class="call-form">
    <input type="text" placeholder="Mijoz F.I.O" bind:value={clientName} />
    <input type="text" placeholder="Telefon raqami" bind:value={phone} />
    
    <select bind:value={status} class="status-select">
      <option value="Muvaffaqiyatli">✅ Muvaffaqiyatli</option>
      <option value="Javob bermadi">❌ Javob bermadi</option>
      <option value="Band">⚠️ Band</option>
      <option value="O'ylashga vaqt so'radi">⏳ O'ylashga vaqt so'radi</option>
    </select>

    <input type="text" placeholder="Izoh (ixtiyoriy)" bind:value={notes} />

    <button on:click={addCall} disabled={isSaving}>
      {isSaving ? 'Saqlanmoqda...' : '➕ Qo‘shish'}
    </button>
  </div>

  <!-- Jadval qismi -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Mijoz</th>
          <th>Telefon</th>
          <th>Natija / Status</th>
          <th>Izoh</th>
          <th>Vaqti</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="7" class="center">Yuklanmoqda...</td></tr>
        {:else}
          {#each calls as call, index}
            <tr>
              <td class="index-cell">{index + 1}</td>
              <td class="bold">{call.client_name}</td>
              <td>{call.phone}</td>
              <td>
                <span class="badge {call.status === 'Muvaffaqiyatli' ? 'success' : call.status === 'Javob bermadi' ? 'danger' : 'warning'}">
                  {call.status}
                </span>
              </td>
              <td>{call.notes || '-'}</td>
              <td class="time-text">{new Date(call.created_at).toLocaleString()}</td>
              <td>
                <button class="del-btn" on:click={() => deleteCall(call.id)}>🗑️ O'chirish</button>
              </td>
            </tr>
          {/each}
          {#if calls.length === 0}
            <tr><td colspan="7" class="center">Qo'ng'iroqlar tarixi topilmadi.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>