<script>
  import "./app.css"
  import Header from './Components/Header/Header.svelte';
  import Sidebar from './Components/Sidebar/Sidebar.svelte';

  import Dashboard from './Main/Dashboard/Dashboard.svelte';
  import Lead from './Main/Lead/Lead.svelte';
  import Students from './Main/Students/Students.svelte';
  import Teachers from './Main/Teachers/Teachers.svelte';
  import Attendance from './Main/Attendance/Attendance.svelte';
  import Calls from './Main/Calls/Calls.svelte';
  import KPI from './Main/KPI/KPI.svelte';
  import Report from './Main/Report/Report.svelte';
  import Plan from './Main/Plan/Plan.svelte';

  let activePage = 'dashboard';

  function navigateTo(page) {
    activePage = page;
  }
</script>

<div class="layout">
  <Sidebar {activePage} {navigateTo} />

  <div class="main-content">
    <Header {activePage} />

    <main class="page-body">
      {#if activePage === 'dashboard'}
        <Dashboard />
      {:else if activePage === 'leads'}
        <Lead />
      {:else if activePage === 'students'}
        <Students />
      {:else if activePage === 'teachers'}
        <Teachers />
      {:else if activePage === 'attendance'}
        <Attendance />
      {:else if activePage === 'calls'}
        <Calls />
      {:else if activePage === 'kpi'}
        <KPI />
      {:else if activePage === 'reports'}
        <Report />
      {:else if activePage === 'plan'}
        <Plan />
      {/if}
    </main>
  </div>
</div>
