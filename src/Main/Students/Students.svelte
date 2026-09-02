<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import './Students.css';

  let students = [];
  let searchQuery = '';
  let selectedGroup = 'Barchasi';
  let isModalOpen = false;
  let isLoading = true;

  let newStudent = { name: '', phone: '', group_name: 'FN-102', teacher: 'Bobur Jalolov' };

  // Supabase'dan o'quvchilarni yuklab olish
  async function fetchStudents() {
    isLoading = true;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Oʻquvchilarni yuklashda xatolik:', error.message);
    } else {
      students = data;
    }
    isLoading = false;
  }

  // Yangi o'quvchi qo'shish (Supabase INSERT)
  async function handleAddStudent() {
    if (!newStudent.name || !newStudent.phone) return;

    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: newStudent.name,
          phone: newStudent.phone,
          group_name: newStudent.group_name,
          teacher: newStudent.teacher,
          status: 'Aktiv'
        }
      ])
      .select();

    if (error) {
      alert('Xatolik yuz berdi: ' + error.message);
    } else if (data) {
      students = [data[0], ...students];
      newStudent = { name: '', phone: '', group_name: 'FN-102', teacher: 'Bobur Jalolov' };
      isModalOpen = false;
    }
  }

  // O'quvchini o'chirish (Supabase DELETE)
  async function deleteStudent(id) {
    if (!confirm('Haqiqatan ham bu oʻquvchini oʻchirmoqchimisiz?')) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Oʻchirishda xatolik: ' + error.message);
    } else {
      students = students.filter(s => s.id !== id);
    }
  }

  onMount(() => {
    fetchStudents();
  });

  $: filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (student.phone && student.phone.includes(searchQuery));
    const matchesGroup = selectedGroup === 'Barchasi' || student.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });
</script>

<div class="students-page">
  <div class="students-control-panel">
    <div class="search-filter-group">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="O‘quvchi ismi yoki tel..." 
          bind:value={searchQuery}
        />
      </div>

      <select bind:value={selectedGroup} class="group-select">
        <option value="Barchasi">Barcha guruhlar</option>
        <option value="FN-102">FN-102 (Frontend)</option>
        <option value="PY-201">PY-201 (Python)</option>
        <option value="UX-301">UX-301 (UI/UX)</option>
      </select>
    </div>

    <button class="add-btn" on:click={() => isModalOpen = true}>
      <span>➕</span> Yangi O‘quvchi
    </button>
  </div>

  <div class="table-container">
    <table class="students-table">
      <thead>
        <tr>
          <th>#</th>
          <th>O‘QUVCHI ISM-FAMILIYASI</th>
          <th>TELEFON</th>
          <th>GURUH</th>
          <th>O‘QITUVCHI</th>
          <th>STATUS</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          <tr>
            <td colspan="7" class="empty-row">Yuklanmoqda...</td>
          </tr>
        {:else}
          {#each filteredStudents as student, index (student.id)}
            <tr>
              <td>{index + 1}</td>
              <td class="font-bold">{student.name}</td>
              <td>{student.phone}</td>
              <td><span class="group-tag">{student.group_name}</span></td>
              <td>{student.teacher || '—'}</td>
              <td>
                <span class="status-badge {student.status === 'Aktiv' ? 'active' : 'frozen'}">
                  {student.status}
                </span>
              </td>
              <td>
                <button class="action-btn" on:click={() => deleteStudent(student.id)} title="O'chirish">🗑️</button>
              </td>
            </tr>
          {/each}
          {#if filteredStudents.length === 0}
            <tr>
              <td colspan="7" class="empty-row">O‘quvchilar topilmadi</td>
            </tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>

  {#if isModalOpen}
    <div class="modal-backdrop" on:click={() => isModalOpen = false}>
      <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Yangi O‘quvchi Qo‘shish</h3>
          <button class="close-btn" on:click={() => isModalOpen = false}>✖</button>
        </div>

        <form on:submit|preventDefault={handleAddStudent} class="modal-form">
          <div class="form-group">
            <label>Ism va Familiya</label>
            <input type="text" bind:value={newStudent.name} placeholder="Anvar Toshov" required />
          </div>

          <div class="form-group">
            <label>Telefon raqam</label>
            <input type="text" bind:value={newStudent.phone} placeholder="+998 90 123 45 67" required />
          </div>

          <div class="form-group">
            <label>Guruh</label>
            <select bind:value={newStudent.group_name}>
              <option value="FN-102">FN-102 (Frontend)</option>
              <option value="PY-201">PY-201 (Python)</option>
              <option value="UX-301">UX-301 (UI/UX)</option>
            </select>
          </div>

          <div class="form-group">
            <label>O‘qituvchi</label>
            <input type="text" bind:value={newStudent.teacher} placeholder="Bobur Jalolov" required />
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" on:click={() => isModalOpen = false}>Bekor qilish</button>
            <button type="submit" class="submit-btn">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>