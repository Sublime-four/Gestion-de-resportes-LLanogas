export default function App() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            LLANOGAS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de reportes regulatorios
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <p className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
            Navegación
          </p>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 text-slate-50 text-sm font-medium">
            Dashboard
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
            Reportes
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
            Calendario
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
            Cumplimiento
          </button>

          <p className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mt-4 mb-1">
            Administración
          </p>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
            Usuarios y roles
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
            Configuración
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-slate-200 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Yohan Piñarte</p>
          <p>Responsable de reportes</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Dashboard de cumplimiento
            </h2>
            <p className="text-xs text-slate-500">
              Visión general de las obligaciones de reporte a entidades.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
                🔔
              </span>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </button>
            <div className="h-9 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                YP
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-700">Yohan Piñarte</p>
                <p className="text-slate-500">Ingeniería y Desarrollo</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido scrollable */}
        <section className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard
              title="% cumplimiento a tiempo"
              value="92%"
              trend="+4% vs mes anterior"
              tone="success"
            />
            <KpiCard
              title="Reportes vencidos"
              value="3"
              trend="2 críticos"
              tone="danger"
            />
            <KpiCard
              title="Reportes este mes"
              value="27"
              trend="18 enviados"
            />
            <KpiCard
              title="Entidades con riesgo"
              value="2"
              trend="SUI, Superservicios"
            />
          </div>

          {/* Dos columnas: próximos vencimientos + resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Próximos vencimientos */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  Próximos vencimientos
                </h3>
                <span className="text-[11px] text-slate-500">
                  Próximos 15 días
                </span>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2">Reporte</th>
                    <th className="py-2">Entidad</th>
                    <th className="py-2">Responsable</th>
                    <th className="py-2">Vence</th>
                    <th className="py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <ReportRow
                    name="SUI - Información Comercial Mensual"
                    entity="SUI"
                    owner="Coordinación Comercial"
                    due="10/12/2025"
                    status="En proceso"
                    statusTone="warning"
                  />
                  <ReportRow
                    name="Superservicios - Indicadores de Calidad"
                    entity="Superservicios"
                    owner="Calidad del Servicio"
                    due="12/12/2025"
                    status="Pendiente"
                    statusTone="danger"
                  />
                  <ReportRow
                    name="SUI - Información Operativa Trimestral"
                    entity="SUI"
                    owner="Operaciones"
                    due="15/12/2025"
                    status="En elaboración"
                    statusTone="info"
                  />
                </tbody>
              </table>
            </div>

            {/* Resumen lateral */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Estado general
                </h3>
                <p className="text-xs text-slate-500">
                  Resumen rápido del cumplimiento regulatorio.
                </p>
              </div>

              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Enviados a tiempo</span>
                  <span className="font-semibold text-emerald-600">24</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Enviados tarde</span>
                  <span className="font-semibold text-amber-600">5</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Pendientes</span>
                  <span className="font-semibold text-slate-700">8</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Vencidos</span>
                  <span className="font-semibold text-red-600">3</span>
                </li>
              </ul>

              <button className="w-full mt-2 text-xs font-medium rounded-lg bg-slate-900 text-slate-50 py-2 hover:bg-slate-800">
                Ver detalle de cumplimiento
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({ title, value, trend, tone = "neutral" }) {
  const toneClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-slate-200 bg-white text-slate-800",
  };

  return (
    <div
      className={`rounded-xl border shadow-sm p-4 text-xs ${toneClasses[tone]}`}
    >
      <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">
        {title}
      </p>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      {trend && <p className="text-[11px] opacity-80">{trend}</p>}
    </div>
  );
}

function ReportRow({ name, entity, owner, due, status, statusTone }) {
  const statusColors = {
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    success: "bg-emerald-100 text-emerald-800",
  };

  return (
    <tr className="text-slate-700">
      <td className="py-2 pr-2">
        <p className="font-medium text-[11px]">{name}</p>
        <p className="text-[11px] text-slate-500">Frecuencia: Mensual</p>
      </td>
      <td className="py-2 pr-2 text-[11px] text-slate-600">{entity}</td>
      <td className="py-2 pr-2 text-[11px] text-slate-600">{owner}</td>
      <td className="py-2 pr-2 text-[11px] text-slate-600">{due}</td>
      <td className="py-2 pr-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${
            statusColors[statusTone] || statusColors.info
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
