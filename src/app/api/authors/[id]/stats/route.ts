import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const author = await prisma.author.findUnique({
            where: { id },
            include: { books: true },
        })

        if (!author) {
            return NextResponse.json(
                { error: 'Autor no encontrado' },
                { status: 404 }
            )
        }

        type BookItem = { title: string; publishedYear: number | null; genre: string | null; pages: number | null }

        const books = author.books as BookItem[]
        const totalBooks = books.length
        const years = books.filter(b => b.publishedYear).map(b => b.publishedYear!)
        const pages = books.filter(b => b.pages).map(b => b.pages!)
        const genres = [...new Set(books.filter(b => b.genre).map(b => b.genre!))]

        const firstBook = years.length > 0
            ? books.find(b => b.publishedYear === Math.min(...years))
            : null

        const latestBook = years.length > 0
            ? books.find(b => b.publishedYear === Math.max(...years))
            : null

        const averagePages = pages.length > 0
            ? Math.round(pages.reduce((a, b) => a + b, 0) / pages.length)
            : 0

        const longestBook = pages.length > 0
            ? books.find(b => b.pages === Math.max(...pages))
            : null

        const shortestBook = pages.length > 0
            ? books.find(b => b.pages === Math.min(...pages))
            : null

        return NextResponse.json({
            authorId: author.id,
            authorName: author.name,
            totalBooks,
            firstBook: firstBook
                ? { title: firstBook.title, year: firstBook.publishedYear }
                : null,
            latestBook: latestBook
                ? { title: latestBook.title, year: latestBook.publishedYear }
                : null,
            averagePages,
            genres,
            longestBook: longestBook
                ? { title: longestBook.title, pages: longestBook.pages }
                : null,
            shortestBook: shortestBook
                ? { title: shortestBook.title, pages: shortestBook.pages }
                : null,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}
