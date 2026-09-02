<script>
  import './Students.css';

  // O'quvchilar ro'yxati (To'lovlarsiz)
  let students = [
    { id: 1, name: 'Anvar Toshov', phone: '+998 90 111 22 33', group: 'FN-102', teacher: 'Bobur Jalolov', status: 'Aktiv' },
    { id: 2, name: 'Malika Zokirova', phone: '+998 93 444 55 66', group: 'PY-201', teacher: 'Sardor Karimov', status: 'Aktiv' },
    { id: 3, name: 'Shoxrux Alimov', phone: '+998 97 777 88 99', group: 'UX-301', teacher: 'Dilnoza Axmedova', status: 'Muzlatilgan' }
  ];

  let searchQuery = '';
  let selectedGroup = 'Barchasi';
  let isModalOpen = false;

  let newStudent = { name: '', phone: '', group: 'FN-102', teacher: 'Bobur Jalolov' };

  $: filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.phone.includes(searchQuery);
    const matchesGroup = selectedGroup === 'Barchasi' || student.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  function handleAddStudent() {
    if (!newStudent.name || !newStudent.phone) return;

    students = [
      {
        id: Date.now(),
        ...newStudent,
        status: 'Aktiv'
      },
      ...students
    ];

    newStudent = { name: '', phone: '', group: 'FN-102', teacher: 'Bobur Jalolov' };
    isModalOpen = false;
  }
</script>

<div class="students-page">
  <!-- Boshqaruv paneli -->
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

  <!-- Students Jadvali -->
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
        {#each filteredStudents as student, index}
          <tr>
            <td>{index + 1}</td>
            <td class="font-bold">{student.name}</td>
            <td>{student.phone}</td>
            <td><span class="group-tag">{student.group}</span></td>
            <td>{student.teacher}</td>
            <td>
              <span class="status-badge {student.status === 'Aktiv' ? 'active' : 'frozen'}">
                {student.status}
              </span>
            </td>
            <td>
              <button class="action-btn" title="Tahrirlash">✏️</button>
              <button class="action-btn" title="O'chirish">🗑️</button>
            </td>
          </tr>
        {/each}
        {#if filteredStudents.length === 0}
          <tr>
            <td colspan="7" class="empty-row">O‘quvchilar topilmadi</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Modal -->
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
            <select bind:value={newStudent.group}>
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