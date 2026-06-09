'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

type Author = {
    id: string
    name: string
    email: string
    bio: string | null
    nationality: string | null
    birthYear: number | null
    _count: { books: number }
}

type Errors = { name?: string; email?: string }

export default function Dashboard() {
    const { toast } = useToast()
    const [authors, setAuthors] = useState<Author[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
    const [errors, setErrors] = useState<Errors>({})
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ totalAuthors: 0, totalBooks: 0, totalGenres: 0 })

    const fetchAuthors = async () => {
        const [authorsRes, booksRes] = await Promise.all([
            fetch('/api/authors'),
            fetch('/api/books'),
        ])
        const data = await authorsRes.json()
        setAuthors(data)
        const books = await booksRes.json()
        const genres = new Set(books.map((b: any) => b.genre).filter(Boolean))
        setStats({ totalAuthors: data.length, totalBooks: books.length, totalGenres: genres.size })
    }

    useEffect(() => { fetchAuthors() }, [])

    const validate = () => {
        const e: Errors = {}
        if (!form.name.trim()) e.name = 'El nombre es obligatorio'
        if (!form.email.trim()) e.email = 'El email es obligatorio'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSaving(true)
        const method = editing ? 'PUT' : 'POST'
        const url = editing ? `/api/authors/${editing}` : '/api/authors'
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            toast(editing ? 'Autor actualizado correctamente' : 'Autor creado correctamente', 'success')
            setForm({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
            setErrors({})
            setShowForm(false)
            setEditing(null)
            fetchAuthors()
        } else {
            const data = await res.json()
            toast(data.error || 'Error al guardar autor', 'error')
        }
        setSaving(false)
    }

    const handleEdit = (author: Author) => {
        setForm({
            name: author.name,
            email: author.email,
            bio: author.bio || '',
            nationality: author.nationality || '',
            birthYear: author.birthYear?.toString() || '',
        })
        setEditing(author.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este autor? Se eliminarán todos sus libros.')) return
        const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
        if (res.ok) {
            toast('Autor eliminado correctamente', 'success')
            fetchAuthors()
        } else {
            toast('Error al eliminar autor', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">B</span>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900">Biblioteca</h1>
                    </div>
                    <nav className="flex gap-1">
                        <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-900 bg-amber-100 text-amber-800 rounded-md">Dashboard</Link>
                        <Link href="/books" className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors">Libros</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <p className="text-3xl font-bold text-slate-900">{stats.totalAuthors}</p>
                        <p className="text-sm text-slate-500 mt-1">Autores registrados</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <p className="text-3xl font-bold text-slate-900">{stats.totalBooks}</p>
                        <p className="text-sm text-slate-500 mt-1">Libros en catálogo</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <p className="text-3xl font-bold text-slate-900">{stats.totalGenres}</p>
                        <p className="text-sm text-slate-500 mt-1">Géneros literarios</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Autores</h2>
                        <p className="text-sm text-slate-500">{authors.length} autores en total</p>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', email: '', bio: '', nationality: '', birthYear: '' }); setErrors({}) }}
                        className="px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm">
                        {showForm ? 'Cancelar' : '+ Nuevo Autor'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
                        <h3 className="text-base font-medium text-slate-900 mb-4">{editing ? 'Editar Autor' : 'Nuevo Autor'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                                <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }) }}
                                    className={`w-full border ${errors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                                <input type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }) }}
                                    className={`w-full border ${errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nacionalidad</label>
                                <input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Año de nacimiento</label>
                                <input type="number" value={form.birthYear} onChange={e => setForm({ ...form, birthYear: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Biografía</label>
                            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" rows={3} />
                        </div>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : editing ? 'Actualizar Autor' : 'Crear Autor'}
                        </button>
                    </form>
                )}

                <div className="space-y-2">
                    {authors.map(author => (
                        <div key={author.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-slate-600">{author.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <Link href={`/authors/${author.id}`} className="font-medium text-slate-900 hover:text-slate-600 transition-colors">{author.name}</Link>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-sm text-slate-500">{author.email}</span>
                                        {author.nationality && <><span className="text-slate-300">·</span><span className="text-sm text-slate-500">{author.nationality}</span></>}
                                        <span className="text-slate-300">·</span>
                                        <span className="text-sm text-slate-500">{author._count.books} {author._count.books === 1 ? 'libro' : 'libros'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <Link href={`/authors/${author.id}`}
                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors">
                                    Ver libros
                                </Link>
                                <button onClick={() => handleEdit(author)}
                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors">
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(author.id)}
                                    className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    {authors.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No hay autores registrados</p>
                            <p className="text-slate-400 text-xs mt-1">Crea tu primer autor para comenzar</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
