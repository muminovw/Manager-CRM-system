<script>
  import './Lead.css';

  // Leadlar ro'yxati (namuna)
  let leads = [
    { id: 1, name: 'Ali Valiyev', phone: '+998 90 123 45 67', course: 'Frontend', status: 'Yangi', date: '2026-09-02' },
    { id: 2, name: 'Sardor Karimov', phone: '+998 93 987 65 43', course: 'Python', status: 'Qo‘ng‘iroq qilindi', date: '2026-09-01' },
    { id: 3, name: 'Madina Umarova', phone: '+998 97 555 44 33', course: 'SMM', status: 'Sinov darsida', date: '2026-08-31' },
    { id: 4, name: 'Javohir Toshpulatov', phone: '+998 91 222 11 00', course: 'UX/UI Design', status: 'Rad etildi', date: '2026-08-30' }
  ];

  // Qidiruv va Filter holatlari
  let searchQuery = '';
  let selectedStatus = 'Barchasi';

  // Modal oynasi holati
  let isModalOpen = false;
  let newLead = { name: '', phone: '', course: 'Frontend', status: 'Yangi' };

  // Qidiruv va filter bo'yicha saralangan leadlar
  $: filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'Barchasi' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Yangi lead qo'shish funksiyasi
  function handleAddLead() {
    if (!newLead.name || !newLead.phone) return;
    
    leads = [
      {
        id: Date.now(),
        ...newLead,
        date: new Date().toISOString().split('T')[0]
      },
      ...leads
    ];

    // Formani tozalash va modalni yopish
    newLead = { name: '', phone: '', course: 'Frontend', status: 'Yangi' };
    isModalOpen = false;
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Yangi': return 'badge-new';
      case 'Qo‘ng‘iroq qilindi': return 'badge-called';
      case 'Sinov darsida': return 'badge-trial';
      case 'Rad etildi': return 'badge-rejected';
      default: return '';
    }
  }
</script>

<div class="lead-page">
  <!-- Boshqaruv paneli (Header actions) -->
  <div class="lead-control-panel">
    <div class="search-filter-group">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Ism yoki telefon bo'yicha..." 
          bind:value={searchQuery}
        />
      </div>

      <select bind:value={selectedStatus} class="status-select">
        <option value="Barchasi">Barcha statuslar</option>
        <option value="Yangi">Yangi</option>
        <option value="Qo‘ng‘iroq qilindi">Qo‘ng‘iroq qilindi</option>
        <option value="Sinov darsida">Sinov darsida</option>
        <option value="Rad etildi">Rad etildi</option>
      </select>
    </div>

    <button class="add-btn" on:click={() => isModalOpen = true}>
      <span>➕</span> Yangi Lead
    </button>
  </div>

  <!-- Leadlar Jadvali -->
  <div class="table-container">
    <table class="lead-table">
      <thead>
        <tr>
          <th>#</th>
          <th>ISM-FAMILIYA</th>
          <th>TELEFON</th>
          <th>YONALISH</th>
          <th>STATUS</th>
          <th>SANA</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredLeads as lead, index}
          <tr>
            <td>{index + 1}</td>
            <td class="font-bold">{lead.name}</td>
            <td>{lead.phone}</td>
            <td><span class="course-tag">{lead.course}</span></td>
            <td>
              <span class="status-badge {getStatusClass(lead.status)}">
                {lead.status}
              </span>
            </td>
            <td class="date-text">{lead.date}</td>
            <td>
              <button class="action-btn edit-btn" title="Tahrirlash">✏️</button>
              <button class="action-btn delete-btn" title="O'chirish">🗑️</button>
            </td>
          </tr>
        {/each}
        {#if filteredLeads.length === 0}
          <tr>
            <td colspan="7" class="empty-row">Hech qanday lead topilmadi</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Yangi Lead Qo'shish Modali -->
  {#if isModalOpen}
    <div class="modal-backdrop" on:click={() => isModalOpen = false}>
      <div class="modal-card" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Yangi Lead Qo'shish</h3>
          <button class="close-btn" on:click={() => isModalOpen = false}>✖</button>
        </div>

        <form on:submit|preventDefault={handleAddLead} class="modal-form">
          <div class="form-group">
            <label>Ism va Familiya</label>
            <input type="text" bind:value={newLead.name} placeholder="Masalan: Ali Valiyev" required />
          </div>

          <div class="form-group">
            <label>Telefon raqam</label>
            <input type="text" bind:value={newLead.phone} placeholder="+998 90 123 45 67" required />
          </div>

          <div class="form-group">
            <label>Yo'nalish / Kurs</label>
            <select bind:value={newLead.course}>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Python">Python</option>
              <option value="UX/UI Design">UX/UI Design</option>
              <option value="SMM">SMM</option>
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