import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatRupiah, openWhatsApp } from '../../utils/formatters';
import {
  Users,
  Plus,
  Search,
  Smartphone,
  Trash2,
  Edit2,
  Download,
  MapPin,
  Calendar,
} from 'lucide-react';

export const CustomersMasterView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, exportSheetAsCSV } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address);
    setNotes(c.notes);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateCustomer(editingId, { name, phone, address, notes });
    } else {
      addCustomer({ name, phone, address, notes });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID, nama pelanggan, no. HP, atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSheetAsCSV('customers')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Nama Pelanggan</th>
                <th className="px-5 py-3.5 font-semibold">No. WhatsApp / HP</th>
                <th className="px-5 py-3.5 font-semibold">Alamat</th>
                <th className="px-5 py-3.5 font-semibold">Catatan Khusus</th>
                <th className="px-5 py-3.5 font-semibold">Pesanan</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-cyan-700">{c.id}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-800">{c.phone || '-'}</span>
                      {c.phone && (
                        <button
                          onClick={() => openWhatsApp(c.phone, `Halo Kak ${c.name}, salam dari tim laundry kami! ✨`)}
                          className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                          title="Chat WhatsApp"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{c.address || '-'}</td>
                  <td className="px-5 py-3.5 text-amber-800 italic max-w-xs truncate">
                    {c.notes || '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900">{c.totalOrders} order</span>
                    <div className="text-[10px] text-slate-500">{formatRupiah(c.totalSpent)}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">
                {editingId ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Ratna Dewi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jl. Merpati No. 12, RT 02/05"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Preferensi Laundry
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Suka aroma sakura, kemeja gantung pakai hanger"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
