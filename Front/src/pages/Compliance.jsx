// src/pages/Compliance.jsx
import React,{useMemo,useState,useEffect}from"react";
import useAuth from"../hooks/useAuth";

/* ========= helpers compartidos ========= */
function parseDateString(dateStr){
  if(!dateStr)return null;
  const iso=new Date(dateStr);
  if(!isNaN(iso))return iso;
  const parts=String(dateStr).split("/");
  if(parts.length===3){
    const d=parseInt(parts[0],10);
    const m=parseInt(parts[1],10)-1;
    const y=parseInt(parts[2],10);
    const dObj=new Date(y,m,d);
    return isNaN(dObj)?null:dObj;
  }
  return null;
}

function validateFrequency(f){
  if(!f&&f!=="")return null;
  const s=String(f).trim().toLowerCase();
  if(s==="mensual"||s==="monthly")return"Mensual";
  if(s==="trimestral")return"Trimestral";
  if(s==="semestral")return"Semestral";
  if(s==="anual"||s==="annual")return"Anual";
  return null;
}

function addMonthsSafe(date,months){
  const d=new Date(date.getTime());
  const day=d.getDate();
  d.setMonth(d.getMonth()+months);
  if(d.getDate()!==day)d.setDate(0);
  return d;
}

function computePeriodDates(startDateStr,frecuencia){
  const start=parseDateString(startDateStr);
  if(!start)return{lastDue:null,nextDue:null};

  const today=new Date();
  const todayStart=new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const freqMap={Mensual:1,Trimestral:3,Semestral:6,Anual:12};
  const valid=validateFrequency(frecuencia)||"Mensual";
  const step=freqMap[valid]??1;

  let current=new Date(start.getFullYear(),start.getMonth(),start.getDate());
  let next=addMonthsSafe(current,step);

  while(next<=todayStart){
    current=new Date(next);
    next=addMonthsSafe(next,step);
    if(next.getFullYear()>todayStart.getFullYear()+10)break;
  }

  if(current>todayStart)return{lastDue:null,nextDue:current};
  return{lastDue:current,nextDue:next};
}

function getFirstAcuseDate(reportId,attachmentsMap){
  const list=(attachmentsMap[reportId]||[]).filter(a=>a.kind==="acuse");
  if(!list.length)return null;

  const timestamps=list
    .map(a=>new Date(a.uploadedAt))
    .filter(d=>!isNaN(d));

  if(!timestamps.length)return null;
  return new Date(Math.min(...timestamps.map(d=>d.getTime())));
}

function getExtendedDueDate(originalDueDate){
  if(!originalDueDate)return null;
  const extended=new Date(originalDueDate);
  extended.setDate(extended.getDate()+2);
  return extended;
}

/**
 * Helper centralizado: calcula due, extended y acuse para un reporte.
 */
function getDueAndAcuse(rep,attachmentsMap){
  const dbId=rep.id;
  const reportKey=String(dbId??rep.idReporte??rep.nombreReporte);

  let lastDue=null;
  let nextDue=null;

  if(rep.fechaLimiteEnvio){
    nextDue=parseDateString(rep.fechaLimiteEnvio);
  }else if(rep.fechaInicio&&rep.frecuencia){
    const p=computePeriodDates(rep.fechaInicio,rep.frecuencia);
    lastDue=p.lastDue;
    nextDue=p.nextDue;
  }

  const due=
    nextDue instanceof Date
      ?nextDue
      :nextDue
      ?parseDateString(nextDue)
      :lastDue instanceof Date
      ?lastDue
      :lastDue
      ?parseDateString(lastDue)
      :null;

  const extended=getExtendedDueDate(due);
  const acuseDate=getFirstAcuseDate(reportKey,attachmentsMap);

  return{due,extended,acuseDate,reportKey};
}

/**
 * Estado estándar:
 * - "Dentro del plazo"  -> hoy <= due y SIN acuse
 * - "Pendiente"         -> due < hoy <= due+2 y SIN acuse
 * - "Enviado a tiempo"  -> acuse <= due
 * - "Enviado tarde"     -> due < acuse <= due+2
 * - "Vencido"           -> hoy > due+2 y SIN acuse, o acuse > due+2
 */
function getStatusLabelFromDue(due,extended,acuseDate,todayStart){
  if(!due)return"Sin fecha";

  if(acuseDate){
    if(acuseDate<=due)return"Enviado a tiempo";
    if(extended&&acuseDate<=extended)return"Enviado tarde";
    return"Vencido";
  }

  if(todayStart<=due)return"Dentro del plazo";
  if(extended&&todayStart<=extended)return"Pendiente";
  return"Vencido";
}

const ENTITIES_PAGE_SIZE=10;

/* ================================================================
   ======================= COMPONENTE MAIN ========================
   ================================================================ */

export default function Compliance(){
  const{token}=useAuth();

  const[reportes,setReportes]=useState(()=>{
    if(typeof window==="undefined")return[];
    try{
      const raw=window.localStorage.getItem("reportesCreados");
      return raw?JSON.parse(raw):[];
    }catch{
      return[];
    }
  });

  const[attachmentsMap,setAttachmentsMap]=useState(()=>{
    if(typeof window==="undefined")return{};
    try{
      const raw=window.localStorage.getItem("reportAttachments");
      return raw?JSON.parse(raw):{};
    }catch{
      return{};
    }
  });

  useEffect(()=>{
    if(typeof window!=="undefined"){
      window.localStorage.setItem(
        "reportAttachments",
        JSON.stringify(attachmentsMap)
      );
    }
  },[attachmentsMap]);

  // cargar reportes backend
  useEffect(()=>{
    const authHeaders=token?{Authorization:`Bearer ${token}`}:{};

    const loadReports=async()=>{
      try{
        const resp=await fetch("http://localhost:8080/api/reports",{
          headers:{...authHeaders},
        });
        if(!resp.ok)throw new Error("Error al cargar reportes");

        const data=await resp.json();
        const withSource=data.map(r=>({
          ...r,
          source:r.source||"created",
        }));

        setReportes(withSource);
        if(typeof window!=="undefined"){
          window.localStorage.setItem(
            "reportesCreados",
            JSON.stringify(withSource)
          );
        }
      }catch(err){
        console.error("Error cargando reportes",err);
      }
    };

    loadReports();
  },[token]);

  /* =====================================================================
     ====================== CÁLCULOS NORMALES ============================
     ===================================================================== */

  // sin filtro de periodo
  const[entityFilter,setEntityFilter]=useState("Todas");
  const[riskFilter,setRiskFilter]=useState("Todos");

  // ---- entidades derivadas ----
  const entities=useMemo(()=>{
    if(!reportes||reportes.length===0)return[];

    const now=new Date();
    const todayStart=new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const byEntidad=new Map();

    for(const rep of reportes){
      const{due,extended,acuseDate}=getDueAndAcuse(rep,attachmentsMap);
      const entidadName=rep.entidadControl||"Sin entidad definida";

      if(!byEntidad.has(entidadName)){
        byEntidad.set(entidadName,{
          entidad:entidadName,
          tiempo:0,
          pendientes:0,
          vencidos:0,
          fueraDeTiempo:0,
          vencidosConCarga:0,
          riesgo:"Bajo",
          cumplimiento:0,
          diasRetrasoPromedio:null,
          _delays:[],
          _total:0,
        });
      }

      const bucket=byEntidad.get(entidadName);
      bucket._total++;

      const status=getStatusLabelFromDue(due,extended,acuseDate,todayStart);

      if(!due){
        if(acuseDate)bucket.tiempo++;
        else bucket.pendientes++;
        continue;
      }

      if(status==="Enviado a tiempo"){
        bucket.tiempo++;
      }else if(status==="Enviado tarde"){
        bucket.fueraDeTiempo++;
        bucket.vencidosConCarga++;
        if(acuseDate&&extended){
          const diffDays=
            (acuseDate.getTime()-extended.getTime())/(1000*60*60*24);
          if(diffDays>0)bucket._delays.push(diffDays);
        }
      }else if(status==="Dentro del plazo"||status==="Pendiente"){
        bucket.pendientes++;
      }else if(status==="Vencido"){
        bucket.vencidos++;
        if(acuseDate&&extended){
          const diffDays=
            (acuseDate.getTime()-extended.getTime())/(1000*60*60*24);
          if(diffDays>0)bucket._delays.push(diffDays);
        }
      }
    }

    const result=[];

    for(const[,bucket]of byEntidad.entries()){
      const t=bucket._total;

      const cumplimientoNum=t>0?Math.round((bucket.tiempo/t)*100):0;

      const riskScore=t>0?((bucket.vencidos||0)*2+bucket.fueraDeTiempo)/t:0;

      let riesgo="Bajo";
      if(riskScore>=1)riesgo="Crítico";
      else if(riskScore>=0.5)riesgo="Alto";
      else if(riskScore>=0.2)riesgo="Medio";

      let avgDelay=null;
      if(bucket._delays.length>0){
        avgDelay=
          bucket._delays.reduce((a,b)=>a+b,0)/bucket._delays.length;
      }

      result.push({
        entidad:bucket.entidad,
        tiempo:bucket.tiempo,
        pendientes:bucket.pendientes,
        vencidos:bucket.vencidos,
        fueraDeTiempo:bucket.fueraDeTiempo,
        riesgo,
        cumplimiento:`${cumplimientoNum}%`,
        diasRetrasoPromedio:avgDelay,
      });
    }

    return result.sort((a,b)=>{
      const aScore=a.vencidos*2+a.fueraDeTiempo;
      const bScore=b.vencidos*2+b.fueraDeTiempo;
      return bScore-aScore;
    });
  },[reportes,attachmentsMap]);

  const riskSummary=useMemo(()=>{
    const summary={critico:0,alto:0,medio:0,bajo:0,total:0};
    entities.forEach(e=>{
      summary.total++;
      if(e.riesgo==="Crítico")summary.critico++;
      else if(e.riesgo==="Alto")summary.alto++;
      else if(e.riesgo==="Medio")summary.medio++;
      else summary.bajo++;
    });
    return summary;
  },[entities]);

  const entityOptions=useMemo(()=>{
    return["Todas",...Array.from(new Set(entities.map(e=>e.entidad)))];
  },[entities]);

  const filteredEntities=useMemo(()=>{
    return entities.filter(e=>{
      if(entityFilter!=="Todas"&&e.entidad!==entityFilter)return false;
      if(riskFilter!=="Todos"&&e.riesgo!==riskFilter)return false;
      return true;
    });
  },[entityFilter,riskFilter,entities]);

  const[entitiesPage,setEntitiesPage]=useState(1);

  const totalEntities=filteredEntities.length;
  const totalEntitiesPages=Math.max(
    1,
    Math.ceil(totalEntities/ENTITIES_PAGE_SIZE)
  );
  const entitiesStartIndex=(entitiesPage-1)*ENTITIES_PAGE_SIZE;

  const pageEntities=filteredEntities.slice(
    entitiesStartIndex,
    entitiesStartIndex+ENTITIES_PAGE_SIZE
  );

  useEffect(()=>setEntitiesPage(1),[entityFilter,riskFilter]);
  useEffect(()=>{
    if(entitiesPage>totalEntitiesPages)setEntitiesPage(totalEntitiesPages);
  },[entitiesPage,totalEntitiesPages]);

  /* ================= MÉTRICAS GLOBALES ================== */

  const globalMetrics=useMemo(()=>{
    let total=0,
      dentroPlazo=0,
      enviadosATiempo=0,
      enviadosFueraTiempo=0,
      vencidos=0,
      pendientes=0;

    const delays=[];

    const now=new Date();
    const todayStart=new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    for(const rep of reportes){
      const{due,extended,acuseDate}=getDueAndAcuse(
        rep,
        attachmentsMap
      );
      if(!due)continue;

      total++;

      const status=getStatusLabelFromDue(due,extended,acuseDate,todayStart);

      if(status==="Dentro del plazo"){
        dentroPlazo++;
        pendientes++;
      }else if(status==="Pendiente"){
        pendientes++;
      }else if(status==="Enviado a tiempo"){
        enviadosATiempo++;
      }else if(status==="Enviado tarde"){
        enviadosFueraTiempo++;
        if(acuseDate&&extended){
          const diffDays=
            (acuseDate.getTime()-extended.getTime())/
            (1000*60*60*24);
          if(diffDays>0)delays.push(diffDays);
        }
      }else if(status==="Vencido"){
        vencidos++;
        if(acuseDate&&extended){
          const diffDays=
            (acuseDate.getTime()-extended.getTime())/
            (1000*60*60*24);
          if(diffDays>0)delays.push(diffDays);
        }
      }
    }

    const cumplimiento=
      total>0?Math.round((dentroPlazo/total)*100):null;

    const avgDelay=
      delays.length>0
        ?(delays.reduce((a,b)=>a+b,0)/delays.length).toFixed(1)+
          " días"
        :"—";

    return{
      vencidos,
      pendientes,
      enviadosATiempo,
      enviadosFueraTiempo,
      cumplimientoYTD:cumplimiento!==null?`${cumplimiento}%`:"—",
      totalReportes:total,
      retrasoPromedioLabel:avgDelay,
      dentroPlazo,
    };
  },[reportes,attachmentsMap]);

  const riskIndexLabel=useMemo(()=>{
    if(!riskSummary.total)return"—";
    const high=riskSummary.critico+riskSummary.alto;
    const ratio=high/riskSummary.total;
    if(ratio>=0.5)return"Alto";
    if(ratio>=0.2)return"Medio";
    return"Bajo";
  },[riskSummary]);

  const executiveNotes=useMemo(()=>{
    const notes=[];
    if(globalMetrics.vencidos>0)
      notes.push(
        `Hay ${globalMetrics.vencidos} reportes vencidos que requieren acción inmediata.`
      );
    if(globalMetrics.enviadosFueraTiempo>0)
      notes.push(
        `${globalMetrics.enviadosFueraTiempo} reportes enviados fuera del tiempo; revisar causas raíz.`
      );
    if(globalMetrics.cumplimientoYTD!=="—")
      notes.push(
        `El cumplimiento (reportes dentro del plazo) está en ${globalMetrics.cumplimientoYTD}.`
      );
    if(riskIndexLabel!=="Bajo")
      notes.push(
        `Riesgo regulatorio **${riskIndexLabel}**. Priorizar entidades en zona crítica.`
      );
    if(notes.length===0)
      notes.push("Sin hallazgos relevantes. Mantener monitoreo continuo.");

    return notes;
  },[globalMetrics,riskIndexLabel]);

  const stateDistribution=useMemo(()=>{
    const d=globalMetrics.dentroPlazo||0;
    const f=globalMetrics.enviadosFueraTiempo||0;
    const p=globalMetrics.pendientes||0;
    const v=globalMetrics.vencidos||0;
    const t=d+f+p+v;

    return{
      total:t,
      items:[
        {key:"Dentro del plazo",value:d,color:"emerald"},
        {key:"Fuera de tiempo",value:f,color:"amber"},
        {key:"Pendiente",value:p,color:"slate"},
        {key:"Vencido",value:v,color:"red"},
      ],
    };
  },[globalMetrics]);

  const complianceHistory = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const monthLabels = [
      "Ene","Feb","Mar","Abr","May","Jun",
      "Jul","Ago","Sep","Oct","Nov","Dic",
    ];

    const WINDOW_MONTHS = 4;

    // últimos 4 meses (incluyendo el actual)
    const months = [];
    for (let i = WINDOW_MONTHS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}`;
      months.push({ key, label: monthLabels[d.getMonth()] });
    }

    const buckets = {};
    months.forEach((m) => {
      buckets[m.key] = {
        total: 0,
        dentro: 0,
        pendientes: 0,
        vencidos: 0,
      };
    });

    for (const rep of reportes) {
      const { due, extended, acuseDate } = getDueAndAcuse(rep, attachmentsMap);
      if (!due) continue;
      if (due > todayStart) continue; 

      const key = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!buckets[key]) continue; // fuera de la ventana

      const status = getStatusLabelFromDue(due, extended, acuseDate, todayStart);

      // agrupamos por estado "macro"
      if (status === "Dentro del plazo" || status === "Enviado a tiempo") {
        buckets[key].dentro++;
      } else if (status === "Pendiente") {
        buckets[key].pendientes++;
      } else if (status === "Vencido" || status === "Enviado tarde") {
        buckets[key].vencidos++;
      } else {
        // otros estados no entran al histórico
        continue;
      }

      buckets[key].total++;
    }

    return months.map((m) => {
      const b = buckets[m.key] || { total: 0, dentro: 0, pendientes: 0, vencidos: 0 };
      const total = b.total || 1;

      const dentroPct    = Math.round((b.dentro     / total) * 100);
      const pendientePct = Math.round((b.pendientes / total) * 100);
      const vencidoPct   = Math.round((b.vencidos   / total) * 100);

      return {
        mes: m.label,
        dentroPct,
        pendientePct,
        vencidoPct,
        dentro: b.dentro,
        pendientes: b.pendientes,
        vencidos: b.vencidos,
      };
    });
  }, [reportes, attachmentsMap]);

  const responsablesMetrics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const buckets = new Map();

    for (const rep of reportes) {
      const { due, extended, acuseDate } = getDueAndAcuse(
        rep,
        attachmentsMap
      );
      if (!due) continue;

      const status = getStatusLabelFromDue(
        due,
        extended,
        acuseDate,
        todayStart
      );

      const responsable =
        rep.responsableElaboracionName ||
        rep.emailResponsableEnvio ||
        rep.responsableSupervisionName ||
        rep.emailLiderSeguimiento ||
        "Sin responsable";

      if (!buckets.has(responsable)) {
        buckets.set(responsable, {
          responsable,
          total: 0,
          enRegla: 0, // Dentro del plazo
        });
      }

      const bucket = buckets.get(responsable);
      bucket.total++;

      if (status === "Dentro del plazo") {
        bucket.enRegla++;
      }
    }

    const arr = Array.from(buckets.values())
      .filter((b) => b.total > 0)
      .map((b) => ({
        responsable: b.responsable,
        cumplimiento: Math.round((b.enRegla / b.total) * 100),
      }));

    // ranking de mayor a menor cumplimiento
    arr.sort((a, b) => b.cumplimiento - a.cumplimiento);
    return arr;
  }, [reportes, attachmentsMap]);

  /* =====================================================================
     ============================ UI RENDER ===============================
     ===================================================================== */

  return(
    <div className="min-h-screen bg-slate-50/80 px-3 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            Tablero de cumplimiento
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500">
            Visibilidad ejecutiva del riesgo regulatorio y desempeño por entidad.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard
            label="Cumplimiento (dentro del plazo)"
            value={globalMetrics.cumplimientoYTD}
            tone="success"
            helper="Porcentaje de obligaciones activas dentro del plazo."
          />
          <KpiCard
            label="Reportes dentro del plazo"
            value={globalMetrics.dentroPlazo}
            helper="Obligaciones activas y en regla."
          />
          <KpiCard
            label="Reportes pendientes/vigentes"
            value={globalMetrics.pendientes}
            helper="Obligaciones abiertas por atender."
          />
          <KpiCard
            label="Reportes vencidos"
            value={globalMetrics.vencidos}
            tone="danger"
            helper="Requieren acción inmediata."
          />
        </div>

        {/* Filtros */}
        <SectionCard className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3 text-xs">
              <Select
                label="Entidad"
                value={entityFilter}
                options={entityOptions}
                onChange={setEntityFilter}
              />
              <Select
                label="Nivel de riesgo"
                value={riskFilter}
                options={["Todos","Bajo","Alto","Crítico"]}
                onChange={setRiskFilter}
              />
            </div>
            <div className="flex flex-col items-start md:items-end gap-1 text-[11px] text-slate-500">
              <span>
                Vista consolidada del estado regulatorio. Usa los filtros para
                priorizar.
              </span>
              <span className="font-medium text-slate-600">
                {filteredEntities.length} entidades visibles ·{" "}
                {globalMetrics.totalReportes} reportes
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-slate-500">
            <Legend/>
            <span className="hidden md:inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
              <span>En regla</span>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 ml-3"/>
              <span>Zona crítica</span>
            </span>
          </div>
        </SectionCard>

        {/* Tabla + Riesgo */}
        <div className="grid lg:grid-cols-[1.7fr,1.1fr] gap-5 items-start">
          <SectionCard
            title="Obligaciones por entidad"
            subtitle="Distribución de reportes por entidad y nivel de riesgo."
          >
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="border-b bg-slate-50/80 text-[11px] text-slate-500">
                  <tr>
                    <th className="py-2.5 pl-5 pr-2 text-left font-medium uppercase tracking-wide">
                      Entidad
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium uppercase tracking-wide w-28">
                      Pendientes
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium uppercase tracking-wide w-28">
                      Vencidos
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium uppercase tracking-wide w-20">
                      %
                    </th>
                    <th className="py-2.5 pr-5 text-center font-medium uppercase tracking-wide w-24">
                      Riesgo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageEntities.length===0?(
                    <tr>
                      <td
                        colSpan={5}
                        className="py-5 text-center text-[11px] text-slate-500"
                      >
                        No hay entidades para estos filtros.
                      </td>
                    </tr>
                  ):(
                    pageEntities.map(e=><Row key={e.entidad}{...e}/>)
                  )}
                </tbody>
              </table>
            </div>

            {totalEntities>0&&(
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Mostrando{" "}
                  <span className="font-medium text-slate-700">
                    {entitiesStartIndex+1}–
                    {Math.min(
                      entitiesStartIndex+ENTITIES_PAGE_SIZE,
                      totalEntities
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-slate-700">
                    {totalEntities}
                  </span>{" "}
                  entidades
                </span>
                <div className="flex gap-1">
                  <PagerButton
                    disabled={entitiesPage===1}
                    onClick={()=>setEntitiesPage(entitiesPage-1)}
                  >
                    ‹
                  </PagerButton>
                  {Array.from(
                    {length:totalEntitiesPages},
                    (_,i)=>i+1
                  ).map(p=>(
                    <PagerButton
                      key={p}
                      active={p===entitiesPage}
                      onClick={()=>setEntitiesPage(p)}
                    >
                      {p}
                    </PagerButton>
                  ))}
                  <PagerButton
                    disabled={entitiesPage===totalEntitiesPages}
                    onClick={()=>setEntitiesPage(entitiesPage+1)}
                  >
                    ›
                  </PagerButton>
                </div>
              </div>
            )}
          </SectionCard>

{/* Riesgo + notas */}
<div className="flex flex-col gap-4 h-full">
  <SectionCard
    title="Riesgo consolidado"
    subtitle="Resumen regulatorio por nivel de riesgo."
    className="flex-1 flex flex-col"
  >
              <div className="space-y-3 text-xs">
                <RiskBar
                  label="Crítico"
                  value={riskSummary.critico}
                  total={riskSummary.total}
                  tone="danger"
                />
                <RiskBar
                  label="Alto"
                  value={riskSummary.alto}
                  total={riskSummary.total}
                  tone="warning"
                />
                <RiskBar
                  label="Bajo"
                  value={riskSummary.bajo}
                  total={riskSummary.total}
                  tone="success"
                />
              </div>
            </SectionCard>

             <SectionCard
    title="Notas ejecutivas"
    subtitle="Puntos clave para comités."
    className="flex-1 flex flex-col"
  >
              <ul className="space-y-2 text-[11px] text-slate-600 flex-1">
                {executiveNotes.map((n,i)=>(
                  <li key={i}className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0"/>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* GRÁFICAS */}
        <div className="grid lg:grid-cols-2 gap-5">
          <SectionCard
            title="Distribución de estado"
            subtitle="Estado global de las obligaciones."
            className="min-h-[220px] flex flex-col"
          >
            <StateDistributionChart data={stateDistribution}/>
          </SectionCard>

          <SectionCard
            title="Tendencia histórica de cumplimiento"
            subtitle="Porcentaje de reportes dentro del plazo (últimos 4 meses)."
            className="min-h-[220px] flex flex-col"
          >
            <TendenciaChart data={complianceHistory}/>
          </SectionCard>

          <SectionCard
            title="Ranking de responsables"
            subtitle="% de obligaciones que se mantienen dentro del plazo."
            className="lg:col-span-2 min-h-[220px]"
          >
            <ResponsablesChart data={responsablesMetrics}/>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}


/* =====================================================================
   ========================= COMPONENTES UI ==============================
   ===================================================================== */

function KpiCard({label,value,helper,tone="neutral"}){
  const tones={
    neutral:
      "border-slate-100 bg-gradient-to-br from-white to-slate-50/70 text-slate-900",
    success:
      "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 text-emerald-900",
    warning:
      "border-amber-100 bg-gradient-to-br from-white to-amber-50/70 text-amber-900",
    danger:
      "border-red-100 bg-gradient-to-br from-white to-red-50/70 text-red-900",
  };

  return(
    <div
      className={`group rounded-2xl border px-4 py-3 text-xs shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-150 ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span className="inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] text-slate-500">
          KPI
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none tabular-nums">
        {value}
      </p>
      {helper&&(
        <p className="mt-2 text-[11px] text-slate-600 leading-snug">{helper}</p>
      )}
    </div>
  );
}

function Select({label,value,options,onChange}){
  return(
    <div className="flex flex-col gap-1 text-[11px]">
      <span className="text-slate-500 font-medium">{label}</span>
      <div className="relative">
        <select
          className="w-44 appearance-none rounded-full border border-slate-200 bg-white px-3 pr-7 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 transition"
          value={value}
          onChange={e=>onChange(e.target.value)}
        >
          {options.map(o=>(
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400 text-[10px]">
          ▼
        </span>
      </div>
    </div>
  );
}

function Legend(){
  return(
    <div className="flex gap-3 text-[11px] items-center">
      <span className="text-slate-500 mr-1">Nivel de riesgo:</span>
      <LegendItem color="bg-emerald-500"label="Bajo"/>
      <LegendItem color="bg-amber-500"label="Alto"/>
      <LegendItem color="bg-red-500"label="Crítico"/>
    </div>
  );
}

function LegendItem({color,label}){
  return(
    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 border border-slate-100">
      <span className={`h-2 w-2 rounded-full ${color}`}/>
      <span>{label}</span>
    </span>
  );
}

function SectionCard({title,subtitle,children,className=""}){
  const hasHeader=!!title||!!subtitle;

  return(
    <div
      className={`rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-150 ${className}`}
    >
      {hasHeader&&(
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-start justify-between gap-2">
          <div>
            {title&&(
              <h2 className="text-sm font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {subtitle&&(
              <p className="mt-0.5 text-[11px] text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="px-4 pb-4 pt-3">{children}</div>
    </div>
  );
}

function RiskPill({riesgo}){
  const map={
    Crítico:"bg-red-50 text-red-700 border-red-100",
    Alto:"bg-amber-50 text-amber-700 border-amber-100",
    Bajo:"bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return(
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] border font-medium ${
        map[riesgo]||
        "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {riesgo}
    </span>
  );
}

// sin columna "A tiempo"
function Row({entidad,pendientes,vencidos,riesgo,cumplimiento}){
  return(
    <tr className="text-slate-700 hover:bg-slate-50/70 transition">
      <td className="py-2.5 pl-5 pr-2 font-medium whitespace-nowrap">
        {entidad}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums w-28">
        {pendientes??"—"}
      </td>
      <td
        className={`px-3 py-2.5 text-right tabular-nums w-28 ${
          vencidos>0?"text-red-600 font-semibold":""
        }`}
      >
        {vencidos??"—"}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-medium w-20">
        {cumplimiento}
      </td>
      <td className="py-2.5 pr-5 text-center w-24">
        <RiskPill riesgo={riesgo}/>
      </td>
    </tr>
  );
}

function PagerButton({children,active,disabled,onClick}){
  return(
    <button
      disabled={disabled}
      onClick={onClick}
      className={`min-w-[26px] px-2 py-1 rounded-md border text-[11px] flex items-center justify-center
        ${
          disabled
            ?"opacity-40 cursor-not-allowed"
            :"hover:bg-slate-900 hover:text-white hover:border-slate-900 transition"
        }
        ${
          active
            ?"bg-slate-900 text-white border-slate-900"
            :"bg-white border-slate-200 text-slate-700"
        }`}
    >
      {children}
    </button>
  );
}

function RiskBar({label,value,total,tone}){
  const colors={
    danger:"bg-red-500",
    warning:"bg-amber-500",
    success:"bg-emerald-500",
  };
  const pct=total>0?Math.round((value/total)*100):0;
  return(
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-500">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[tone]||"bg-slate-400"} rounded-full`}
          style={{width:`${pct}%`}}
        />
      </div>
    </div>
  );
}

/* Distribución de estados -> gráfico de pastel  */
function StateDistributionChart({data}){
  if(!data.total){
    return(
      <p className="text-[11px] text-slate-500">
        No hay datos suficientes para la distribución de estado.
      </p>
    );
  }

  const colorHexMap={
    emerald:"#10b981",
    amber:"#f59e0b",
    slate:"#64748b",
    red:"#ef4444",
  };

  let offset=0;
  const segments=data.items
    .filter(i=>i.value>0)
    .map(i=>{
      const pct=(i.value/data.total)*100;
      const from=offset;
      const to=offset+pct;
      offset=to;
      return{
        key:i.key,
        value:i.value,
        from,
        to,
        color:colorHexMap[i.color]||"#cbd5f5",
        legendColor:i.color,
      };
    });

  const gradient=segments
    .map(s=>`${s.color} ${s.from}% ${s.to}%`)
    .join(", ");

  const dotColorMap={
    emerald:"bg-emerald-500",
    amber:"bg-amber-500",
    slate:"bg-slate-500",
    red:"bg-red-500",
  };

  return(
    <div className="flex flex-col lg:flex-row items-center gap-5">
      <div className="relative h-40 w-40 flex-shrink-0">
        <div
          className="h-full w-full rounded-full shadow-inner"
          style={{
            backgroundImage:`conic-gradient(${gradient})`,
          }}
        />
        <div className="absolute inset-7 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
          <span className="text-[11px] text-slate-500">Total</span>
          <span className="text-sm font-semibold text-slate-900">
            {data.total}
          </span>
          <span className="text-[10px] text-slate-400">reportes</span>
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="space-y-1.5 text-[11px]">
          {data.items.map(i=>{
            const seg=segments.find(s=>s.key===i.key);
            if(!seg)return null;
            const pct=
              data.total>0?Math.round((i.value/data.total)*100):0;
            return(
              <div
                key={i.key}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      dotColorMap[i.color]||"bg-slate-300"
                    }`}
                  />
                  <span className="text-slate-600">{i.key}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-slate-500">
                    {i.value} · {pct}%
                  </span>
                  <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        dotColorMap[i.color]||"bg-slate-300"
                      }`}
                      style={{width:`${pct}%`}}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
/* Tendencia 4 meses -> gráfico de líneas por estado */
function TendenciaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-[11px] text-slate-500">
        No hay datos suficientes para calcular la tendencia histórica.
      </p>
    );
  }

  const series = [
    { key: "Dentro del plazo", field: "dentroPct", color: "#0ea5e9" },
    { key: "Pendiente",        field: "pendientePct", color: "#fbbf24" },
    { key: "Vencido",          field: "vencidoPct",   color: "#ef4444" },
  ];

  const maxRaw = Math.max(
    ...data.flatMap((d) => series.map((s) => d[s.field] ?? 0))
  );
  const max = maxRaw > 0 ? maxRaw : 1;

  const width = 260;
  const height = 140;
  const paddingX = 24;
  const paddingY = 20;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const stepX =
    data.length > 1 ? innerWidth / (data.length - 1) : innerWidth / 2;

  // puntos base en X por mes
  const basePoints = data.map((d, idx) => {
    const x = paddingX + stepX * (data.length === 1 ? 0.5 : idx);
    return { x, label: d.mes, idx };
  });

  const seriesPoints = series.map((s) => {
    const pts = basePoints.map((bp) => {
      const value = data[bp.idx][s.field] ?? 0;
      const ratio = value / max;
      const y = paddingY + innerHeight - ratio * innerHeight;
      return { x: bp.x, y, value };
    });
    return { ...s, points: pts };
  });

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40 overflow-visible"
      >
        {/* eje base */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* línea 100% */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="#e5e7eb"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        {seriesPoints.map((s, sIdx) => {
          const polylinePoints = s.points
            .map((p) => `${p.x},${p.y}`)
            .join(" ");

          return (
            <g key={s.key}>
              {/* línea */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                opacity={0.9}
              />
              {/* puntos + labels */}
              {s.points.map((p, idx) => (
                <g key={`${s.key}-${idx}`}>
                  <circle cx={p.x} cy={p.y} r={3} fill={s.color} />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill="white"
                    stroke={s.color}
                    strokeWidth="1"
                    opacity="0.6"
                  />
                 {p.value > 0 && (
  <text
    x={p.x}
    y={p.y - (6 + sIdx * 10)}
    textAnchor="middle"
    fontSize="9"
    fill="#6b7280"
  >
    {p.value}%
  </text>
)}

                </g>
              ))}
            </g>
          );
        })}

        {/* labels de mes */}
        {basePoints.map((bp) => (
          <text
            key={bp.idx}
            x={bp.x}
            y={height - paddingY + 12}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            {data[bp.idx].mes}
          </text>
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-slate-500">
        <span>0%</span>
        <span>100%</span>
      </div>

      {/* leyenda */}
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.key}</span>
          </span>
        ))}
      </div>
    </div>
  );
}


/* Ranking responsables */
function ResponsablesChart({data}){
  if(!data||data.length===0){
    return(
      <p className="text-[11px] text-slate-500">
        No hay datos suficientes para calcular el cumplimiento por responsable.
      </p>
    );
  }

  const maxRaw=Math.max(...data.map(d=>d.cumplimiento));
  const max=maxRaw>0?maxRaw:1;

  return(
    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {data.map((r,i)=>(
        <div key={i}className="space-y-1">
          <div className="flex justify-between gap-2 text-[11px] text-slate-600">
            <span className="truncate">{r.responsable}</span>
            <span className="tabular-nums font-medium">
              {r.cumplimiento}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width:`${(r.cumplimiento/max)*100}%`,
                minWidth:"6px",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
