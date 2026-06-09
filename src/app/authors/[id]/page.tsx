'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

type Author = {
    id: string
    name: string
    email: string
    bio: string | null
    nationality: string | null
    birthYear: number | null
    createdAt: string
}

type Book = {
    id: string
    title: string
    description: string | null
    isbn: string | null
    publishedYear: number | null
    genre: string | null
    pages: number | null
}

type Stats = {
    authorId: string
    authorName: string
    totalBooks: number
    firstBook: { title: string; year: number } | null
    latestBook: { title: string; year: number } | null
    averagePages: number
    genres: string[]
    longestBook: { title: string; pages: number } | null
    shortestBook: { title: string; pages: number } | null
}

export default function AuthorDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const [author, setAuthor] = useState<Author | null>(null)
    const [books, setBooks] = useState<Book[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [showAddBook, setShowAddBook] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
    const [bookForm, setBookForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })
    const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({})
    const [bookErrors, setBookErrors] = useState<{ title?: string; pages?: string }>({})

    const fetchData = async () => {
        setLoading(true)
        const [authorRes, booksRes, statsRes] = await Promise.all([
            fetch(`/api/authors/${id}`),
            fetch(`/api/authors/${id}/books`),
            fetch(`/api/authors/${id}/stats`),
        ])
        if (authorRes.ok) {
            const a = await authorRes.json()
            setAuthor(a)
            setForm({ name: a.name, email: a.email, bio: a.bio || '', nationality: a.nationality || '', birthYear: a.birthYear?.toString() || '' })
        }
        if (booksRes.ok) {
            const b = await booksRes.json()
            setBooks(b.books || [])
        }
        if (statsRes.ok) setStats(await statsRes.json())
        setLoading(false)
    }

    useEffect(() => { if (id) fetchData() }, [id])

    const validateEdit = () => {
        const e: typeof editErrors = {}
        if (!form.name.trim()) e.name = 'El nombre es obligatorio'
        if (!form.email.trim()) e.email = 'El email es obligatorio'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
        setEditErrors(e)
        return Object.keys(e).length === 0
    }

    const validateBook = () => {
        const e: typeof bookErrors = {}
        if (!bookForm.title.trim()) e.title = 'El título es obligatorio'
        else if (bookForm.title.trim().length < 3) e.title = 'Mínimo 3 caracteres'
        if (bookForm.pages && parseInt(bookForm.pages) < 1) e.pages = 'Debe ser mayor a 0'
        setBookErrors(e)
        return Object.keys(e).length === 0
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateEdit()) return
        setSaving(true)
        const res = await fetch(`/api/authors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            toast('Autor actualizado correctamente', 'success')
            setEditing(false)
            fetchData()
        } else {
            const data = await res.json()
            toast(data.error || 'Error al actualizar', 'error')
        }
        setSaving(false)
    }

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateBook()) return
        setSaving(true)
        const res = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookForm, authorId: id }),
        })
        if (res.ok) {
            toast('Libro creado correctamente', 'success')
            setBookForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })
            setShowAddBook(false)
            setBookErrors({})
            fetchData()
        } else {
            const data = await res.json()
            toast(data.error || 'Error al crear libro', 'error')
        }
        setSaving(false)
    }

    const handleDeleteBook = async (bookId: string) => {
        if (!confirm('¿Estás seguro de eliminar este libro?')) return
        const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
        if (res.ok) {
            toast('Libro eliminado correctamente', 'success')
            fetchData()
        } else {
            toast('Error al eliminar libro', 'error')
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin" />
        </div>
    )

    if (!author) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500">Autor no encontrado</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-900">{author.name}</h1>
                    </div>
                    <nav className="flex gap-1">
                        <Link href="/" className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors">Dashboard</Link>
                        <Link href="/books" className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors">Libros</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-semibold text-slate-900">Información del Autor</h2>
                                <button onClick={() => { setEditing(!editing); setEditErrors({}) }}
                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors">
                                    {editing ? 'Cancelar' : 'Editar'}
                                </button>
                            </div>
                            {editing ? (
                                <form onSubmit={handleEdit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                                            <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (editErrors.name) setEditErrors({ ...editErrors, name: undefined }) }}
                                                className={`w-full border ${editErrors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                            {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                                            <input type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); if (editErrors.email) setEditErrors({ ...editErrors, email: undefined }) }}
                                                className={`w-full border ${editErrors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                            {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
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
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Biografía</label>
                                        <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" rows={3} />
                                    </div>
                                    <button type="submit" disabled={saving}
                                        className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50">
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-slate-900">{author.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Nacionalidad</p>
                                        <p className="text-slate-900">{author.nationality || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Año de nacimiento</p>
                                        <p className="text-slate-900">{author.birthYear || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Registrado</p>
                                        <p className="text-slate-900">{new Date(author.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Biografía</p>
                                        <p className="text-slate-900 leading-relaxed">{author.bio || 'Sin biografía registrada'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Libros</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">{books.length} {books.length === 1 ? 'libro registrado' : 'libros registrados'}</p>
                                </div>
                                <button onClick={() => { setShowAddBook(!showAddBook); setBookErrors({}) }}
                                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm">
                                    {showAddBook ? 'Cancelar' : '+ Agregar Libro'}
                                </button>
                            </div>

                            {showAddBook && (
                                <form onSubmit={handleAddBook} className="space-y-4 mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <h3 className="text-sm font-medium text-slate-900">Nuevo Libro</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
                                            <input value={bookForm.title} onChange={e => { setBookForm({ ...bookForm, title: e.target.value }); if (bookErrors.title) setBookErrors({ ...bookErrors, title: undefined }) }}
                                                className={`w-full border ${bookErrors.title ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                            {bookErrors.title && <p className="text-xs text-red-500 mt-1">{bookErrors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">ISBN</label>
                                            <input value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Año de publicación</label>
                                            <input type="number" value={bookForm.publishedYear} onChange={e => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Género</label>
                                            <input value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Páginas</label>
                                            <input type="number" value={bookForm.pages} onChange={e => { setBookForm({ ...bookForm, pages: e.target.value }); if (bookErrors.pages) setBookErrors({ ...bookErrors, pages: undefined }) }}
                                                className={`w-full border ${bookErrors.pages ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                            {bookErrors.pages && <p className="text-xs text-red-500 mt-1">{bookErrors.pages}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                                        <textarea value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" rows={2} />
                                    </div>
                                    <button type="submit" disabled={saving}
                                        className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50">
                                        {saving ? 'Guardando...' : 'Crear Libro'}
                                    </button>
                                </form>
                            )}

                            <div className="space-y-1">
                                {books.map(book => (
                                    <div key={book.id} className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-medium text-sm text-slate-900 truncate">{book.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                                                {book.publishedYear && <span>{book.publishedYear}</span>}
                                                {book.genre && <><span className="text-slate-300">·</span><span className="px-1.5 py-0.5 bg-slate-100 rounded">{book.genre}</span></>}
                                                {book.pages && <><span className="text-slate-300">·</span><span>{book.pages} pág</span></>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteBook(book.id)}
                                            className="px-2.5 py-1 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex-shrink-0">
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                                {books.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">No hay libros registrados</p>
                                        <p className="text-slate-400 text-xs mt-1">Agrega un libro usando el botón superior</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-base font-semibold text-slate-900 mb-5">Estadísticas</h3>
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <span className="text-sm text-slate-600">Total de libros</span>
                                        <span className="text-2xl font-bold text-slate-900">{stats.totalBooks}</span>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <span className="text-sm text-slate-600">Promedio de páginas</span>
                                        <span className="text-lg font-semibold text-slate-900">{stats.averagePages}</span>
                                    </div>

                                    <div className="pb-4 border-b border-slate-100">
                                        <span className="text-sm text-slate-600 block mb-2">Géneros</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {stats.genres.length > 0 ? stats.genres.map(g => (
                                                <span key={g} className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700">{g}</span>
                                            )) : <span className="text-xs text-slate-400">Sin géneros</span>}
                                        </div>
                                    </div>

                                    {stats.firstBook && (
                                        <div className="pb-4 border-b border-slate-100">
                                            <span className="text-sm text-slate-600 block mb-1">Primer libro</span>
                                            <p className="text-sm font-medium text-slate-900">{stats.firstBook.title}</p>
                                            <p className="text-xs text-slate-500">{stats.firstBook.year}</p>
                                        </div>
                                    )}

                                    {stats.latestBook && (
                                        <div className="pb-4 border-b border-slate-100">
                                            <span className="text-sm text-slate-600 block mb-1">Último libro</span>
                                            <p className="text-sm font-medium text-slate-900">{stats.latestBook.title}</p>
                                            <p className="text-xs text-slate-500">{stats.latestBook.year}</p>
                                        </div>
                                    )}

                                    {stats.longestBook && (
                                        <div className="pb-4 border-b border-slate-100">
                                            <span className="text-sm text-slate-600 block mb-1">Libro más extenso</span>
                                            <p className="text-sm font-medium text-slate-900">{stats.longestBook.title}</p>
                                            <p className="text-xs text-slate-500">{stats.longestBook.pages} páginas</p>
                                        </div>
                                    )}

                                    {stats.shortestBook && (
                                        <div>
                                            <span className="text-sm text-slate-600 block mb-1">Libro más corto</span>
                                            <p className="text-sm font-medium text-slate-900">{stats.shortestBook.title}</p>
                                            <p className="text-xs text-slate-500">{stats.shortestBook.pages} páginas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
