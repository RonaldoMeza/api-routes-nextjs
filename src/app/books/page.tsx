'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

type Book = {
    id: string
    title: string
    description: string | null
    isbn: string | null
    publishedYear: number | null
    genre: string | null
    pages: number | null
    authorId: string
    author: { id: string; name: string; email: string }
    createdAt: string
}

type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

type FormErrors = { title?: string; authorId?: string; isbn?: string; pages?: string }

export default function BooksPage() {
    const { toast } = useToast()
    const [books, setBooks] = useState<Book[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [genre, setGenre] = useState('')
    const [authorName, setAuthorName] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState('desc')
    const [page, setPage] = useState(1)
    const [genres, setGenres] = useState<string[]>([])
    const [authors, setAuthors] = useState<{ id: string; name: string }[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })
    const [errors, setErrors] = useState<FormErrors>({})

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (genre) params.set('genre', genre)
        if (authorName) params.set('authorName', authorName)
        params.set('sortBy', sortBy)
        params.set('order', order)
        params.set('page', page.toString())
        params.set('limit', '5')
        const res = await fetch(`/api/books/search?${params}`)
        const data = await res.json()
        setBooks(data.data)
        setPagination(data.pagination)
        setLoading(false)
    }, [search, genre, authorName, sortBy, order, page])

    useEffect(() => { fetchBooks() }, [fetchBooks])

    useEffect(() => {
        Promise.all([
            fetch('/api/books').then(r => r.json()),
            fetch('/api/authors').then(r => r.json()),
        ]).then(([booksData, authorsData]) => {
            const g = [...new Set(booksData.map((b: any) => b.genre).filter(Boolean))] as string[]
            setGenres(g.sort())
            setAuthors(authorsData.map((a: any) => ({ id: a.id, name: a.name })))
        })
    }, [])

    const validate = () => {
        const e: FormErrors = {}
        if (!form.title.trim()) e.title = 'El título es obligatorio'
        else if (form.title.trim().length < 3) e.title = 'Mínimo 3 caracteres'
        if (!form.authorId) e.authorId = 'Selecciona un autor'
        if (form.isbn && !/^[\d-]+$/.test(form.isbn)) e.isbn = 'ISBN inválido'
        if (form.pages && (parseInt(form.pages) < 1)) e.pages = 'Debe ser mayor a 0'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSaving(true)
        const method = editing ? 'PUT' : 'POST'
        const url = editing ? `/api/books/${editing}` : '/api/books'
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            toast(editing ? 'Libro actualizado correctamente' : 'Libro creado correctamente', 'success')
            setForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })
            setErrors({})
            setShowForm(false)
            setEditing(null)
            fetchBooks()
        } else {
            const data = await res.json()
            toast(data.error || 'Error al guardar libro', 'error')
        }
        setSaving(false)
    }

    const handleEdit = (book: Book) => {
        setForm({
            title: book.title,
            description: book.description || '',
            isbn: book.isbn || '',
            publishedYear: book.publishedYear?.toString() || '',
            genre: book.genre || '',
            pages: book.pages?.toString() || '',
            authorId: book.authorId,
        })
        setEditing(book.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este libro?')) return
        const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
        if (res.ok) {
            toast('Libro eliminado correctamente', 'success')
            fetchBooks()
        } else {
            toast('Error al eliminar libro', 'error')
        }
    }

    const cancelForm = () => {
        setShowForm(false)
        setEditing(null)
        setForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })
        setErrors({})
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">L</span>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900">Libros</h1>
                    </div>
                    <nav className="flex gap-1">
                        <Link href="/" className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors">Dashboard</Link>
                        <Link href="/books" className="px-3 py-2 text-sm font-medium text-slate-900 bg-amber-100 text-amber-800 rounded-md">Libros</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Buscar Libros</h2>
                        {pagination && <p className="text-sm text-slate-500 mt-0.5">{pagination.total} resultados encontrados</p>}
                    </div>
                    <button onClick={() => showForm ? cancelForm() : setShowForm(true)}
                        className="px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm">
                        {showForm ? 'Cancelar' : '+ Nuevo Libro'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
                        <h3 className="text-base font-medium text-slate-900 mb-4">{editing ? 'Editar Libro' : 'Nuevo Libro'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
                                <input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: undefined }) }}
                                    className={`w-full border ${errors.title ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Autor *</label>
                                <select value={form.authorId} onChange={e => { setForm({ ...form, authorId: e.target.value }); if (errors.authorId) setErrors({ ...errors, authorId: undefined }) }}
                                    className={`w-full border ${errors.authorId ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors bg-white`}>
                                    <option value="">Seleccionar autor</option>
                                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                {errors.authorId && <p className="text-xs text-red-500 mt-1">{errors.authorId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">ISBN</label>
                                <input value={form.isbn} onChange={e => { setForm({ ...form, isbn: e.target.value }); if (errors.isbn) setErrors({ ...errors, isbn: undefined }) }}
                                    className={`w-full border ${errors.isbn ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Año de publicación</label>
                                <input type="number" value={form.publishedYear} onChange={e => setForm({ ...form, publishedYear: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Género</label>
                                <input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Páginas</label>
                                <input type="number" value={form.pages} onChange={e => { setForm({ ...form, pages: e.target.value }); if (errors.pages) setErrors({ ...errors, pages: undefined }) }}
                                    className={`w-full border ${errors.pages ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors`} />
                                {errors.pages && <p className="text-xs text-red-500 mt-1">{errors.pages}</p>}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" rows={2} />
                        </div>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : editing ? 'Actualizar Libro' : 'Crear Libro'}
                        </button>
                    </form>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input placeholder="Buscar por título..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors" />
                        </div>
                        <select value={genre} onChange={e => { setGenre(e.target.value); setPage(1) }}
                            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors bg-white">
                            <option value="">Todos los géneros</option>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={authorName} onChange={e => { setAuthorName(e.target.value); setPage(1) }}
                            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors bg-white">
                            <option value="">Todos los autores</option>
                            {authors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors bg-white">
                            <option value="createdAt">Fecha de creación</option>
                            <option value="title">Título</option>
                            <option value="publishedYear">Año publicación</option>
                        </select>
                        <button onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')}
                            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                            {order === 'asc' ? 'Ascendente' : 'Descendente'}
                            <svg className={`w-3.5 h-3.5 transition-transform ${order === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin" />
                    </div>
                )}

                {!loading && (
                    <div className="space-y-2">
                        {books.map(book => (
                            <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-medium text-slate-900 truncate">{book.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500 flex-wrap">
                                        <Link href={`/authors/${book.author.id}`} className="hover:text-slate-700 transition-colors">{book.author.name}</Link>
                                        {book.publishedYear && <><span className="text-slate-300">·</span><span>{book.publishedYear}</span></>}
                                        {book.genre && <><span className="text-slate-300">·</span><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{book.genre}</span></>}
                                        {book.pages && <><span className="text-slate-300">·</span><span>{book.pages} pág</span></>}
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button onClick={() => handleEdit(book)}
                                        className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(book.id)}
                                        className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                        {books.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">No se encontraron libros</p>
                                <p className="text-slate-400 text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        )}
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
                            ← Anterior
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                                .map((p, idx, arr) => (
                                    <span key={p} className="flex items-center">
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                                        <button onClick={() => setPage(p)}
                                            className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${p === pagination.page ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                            {p}
                                        </button>
                                    </span>
                                ))}
                        </div>
                        <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}
                            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
                            Siguiente →
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
