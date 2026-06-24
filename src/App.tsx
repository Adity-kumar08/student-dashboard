import { memo, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444']

function highlightName(name: string, query: string) {
  if (!query.trim()) return name

  const lowerName = name.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerName.indexOf(lowerQuery)

  if (index === -1) return name

  return (
    <>
      {name.slice(0, index)}
      <mark className="rounded bg-indigo-100 px-0.5 font-semibold text-indigo-800">
        {name.slice(index, index + query.length)}
      </mark>
      {name.slice(index + query.length)}
    </>
  )
}

const DashboardCharts = memo(function DashboardCharts({
  students,
}: {
  students: { program: string; risk: string }[]
}) {
  const programData = useMemo(
    () => [
      { name: 'BCA', count: students.filter((s) => s.program === 'BCA').length },
      { name: 'MCA', count: students.filter((s) => s.program === 'MCA').length },
      {
        name: 'BTech',
        count: students.filter((s) => s.program === 'BTech').length,
      },
      { name: 'MBA', count: students.filter((s) => s.program === 'MBA').length },
    ],
    [students]
  )

  const riskData = useMemo(
    () => [
      { name: 'Low', value: students.filter((s) => s.risk === 'Low').length },
      {
        name: 'Medium',
        value: students.filter((s) => s.risk === 'Medium').length,
      },
      { name: 'High', value: students.filter((s) => s.risk === 'High').length },
    ],
    [students]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Students by Program
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enrollment count per program
        </p>

        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programData}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Risk Distribution
        </h2>
        <p className="mt-1 text-xs text-slate-500">Breakdown by risk level</p>

        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label={({ name, value }) =>
                  value > 0 ? `${name}: ${value}` : ''
                }
              >
                {riskData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={RISK_COLORS[index % RISK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
})

function App() {
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [program, setProgram] = useState('All')
  const [minCgpa, setMinCgpa] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('student_id', { ascending: true })

      if (error) {
        console.error(error)
        return
      }

      setStudents(data || [])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const minCgpaValue = minCgpa === '' ? null : Number(minCgpa)

    return students.filter((student) => {
      const name = (student.name ?? '').toLowerCase()
      const matchesSearch = query === '' || name.includes(query)

      const matchesProgram =
        program === 'All' || student.program === program

      const matchesCgpa =
        minCgpaValue === null ||
        isNaN(minCgpaValue) ||
        Number(student.cgpa) >= minCgpaValue

      return matchesSearch && matchesProgram && matchesCgpa
    })
  }, [students, search, program, minCgpa])

  const totalStudents = students.length

  const highRiskStudents = students.filter(
    (student) => student.risk === 'High'
  ).length

  const averageCGPA =
    students.length > 0
      ? (
          students.reduce(
            (sum, student) => sum + Number(student.cgpa),
            0
          ) / students.length
        ).toFixed(2)
      : '0'

  const averageAttendance =
    students.length > 0
      ? (
          students.reduce(
            (sum, student) => sum + Number(student.attendance),
            0
          ) / students.length
        ).toFixed(2)
      : '0'

  const hasActiveFilters =
    search.trim() !== '' || program !== 'All' || minCgpa !== ''

  function clearFilters() {
    setSearch('')
    setProgram('All')
    setMinCgpa('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading students...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            Live dashboard
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Student Analytics Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Search and filter students instantly. Charts show the full dataset;
            the table updates as you type.
          </p>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              High Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {highRiskStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Average CGPA
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {averageCGPA}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Attendance
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {averageAttendance}%
            </p>
          </div>
        </div>

        <div className="sticky top-4 z-10 mb-6 rounded-2xl border border-indigo-100 bg-white/95 p-5 shadow-md shadow-indigo-100/50 backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Search &amp; filter
              </p>
              <p className="text-xs text-slate-500">
                Results update instantly as you type
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-500">
                Search by name
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Type a student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 lg:w-44">
              <span className="text-xs font-medium text-slate-500">
                Program
              </span>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option>All</option>
                <option>BCA</option>
                <option>MCA</option>
                <option>BTech</option>
                <option>MBA</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 lg:w-36">
              <span className="text-xs font-medium text-slate-500">
                Min CGPA
              </span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="0.00"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Student Records
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Filtered results appear here immediately
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filteredStudents.length === 0
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
              }`}
            >
              {filteredStudents.length} of {students.length} shown
            </span>
          </div>

          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 z-[1] bg-white shadow-sm">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ID
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Program
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    CGPA
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-sm font-medium text-slate-600">
                        No students match your filters
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try a different name, program, or CGPA threshold
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.student_id}
                      className="transition-colors hover:bg-indigo-50/40"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {highlightName(student.name ?? '', search)}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {student.program}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {student.cgpa}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {student.attendance}%
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            student.risk === 'High'
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                              : student.risk === 'Medium'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          }`}
                        >
                          {student.risk}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DashboardCharts students={students} />
      </div>
    </div>
  )
}

export default App
