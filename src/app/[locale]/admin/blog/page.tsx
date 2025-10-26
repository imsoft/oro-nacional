"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { getAllBlogPosts, deleteBlogPost } from "@/lib/supabase/blog";
import type { BlogPostListItem } from "@/types/blog";

export default function BlogAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPostListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar posts al montar el componente
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal de confirmación
  const handleDeleteClick = (post: BlogPostListItem) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteBlogPost(postToDelete.id);

      if (success) {
        // Recargar la lista de posts
        await loadPosts();
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        alert("Error al eliminar el post. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error al eliminar el post. Por favor intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tus publicaciones de blog
          </p>
        </div>
        <Link href="/admin/blog/nuevo">
          <Button className="bg-[#D4AF37] hover:bg-[#B8941E] text-white">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Publicación
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar publicaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No se encontraron posts con ese término de búsqueda"
                : "No hay posts aún. ¡Crea tu primer post!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground max-w-xs truncate">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {post.category_name || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {post.author_name || "Anónimo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.published_at || post.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="mr-1 h-4 w-4" />
                        {post.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blog/${post.id}/editar`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Total Posts</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {posts.length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Publicados</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {posts.filter((p) => p.status === "published").length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Borradores</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {posts.filter((p) => p.status === "draft").length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Vistas Totales</div>
          <div className="mt-2 text-3xl font-bold text-[#D4AF37]">
            {posts.reduce((sum, p) => sum + p.views, 0)}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Eliminar Post
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              <p>
                ¿Estás seguro de que deseas eliminar el post{" "}
                <span className="font-semibold text-foreground">
                  {postToDelete?.title}
                </span>
                ?
              </p>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción eliminará permanentemente el
                  post, incluyendo todos sus comentarios, imágenes y metadata. Esta
                  acción no se puede deshacer.
                </p>
              </div>
              {postToDelete && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Categoría:</div>
                    <div className="font-medium">
                      {postToDelete.category_name || "Sin categoría"}
                    </div>
                    <div className="text-muted-foreground">Estado:</div>
                    <div className="font-medium">
                      {postToDelete.status === "published" ? "Publicado" : "Borrador"}
                    </div>
                    <div className="text-muted-foreground">Vistas:</div>
                    <div className="font-medium">{postToDelete.views}</div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Post
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
