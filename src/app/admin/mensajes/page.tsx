"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Search,
  Loader2,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  MessageSquare,
  Archive,
} from "lucide-react";
import {
  getAllContactMessages,
  updateContactMessage,
  deleteContactMessage,
  getContactMessageStats,
} from "@/lib/supabase/contact";
import type { ContactMessage, MessageStatus, ContactMessageStats } from "@/types/contact";

const MensajesPage = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactMessageStats>({
    total: 0,
    pending: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login");
    } else {
      loadData();
    }
  }, [isAuthenticated, isAdmin, router]);

  const filterMessages = useCallback(() => {
    let filtered = messages;

    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter]);

  useEffect(() => {
    filterMessages();
  }, [filterMessages]);

  const loadData = async () => {
    setIsLoading(true);
    const [messagesData, statsData] = await Promise.all([
      getAllContactMessages(),
      getContactMessageStats(),
    ]);
    setMessages(messagesData);
    setStats(statsData);
    setIsLoading(false);
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setAdminNotes(message.admin_notes || "");
    setIsDialogOpen(true);

    // Mark as read if it's pending
    if (message.status === "pending") {
      handleStatusChange(message.id, "read");
    }
  };

  const handleStatusChange = async (id: string, newStatus: MessageStatus) => {
    const result = await updateContactMessage(id, { status: newStatus });
    if (result.success) {
      loadData();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;

    const result = await updateContactMessage(selectedMessage.id, {
      admin_notes: adminNotes,
    });

    if (result.success) {
      loadData();
      setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) return;

    const result = await deleteContactMessage(id);
    if (result.success) {
      loadData();
      setIsDialogOpen(false);
    }
  };

  const getStatusBadge = (status: MessageStatus) => {
    const variants: Record<MessageStatus, { color: string; icon: React.ReactElement }> = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <Clock className="h-3 w-3" />,
      },
      read: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <Eye className="h-3 w-3" />,
      },
      replied: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      archived: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        icon: <Archive className="h-3 w-3" />,
      },
    };

    const variant = variants[status];
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        {variant.icon}
        {status === "pending" && "Pendiente"}
        {status === "read" && "Leído"}
        {status === "replied" && "Respondido"}
        {status === "archived" && "Archivado"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Mensajes de Contacto</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Leídos</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.read}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Respondidos</p>
              <p className="text-2xl font-semibold text-green-600">{stats.replied}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Archivados</p>
              <p className="text-2xl font-semibold text-gray-600">{stats.archived}</p>
            </div>
            <Archive className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, asunto o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MessageStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="read">Leídos</SelectItem>
            <SelectItem value="replied">Respondidos</SelectItem>
            <SelectItem value="archived">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No se encontraron mensajes
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(message.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Mensaje</DialogTitle>
            <DialogDescription>
              {selectedMessage && formatDate(selectedMessage.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Nombre</Label>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <Label className="text-sm font-semibold">Teléfono</Label>
                    <p className="text-sm">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold">Asunto</Label>
                  <p className="text-sm">{selectedMessage.subject}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-semibold">Mensaje</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Estado</Label>
                <Select
                  value={selectedMessage.status}
                  onValueChange={(value) =>
                    handleStatusChange(selectedMessage.id, value as MessageStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="read">Leído</SelectItem>
                    <SelectItem value="replied">Respondido</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Notas Internas</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agregar notas internas (no visibles para el cliente)..."
                  rows={4}
                />
                <Button
                  onClick={handleSaveNotes}
                  className="mt-2 bg-[#D4AF37] hover:bg-[#B8941E]"
                  size="sm"
                >
                  Guardar Notas
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MensajesPage;
