<script>
    import "./Dashboard.css";

    // Statisik ko'rsatkichlar
    const stats = [
        {
            title: "Umumiy Leadlar",
            value: "1,248",
            percent: "+18.5%",
            isUp: true,
            progress: 75,
            color: "#3699ff",
            icon: "🧲",
        },
        {
            title: "Aktiv O‘quvchilar",
            value: "432",
            percent: "+12.3%",
            isUp: true,
            progress: 62,
            color: "#1bc5bd",
            icon: "🎓",
        },
        {
            title: "Konversiya darajasi",
            value: "34.6%",
            percent: "+4.2%",
            isUp: true,
            progress: 35,
            color: "#8950fc",
            icon: "🎯",
        },
        {
            title: "Muvaffaqiyatsiz Leadlar",
            value: "86",
            percent: "-2.4%",
            isUp: false,
            progress: 15,
            color: "#f64e60",
            icon: "❌",
        },
    ];

    // Sotuv voronkasi
    const funnel = [
        {
            stage: "Yangi so‘rovlar (Leadlar)",
            count: "1,248 ta",
            percent: 100,
            color: "#3699ff",
        },
        {
            stage: "Qo‘ng‘iroq qilindi",
            count: "850 ta",
            percent: 68,
            color: "#8950fc",
        },
        {
            stage: "Sinov darsiga yozildi",
            count: "520 ta",
            percent: 41,
            color: "#ffa800",
        },
        {
            stage: "To‘lov qildi (O‘quvchi bo‘ldi)",
            count: "432 ta",
            percent: 34,
            color: "#1bc5bd",
        },
    ];

    // Oylik dinamika grafigi uchun ma'lumotlar
    const monthlyData = [
        { month: "Yan", leads: 40 },
        { month: "Fev", leads: 65 },
        { month: "Mar", leads: 85 },
        { month: "Apr", leads: 50 },
        { month: "May", leads: 95 },
        { month: "Iyun", leads: 70 },
        { month: "Iyul", leads: 110 },
    ];

    // Oxirgi harakatlar
    const activities = [
        {
            text: "Jasur Malikov yangi lead qo'shdi",
            time: "10 daqiqa oldin",
            icon: "👤",
            color: "#3699ff",
        },
        {
            text: "Sardor Rahimov to'lov qildi (+500,000 UZS)",
            time: "30 daqiqa oldin",
            icon: "💳",
            color: "#1bc5bd",
        },
        {
            text: "Dilnoza Aliyeva qo'ng'iroqni yakunladi",
            time: "1 soat oldin",
            icon: "📞",
            color: "#ffa800",
        },
    ];

    // Top Menejerlar
    const topManagers = [
        {
            name: "Azizbek Karimov",
            sales: "42 ta sotuv",
            rate: "94%",
            avatar: "A",
        },
        {
            name: "Madina Umarova",
            sales: "38 ta sotuv",
            rate: "89%",
            avatar: "M",
        },
        {
            name: "Sardor Mahmudov",
            sales: "31 ta sotuv",
            rate: "82%",
            avatar: "S",
        },
    ];
</script>

<div class="dashboard-container">
    <!-- Top Stat Cards -->
    <div class="stats-grid">
        {#each stats as item}
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">{item.title}</span>
                    <div class="stat-icon">{item.icon}</div>
                </div>
                <div class="stat-body">
                    <span class="stat-value">{item.value}</span>
                    <div class="stat-badge {item.isUp ? 'up' : 'down'}">
                        <span>{item.isUp ? "↑" : "↓"}</span>
                        <span>{item.percent}</span>
                    </div>
                </div>
                <div class="progress-bar-bg">
                    <div
                        class="progress-bar-fill"
                        style="width: {item.progress}%; background-color: {item.color};"
                    ></div>
                </div>
            </div>
        {/each}
    </div>

    <!-- Main Section Grid 1 -->
    <div class="dashboard-grid">
        <!-- Sotuv voronkasi -->
        <div class="card">
            <h3 class="card-title">📉 Sotuv voronkasi (Conversion Funnel)</h3>
            <div class="funnel-list">
                {#each funnel as step}
                    <div class="funnel-item">
                        <div class="funnel-info">
                            <span class="funnel-label">{step.stage}</span>
                            <span class="funnel-val"
                                >{step.count} ({step.percent}%)</span
                            >
                        </div>
                        <div class="progress-bar-bg" style="height: 8px;">
                            <div
                                class="progress-bar-fill"
                                style="width: {step.percent}%; background-color: {step.color};"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Oylik Reja va Top Menejerlar -->
        <div class="card-column">
            <div class="card">
                <h3 class="card-title">⚡ Oylik Reja Bajarilishi</h3>
                <div style="text-align: center; padding: 10px 0;">
                    <div
                        style="font-size: 36px; font-weight: 700; color: #1bc5bd;"
                    >
                        78%
                    </div>
                    <p
                        style="color: #a2a3b7; font-size: 13px; margin-top: 4px;"
                    >
                        Oylik maqsadga erishish darajasi
                    </p>
                </div>
                <div class="progress-bar-bg" style="height: 10px;">
                    <div
                        class="progress-bar-fill"
                        style="width: 78%; background-color: #1bc5bd;"
                    ></div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">🏆 Top Menejerlar</h3>
                <div class="manager-list">
                    {#each topManagers as manager}
                        <div class="manager-item">
                            <div class="manager-avatar">{manager.avatar}</div>
                            <div class="manager-info">
                                <span class="manager-name">{manager.name}</span>
                                <span class="manager-sales"
                                    >{manager.sales}</span
                                >
                            </div>
                            <span class="manager-rate">{manager.rate}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Main Section Grid 2 -->
    <div class="dashboard-grid">
        <!-- Oylik Dinamika Grafigi -->
        <div class="card">
            <h3 class="card-title">📊 Oylik Leadlar Dinamikasi</h3>
            <div class="chart-container">
                {#each monthlyData as bar}
                    <div class="chart-bar-wrapper">
                        <div
                            class="chart-bar"
                            style="height: {bar.leads * 1.5}px;"
                        >
                            <span class="chart-tooltip">{bar.leads}</span>
                        </div>
                        <span class="chart-label">{bar.month}</span>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Oxirgi Harakatlar -->
        <div class="card">
            <h3 class="card-title">⚡ Oxirgi Harakatlar</h3>
            <div class="activity-list">
                {#each activities as act}
                    <div class="activity-item">
                        <div
                            class="act-icon"
                            style="background-color: {act.color}20; color: {act.color};"
                        >
                            {act.icon}
                        </div>
                        <div class="act-content">
                            <p class="act-text">{act.text}</p>
                            <span class="act-time">{act.time}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
