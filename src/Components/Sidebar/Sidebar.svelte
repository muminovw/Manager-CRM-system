<script>
  export let activePage = 'dashboard';
  export let navigateTo = () => {};
  import "./Sidebar.css"

  const menuGroups = [
    {
      title: 'ASOSIY',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' }
      ]
    },
    {
      title: 'FOYDALANUVCHILAR',
      items: [
        { id: 'leads', label: '1. Leadlar', icon: '🧲' },
        { id: 'students', label: '2. O‘quvchilar', icon: '🎓' },
        { id: 'teachers', label: '3. O‘qituvchilar', icon: '👨‍🏫' }
      ]
    },
    {
      title: 'JARAYONLAR',
      items: [
        { id: 'attendance', label: '7. Davomat', icon: '📅' },
        { id: 'calls', label: '8. Qo‘ng‘iroqlar', icon: '📞' }
      ]
    },
    {
      title: 'TAHLIL VA REJA',
      items: [
        { id: 'kpi', label: '9. KPI Dashboard', icon: '🎯' },
        { id: 'reports', label: '10-11. Hisobotlar', icon: '📝' },
        { id: 'plan', label: '12. Oylik reja', icon: '📈' }
      ]
    }
  ];
</script>

<aside class="sidebar">
  <div class="logo">
    <h2>CRM SYSTEM</h2>
  </div>

  <nav class="menu">
    {#each menuGroups as group}
      <div class="group-title">{group.title}</div>
      {#each group.items as item}
        <button
          class="menu-item"
          class:active={activePage === item.id}
          on:click={() => navigateTo(item.id)}
        >
          <span class="icon">{item.icon}</span>
          <span class="label">{item.label}</span>
        </button>
      {/each}
    {/each}
  </nav>
</aside>

