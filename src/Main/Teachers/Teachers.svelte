<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Teachers.css';

  let teachers = [];
  let name = '';
  let subject = '';
  let phone = '';
  let isLoading = false;

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
    }
    isLoading = false;
  }

  // Yangi o'qituvchi qo'shish
  async function addTeacher() {
    if (!name.trim()) {
      alert('Iltimos, o‘qituvchi ismini kiriting!');
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .insert([{ name, subject: subject || 'Frontend', phone }]);

    if (error) {
      alert('Qo‘shishda xatolik: ' + error.message);
    } else {
      name = '';
      subject = '';
      phone = '';
      fetchTeachers(); // Ro'yxatni yangilash
    }
  }

  // O'qituvchini o'chirish
  async function deleteTeacher(id) {
    if (!confirm('Haqiqatan ham bu o‘qituvchini o‘chirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      alert('O‘chirishda xatolik: ' + error.message);
    } else {
      fetchTeachers();
    }
  }

  onMount(() => {
    fetchTeachers();
  });
</script>

<div class="teachers-page">
  <h2>O‘qituvchilar Ro‘yxati</h2>

  <!-- Qo'shish Formasi -->
  <div class="teacher-form">
    <input type="text" placeholder="Ism familiyasi" bind:value={name} />
    <input type="text" placeholder="Fan / Yo'nalish" bind:value={subject} />
    <input type="text" placeholder="Telefon raqami" bind:value={phone} />
    <button on:click={addTeacher}>➕ Qo‘shish</button>
  </div>

  <!-- Jadval -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>F.I.O</th>
          <th>Fan</th>
          <th>Telefon</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr><td colspan="5" class="center">Yuklanmoqda...</td></tr>
        {:else}
          {#each teachers as t, index}
            <tr>
              <td>{index + 1}</td>
              <td class="bold">{t.name}</td>
              <td><span class="badge">{t.subject}</span></td>
              <td>{t.phone || '-'}</td>
              <td>
                <button class="del-btn" on:click={() => deleteTeacher(t.id)}>🗑️ O'chirish</button>
              </td>
            </tr>
          {/each}
          {#if teachers.length === 0}
            <tr><td colspan="5" class="center">O‘qituvchilar topilmadi.</td></tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>