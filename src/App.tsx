import { useEffect, useState } from 'react'
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
} from 'recharts'

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesProgram =
      program === 'All' || student.program === program

    const minCgpaValue = minCgpa === '' ? null : Number(minCgpa)

    const matchesCgpa =
      minCgpaValue === null ||
      isNaN(minCgpaValue) ||
      Number(student.cgpa) >= minCgpaValue

    return matchesSearch && matchesProgram && matchesCgpa
  })

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

  const programData = [
    {
      name: 'BCA',
      count: students.filter((s) => s.program === 'BCA').length,
    },
    {
      name: 'MCA',
      count: students.filter((s) => s.program === 'MCA').length,
    },
    {
      name: 'BTech',
      count: students.filter((s) => s.program === 'BTech').length,
    },
    {
      name: 'MBA',
      count: students.filter((s) => s.program === 'MBA').length,
    },
  ]

  const riskData = [
    {
      name: 'Low',
      value: students.filter((s) => s.risk === 'Low').length,
    },
    {
      name: 'Medium',
      value: students.filter((s) => s.risk === 'Medium').length,
    },
    {
      name: 'High',
      value: students.filter((s) => s.risk === 'High').length,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Student Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Overview of student performance, risk levels, and program
            distribution
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              High Risk
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {highRiskStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Average CGPA
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {averageCGPA}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Attendance
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {averageAttendance}%
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-700">
            Filters
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5 min-w-[200px]">
              <span className="text-xs font-medium text-slate-500">
                Search
              </span>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:w-40">
              <span className="text-xs font-medium text-slate-500">
                Program
              </span>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option>All</option>
                <option>BCA</option>
                <option>MCA</option>
                <option>BTech</option>
                <option>MBA</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 sm:w-32">
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Students by Program
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enrollment count per program
            </p>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
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
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Risk Distribution
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Breakdown by risk level
            </p>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                    fill="#6366f1"
                  />
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Student Records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredStudents.length} of {students.length}{' '}
              students
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
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
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No students match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.student_id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.program}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.cgpa}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.attendance}%
                      </td>
                      <td className="px-6 py-4">
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
      </div>
    </div>
  )
}

export default App