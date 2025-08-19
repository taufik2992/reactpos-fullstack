import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { FileUpload } from "../../components/ui/FileUpload";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/Table";
import { userAPI } from "../../services/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  nama: string;
  email: string;
  role: "admin" | "cashier";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "cashier" as "admin" | "cashier",
    password: "",
    avatar: null as File | null,
    avatarPreview: "",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      nama: "",
      email: "",
      role: "cashier",
      password: "",
      avatar: null,
      avatarPreview: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      email: user.email,
      role: user.role,
      password: "",
      avatar: null,
      avatarPreview: user.avatar || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        await userAPI.delete(id);
        setUsers((users) => users.filter((user) => user._id !== id));
        toast.success("Pengguna berhasil dihapus!");
      } catch (error) {
        toast.error("Gagal menghapus pengguna");
      }
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const response = await userAPI.toggleStatus(id);
      if (response.data.success) {
        setUsers((users) =>
          users.map((user) =>
            user._id === id ? { ...user, isActive: !user.isActive } : user
          )
        );
        toast.success("Status pengguna berhasil diperbarui!");
      }
    } catch (error) {
      toast.error("Gagal mengubah status pengguna");
    }
  };

  const handleAvatarUpload = (file: File | null, dataUrl: string) => {
    setFormData({ ...formData, avatar: file, avatarPreview: dataUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("role", formData.role);

      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }

      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      if (editingUser) {
        const response = await userAPI.update(editingUser._id, formDataToSend);
        if (response.data.success) {
          setUsers((users) =>
            users.map((user) =>
              user._id === editingUser._id ? response.data.user : user
            )
          );
          toast.success("Pengguna berhasil diperbarui!");
        }
      } else {
        const response = await userAPI.create(formDataToSend);
        if (response.data.success) {
          setUsers((users) => [...users, response.data.user]);
          toast.success("Pengguna berhasil ditambahkan!");
        }
      }

      setIsModalOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Operasi gagal";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Pengguna
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Kelola staff dan akses pengguna
          </p>
        </div>
        <Button onClick={handleAdd} icon={Plus} className="w-full sm:w-auto">
          Tambah Pengguna Baru
        </Button>
      </div>

      <Card>
        <div className="mb-4 sm:mb-6">
          <Input
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari pengguna..."
            icon={Search}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Pengguna</TableCell>
              <TableCell header className="hidden sm:table-cell">
                Role
              </TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header className="hidden md:table-cell">
                Login Terakhir
              </TableCell>
              <TableCell header className="text-right">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                        src={user.avatar}
                        alt={user.nama}
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.nama}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </div>
                      <div className="sm:hidden">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "Kasir"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "Kasir"}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleUserStatus(user._id)}
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <ToggleRight className="w-3 h-3 mr-1" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3 h-3 mr-1" />
                        Nonaktif
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("id-ID")
                    : "Belum pernah"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      icon={Edit}
                      className="text-xs"
                    >
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(user._id)}
                        icon={Trash2}
                        className="text-xs"
                      >
                        <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada pengguna ditemukan
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={formData.nama}
            onChange={(value) => setFormData({ ...formData, nama: value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "admin" | "cashier",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="cashier">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Input
            label={
              editingUser
                ? "Password Baru (kosongkan jika tidak diubah)"
                : "Password"
            }
            type="password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            required={!editingUser}
          />

          <FileUpload
            label="Avatar"
            value={formData.avatarPreview}
            onChange={handleAvatarUpload}
          />

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting
                ? "Menyimpan..."
                : editingUser
                ? "Perbarui"
                : "Tambah"}{" "}
              Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
