import { useEffect, useState } from 'react'
import {
  getAllBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../../lib/queries'
import type { BlogPost } from '../../lib/database.types'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    getAllBlogPostsAdmin()
      .then(setPosts)
      .catch(() => setError('Could not load blog posts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent, publishNow: boolean) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) {
      alert('Please fill in title, author, and content.')
      return
    }
    setCreating(true)
    try {
      await createBlogPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        author: newAuthor.trim(),
        published: publishNow,
      })
      setNewTitle('')
      setNewAuthor('')
      setNewContent('')
      load()
    } catch {
      alert('Could not create post.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditAuthor(post.author)
    setEditContent(post.content)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    try {
      await updateBlogPost(id, {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        content: editContent.trim(),
      })
      setEditingId(null)
      load()
    } catch {
      alert('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublished(post: BlogPost) {
    try {
      await updateBlogPost(post.id, { published: !post.published })
      load()
    } catch {
      alert('Could not update post.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await deleteBlogPost(id)
      load()
    } catch {
      alert('Could not delete post.')
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading posts...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Blog</h2>

      <form className="border border-gray-200 rounded-lg p-4 mb-6 space-y-2">
        <p className="font-semibold text-sm">Write a new post</p>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <textarea
          placeholder="Write your post here..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={6}
        />
        <div className="flex gap-2">
          <button
            onClick={(e) => handleCreate(e, false)}
            disabled={creating}
            className="text-sm font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={(e) => handleCreate(e, true)}
            disabled={creating}
            className="bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === post.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={6}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(post.id)}
                    disabled={saving}
                    className="bg-brand-red text-white text-sm font-semibold px-3 py-1.5 rounded-md hover:opacity-90"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 px-3 py-1.5">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-xs text-gray-400">by {post.author}</p>
                  </div>
                  <span
                    className={
                      'text-xs font-semibold px-2 py-0.5 rounded ' +
                      (post.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')
                    }
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.content}</p>
                <div className="flex gap-3 text-sm mt-2">
                  <button onClick={() => startEdit(post)} className="text-brand-red hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleTogglePublished(post)} className="text-gray-500 hover:underline">
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:underline">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
