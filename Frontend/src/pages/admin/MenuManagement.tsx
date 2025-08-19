import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { FileUpload } from "../../components/ui/FileUpload";
import { MenuItem } from "../../types";
import { menuAPI, formatIDR } from "../../services/api";
import toast from "react-hot-toast";

export const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
    imagePreview: "",
    stock: "",
  });

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      toast.error("Gagal memuat item menu");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: null,
      imagePreview: "",
      stock: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: null,
      imagePreview: item.image,
      stock: item.stock.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await menuAPI.delete(id);
        setMenuItems((items) => items.filter((item) => item.id !== id));
        toast.success("Item berhasil dihapus!");
      } catch (error) {
        toast.error("Gagal menghapus item");
      }
    }
  };

  const handleImageUpload = (file: File | null, dataUrl: string) => {
    setFormData({ ...formData, image: file, imagePreview: dataUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingItem) {
        const response = await menuAPI.update(editingItem.id, formDataToSend);
        if (response.data.success) {
          setMenuItems((items) =>
            items.map((item) =>
              item.id === editingItem.id ? response.data.menuItem : item
            )
          );
          toast.success("Item berhasil diperbarui!");
        }
      } else {
        const response = await menuAPI.create(formDataToSend);
        if (response.data.success) {
          setMenuItems((items) => [...items, response.data.menuItem]);
          toast.success("Item berhasil ditambahkan!");
        }
      }

      setIsModalOpen(false);
      loadCategories(); // Reload categories in case new one was added
    } catch (error: any) {
      const message = error.response?.data?.message || "Operasi gagal";
      toast.error(message);
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
            Manajemen Menu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Kelola item menu restoran Anda
          </p>
        </div>
        <Button onClick={handleAdd} icon={Plus} className="w-full sm:w-auto">
          Tambah Item Baru
        </Button>
      </div>

      <Card>
        <div className="mb-4 sm:mb-6">
          <Input
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari item menu..."
            icon={Search}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow duration-200"
              padding="sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4"
              />
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-amber-600">
                    {formatIDR(item.price)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.stock < 10
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    Stok: {item.stock}
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    icon={Edit}
                    className="flex-1 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(item.id)}
                    icon={Trash2}
                    className="flex-1 text-xs"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada item menu ditemukan
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Item Menu" : "Tambah Item Menu Baru"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />

          <Input
            label="Deskripsi"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Harga (IDR)"
              type="number"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: value })}
              required
            />

            <Input
              label="Stok"
              type="number"
              value={formData.stock}
              onChange={(value) => setFormData({ ...formData, stock: value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <FileUpload
            label="Gambar Item"
            value={formData.imagePreview}
            onChange={handleImageUpload}
            required={!editingItem}
          />

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {editingItem ? "Perbarui" : "Tambah"} Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
