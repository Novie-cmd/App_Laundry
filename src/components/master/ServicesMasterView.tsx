import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, ServiceCategory, ServiceUnit } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Layers, Plus, Edit2, Trash2, Clock, CheckCircle2, XCircle, Download } from 'lucide-react';

export const ServicesMasterView: React.FC = () => {
  const { services, addService, updateService, deleteService, exportSheetAsCSV } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('kiloan');
  const [price, setPrice] = useState<number>(8000);
  const [unit, setUnit] = useState<ServiceUnit>('kg');
  const [estimateHours, setEstimateHours] = useState<number>(48);
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('kiloan');
    setPrice(8000);
    setUnit('kg');
    setEstimateHours(48);
    setActive(true);
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingId(s.id);
    setName(s.name);
    setCategory(s.category);
    setPrice(s.price);
    setUnit(s.unit);
    setEstimateHours(s.estimateHours);
    setActive(s.active);
    setDescription(s.description);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateService(editingId, {
        name,
        category,
        price,
        unit,
        estimateHours,
        active,
        description,
      });
    } else {
      addService({
        name,
        category,
        price,
        unit,
        estimateHours,
        active,
        description,
      });
    }

    setShowModal(false);
  };

  const handleToggleActive = (s: Service) => {
    updateService(s.id, { active: !s.active });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            Daftar Layanan Laundry & Tarif Harga
          </h3>
          <p className="text-xs text-slate-500">
            Atur jenis cucian kiloan, satuan, express, tarif per kg/pcs, dan estimasi waktu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSheetAsCSV('services')}
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
            Tambah Layanan Baru
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Nama Layanan</th>
                <th className="px-5 py-3.5 font-semibold">Kategori</th>
                <th className="px-5 py-3.5 font-semibold">Tarif / Harga</th>
                <th className="px-5 py-3.5 font-semibold">Estimasi Selesai</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-500">{s.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.description}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 uppercase">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-extrabold text-cyan-700 text-sm">
                    {formatRupiah(s.price)}
                    <span className="text-[10px] font-normal text-slate-500"> / {s.unit}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.estimateHours} Jam (
                      {s.estimateHours >= 24
                        ? `${Math.round(s.estimateHours / 24)} Hari`
                        : `${s.estimateHours} Jam`}
                      )
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {s.active ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-500" />
                      )}
                      {s.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Layanan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteService(s.id)}
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

      {/* Modal CRUD Service */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">
                {editingId ? 'Edit Layanan Laundry' : 'Tambah Layanan Laundry Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Layanan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cuci + Setrika Reguler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Layanan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="kiloan">Laundry Kiloan</option>
                    <option value="satuan">Laundry Satuan</option>
                    <option value="express">Express / Kilat</option>
                    <option value="setrika">Setrika Saja</option>
                    <option value="custom">Custom / Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ServiceUnit)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="kg">Per Kilogram (Kg)</option>
                    <option value="pcs">Per Buah / Pcs</option>
                    <option value="pasang">Per Pasang</option>
                    <option value="meter">Per Meter Persegi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga / Tarif (Rp) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimasi Selesai (Jam) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimateHours}
                    onChange={(e) => setEstimateHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Cuci bersih, pewangi premium, setrika uap rapi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700">
                  Layanan Aktif (Tampil di Kasir POS)
                </label>
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
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
