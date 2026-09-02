<script>
  import './Teachers.css';

  // O'qituvchilar ro'yxati
  let teachers = [
    { id: 1, name: 'Bobur Jalolov', phone: '+998 90 987 65 43', subject: 'Frontend', groupsCount: 4, status: 'Aktiv' },
    { id: 2, name: 'Sardor Karimov', phone: '+998 93 111 22 33', subject: 'Python', groupsCount: 3, status: 'Aktiv' },
    { id: 3, name: 'Dilnoza Axmedova', phone: '+998 97 444 55 66', subject: 'UX/UI Design', groupsCount: 2, status: 'Ta’tilda' }
  ];

  let searchQuery = '';
  let selectedSubject = 'Barchasi';
  let isModalOpen = false;

  let newTeacher = { name: '', phone: '', subject: 'Frontend', groupsCount: 1 };

  $: filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || teacher.phone.includes(searchQuery);
    const matchesSubject = selectedSubject === 'Barchasi' || teacher.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  function handleAddTeacher() {
    if (!newTeacher.name || !newTeacher.phone) return;

    teachers = [
      {
        id: Date.now(),
        ...newTeacher,
        status: 'Aktiv'
      },
      ...teachers
    ];

    newTeacher = { name: '', phone: '', subject: 'Frontend', groupsCount: 1 };
    isModalOpen = false;
  }
</script>

<div class="teachers-page">
  <!-- Boshqaruv paneli -->
  <div class="teachers-control-panel">
    <div class="search-filter-group">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="O‘qituvchi ismi yoki tel..." 
          bind:value={searchQuery}
        />
      </div>

      <select bind:value={selectedSubject} class="subject-select">
        <option value="Barchasi">Barcha yo‘nalishlar</option>
        <option value="Frontend">Frontend</option>
        <option value="Python">Python</option>
        <option value="UX/UI Design">UX/UI Design</option>
      </select>
    </div>

    <button class="add-btn" on:click={() => isModalOpen = true}>
      <span>➕</span> Yangi O‘qituvchi
    </button>
  </div>

  <!-- Teachers Jadvali -->
  <div class="table-container">
    <table class="teachers-table">
      <thead>
        <tr>
          <th>#</th>
          <th>O‘QITUVCHI ISM-FAMILIYASI</th>
          <th>TELEFON</th>
          <th>YO‘NALISH</th>
          <th>GURUHLAR SONI</th>
          <th>STATUS</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredTeachers as teacher, index}
          <tr>
            <td>{index + 1}</td>
            <td class="font-bold">{teacher.name}</td>
            <td>{teacher.phone}</td>
            <td><span class="subject-tag">{teacher.subject}</span></td>
            <td><span class="count-badge">{teacher.groupsCount} ta guruh</span></td>
            <td>
              <span class="status-badge {teacher.status === 'Aktiv' ? 'active' : 'vacation'}">
                {teacher.status}
              </span>
            </td>
            <td>
              <button class="action-btn" title="Tahrirlash">✏️</button>
              <button class="action-btn" title="O'chirish">🗑️</button>
            </td>
          </tr>
        {/each}
        {#if filteredTeachers.length === 0}
          <tr>
            <td colspan="7" class="empty-row">O‘qituvchilar topilmadi</td>
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
          <h3>Yangi O‘qituvchi Qo‘shish</h3>
          <button class="close-btn" on:click={() => isModalOpen = false}>✖</button>
        </div>

        <form on:submit|preventDefault={handleAddTeacher} class="modal-form">
          <div class="form-group">
            <label>Ism va Familiya</label>
            <input type="text" bind:value={newTeacher.name} placeholder="Bobur Jalolov" required />
          </div>

          <div class="form-group">
            <label>Telefon raqam</label>
            <input type="text" bind:value={newTeacher.phone} placeholder="+998 90 123 45 67" required />
          </div>

          <div class="form-group">
            <label>Yo‘nalish / Fan</label>
            <select bind:value={newTeacher.subject}>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Python">Python</option>
              <option value="UX/UI Design">UX/UI Design</option>
            </select>
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