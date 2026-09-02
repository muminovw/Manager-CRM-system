<script>
  import './Header.css';

  export let activePage = 'dashboard';

  let showNotifications = false;
  let showProfileMenu = false;
  let isDarkMode = true;

  const pageTitles = {
    dashboard: '📊 Dashboard',
    leads: '🧲 Leadlar',
    students: '🎓 O‘quvchilar',
    teachers: '👨‍🏫 O‘qituvchilar',
    attendance: '📅 Davomat',
    calls: '📞 Qo‘ng‘iroqlar',
    kpi: '🎯 KPI Dashboard',
    reports: '📝 Hisobotlar',
    plan: '📈 Oylik reja'
  };

  // Namuna uchun bildirishnomalar
  const notifications = [
    { id: 1, text: "Yangi lead qo'shildi: Ali Valiyev", time: "5 daqiqa oldin" },
    { id: 2, text: "Bugungi davomat to'ldirilmadi", time: "1 soat oldin" },
    { id: 3, text: "Oylik reja 80% ga bajarildi", time: "3 soat oldin" }
  ];

  function toggleNotifications() {
    showNotifications = !showNotifications;
    showProfileMenu = false;
  }

  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
    showNotifications = false;
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
  }
</script>

<header class="header">
  <div class="header-left">
    <h1 class="page-title">{pageTitles[activePage] || 'CRM System'}</h1>
  </div>

  <div class="header-right">
    <!-- Qidiruv -->
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Qidiruv..." />
    </div>

    <!-- Theme Toggle -->
    <button class="icon-btn" on:click={toggleTheme} title="Mavzuni o'zgartirish">
      {isDarkMode ? '🌙' : '☀️'}
    </button>

    <!-- Bildirishnomalar -->
    <div class="dropdown-wrapper">
      <button class="icon-btn notification-btn" on:click={toggleNotifications}>
        🔔
        <span class="badge">{notifications.length}</span>
      </button>

      {#if showNotifications}
        <div class="dropdown-menu notifications-menu">
          <div class="dropdown-header">
            <span>Bildirishnomalar</span>
            <span class="count">{notifications.length} ta yangi</span>
          </div>
          <div class="dropdown-body">
            {#each notifications as item}
              <div class="notification-item">
                <p class="notif-text">{item.text}</p>
                <span class="notif-time">{item.time}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Profil -->
    <div class="dropdown-wrapper">
      <div class="user-profile" on:click={toggleProfileMenu}>
        <div class="user-avatar">A</div>
        <div class="user-details">
          <span class="user-name">Admin User</span>
          <span class="user-role">Menejer</span>
        </div>
      </div>

      {#if showProfileMenu}
        <div class="dropdown-menu profile-menu">
          <button class="menu-action">⚙️ Sozlamalar</button>
          <button class="menu-action">👤 Profil Ma'lumotlari</button>
          <div class="divider"></div>
          <button class="menu-action logout">🚪 Tizimdan chiqish</button>
        </div>
      {/if}
    </div>
  </div>
</header>